/**
 * Semantic Learning Intelligence — Semantic Intelligence Engine
 * Deterministic reasoning layer that explains WHY concepts connect.
 * No LLM. No probabilistic inference. Structured knowledge only.
 *
 * NV-1100 Phase 7 — Semantic Intelligence Workbench
 */
(function () {
  'use strict';

  function getEngine() {
    return window.NeuralVerse?.SemanticEngine || null;
  }

  function getNeighborhood() {
    return window.NeuralVerse?.SemanticNeighborhood || null;
  }

  function getTraversal() {
    return window.NeuralVerse?.SemanticTraversal || null;
  }

  function getDependencyResolver() {
    return window.NeuralVerse?.DependencyResolver || null;
  }

  function getRecommendations() {
    return window.NeuralVerse?.RecommendationEngine || null;
  }

  /* ─── Relationship Reason Templates ──────────────────── */

  var REASON_TEMPLATES = {
    prerequisite: [
      'Prerequisite knowledge required before understanding this concept.',
      'Foundational concept that enables this topic.',
      'Required background for deeper exploration.'
    ],
    dependent: [
      'Builds directly upon this concept.',
      'Concept extends or applies this knowledge.',
      'Downstream application of this foundation.'
    ],
    related_to: [
      'Shares conceptual overlap in the knowledge domain.',
      'Frequently discussed together in AI literature.',
      'Connected through shared theoretical foundations.'
    ],
    depends_on: [
      'Operational dependency — this concept requires the other.',
      'Functionally coupled through shared mechanisms.',
      'Used together in practical implementations.'
    ]
  };

  function getReason(relationshipType, conceptName, relatedName) {
    var templates = REASON_TEMPLATES[relationshipType] || REASON_TEMPLATES.related_to;
    var idx = Math.abs(hashCode(conceptName + relatedName)) % templates.length;
    return templates[idx];
  }

  function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  /* ─── Semantic Explanation Layer ──────────────────────── */

  function generateExplanation(conceptId) {
    var engine = getEngine();
    if (!engine) return null;

    var concept = engine.getConcept(conceptId);
    if (!concept) return null;

    var related = engine.getRelatedConcepts(conceptId);
    var prereqs = engine.getPrerequisites(conceptId);
    var deps = engine.getDependents(conceptId);
    var domains = engine.getSharedKnowledgeDomains(conceptId);

    // Determine importance based on relationship density
    var importance = 'Supporting concept';
    if (deps.length >= 3) importance = 'Core foundational concept';
    else if (deps.length >= 1) importance = 'Building block for advanced topics';
    else if (prereqs.length >= 2) importance = 'Advanced integration concept';
    else if (related.length >= 3) importance = 'Well-connected concept';

    // Determine role
    var role = 'Conceptual unit';
    if (prereqs.length > 0 && deps.length > 0) role = 'Bridge concept';
    else if (prereqs.length === 0 && deps.length > 0) role = 'Foundational concept';
    else if (prereqs.length > 0 && deps.length === 0) role = 'Leaf concept';
    else if (related.length > 2) role = 'Hub concept';

    // Determine domain
    var domain = concept.category || 'Unclassified';
    if (domains.length > 0) {
      domain = domains.map(function (d) { return d.id; }).join(', ');
    }

    // Determine learning stage
    var stage = 'Intermediate';
    if (prereqs.length === 0 && deps.length === 0) stage = 'Entry point';
    else if (prereqs.length === 0 && deps.length > 0) stage = 'Foundational';
    else if (prereqs.length > 0 && deps.length === 0) stage = 'Advanced';
    else if (prereqs.length > 0 && deps.length > 0) stage = 'Intermediate';

    return {
      importance: importance,
      role: role,
      domain: domain,
      stage: stage,
      summary: concept.summary || '',
      keywords: concept.keywords || [],
      aliases: concept.aliases || [],
      relationshipDensity: related.length + prereqs.length + deps.length
    };
  }

  /* ─── Relationship Reasoning ──────────────────────────── */

  function generateRelationshipReasons(conceptId) {
    var engine = getEngine();
    if (!engine) return [];

    var concept = engine.getConcept(conceptId);
    if (!concept) return [];

    var reasons = [];

    var prereqs = engine.getPrerequisites(conceptId);
    for (var i = 0; i < prereqs.length; i++) {
      reasons.push({
        conceptId: prereqs[i].id,
        conceptName: prereqs[i].name,
        type: 'prerequisite',
        reason: getReason('prerequisite', concept.name, prereqs[i].name),
        direction: 'incoming',
        icon: '←'
      });
    }

    var deps = engine.getDependents(conceptId);
    for (var j = 0; j < deps.length; j++) {
      reasons.push({
        conceptId: deps[j].id,
        conceptName: deps[j].name,
        type: 'dependent',
        reason: getReason('dependent', concept.name, deps[j].name),
        direction: 'outgoing',
        icon: '→'
      });
    }

    var related = engine.getRelatedConcepts(conceptId);
    for (var k = 0; k < related.length; k++) {
      reasons.push({
        conceptId: related[k].id,
        conceptName: related[k].name,
        type: related[k].relationshipType || 'related_to',
        reason: getReason(related[k].relationshipType || 'related_to', concept.name, related[k].name),
        direction: 'bidirectional',
        icon: '↔'
      });
    }

    return reasons;
  }

  /* ─── Semantic Distance ───────────────────────────────── */

  function calculateSemanticDistance(conceptId1, conceptId2) {
    var engine = getEngine();
    var neighborhood = getNeighborhood();
    if (!engine || !neighborhood) return null;

    var c1 = engine.getConcept(conceptId1);
    var c2 = engine.getConcept(conceptId2);
    if (!c1 || !c2) return null;

    // Direct relationship check
    var related1 = engine.getRelatedConcepts(conceptId1);
    var prereqs1 = engine.getPrerequisites(conceptId1);
    var deps1 = engine.getDependents(conceptId1);

    var directLink = false;
    var linkType = '';

    for (var i = 0; i < related1.length; i++) {
      if (related1[i].id === conceptId2) {
        directLink = true;
        linkType = related1[i].relationshipType || 'related_to';
        break;
      }
    }
    if (!directLink) {
      for (var j = 0; j < prereqs1.length; j++) {
        if (prereqs1[j].id === conceptId2) {
          directLink = true;
          linkType = 'prerequisite';
          break;
        }
      }
    }
    if (!directLink) {
      for (var k = 0; k < deps1.length; k++) {
        if (deps1[k].id === conceptId2) {
          directLink = true;
          linkType = 'dependent';
          break;
        }
      }
    }

    // Shared category bonus
    var categoryBonus = (c1.category && c1.category === c2.category) ? 0.15 : 0;

    // Calculate similarity
    var similarity;
    var distance;
    var label;

    if (directLink) {
      similarity = 0.85 + categoryBonus;
      distance = 1 - similarity;
      label = 'Direct';
    } else {
      // Check shared neighbors (2-hop)
      var nh1 = neighborhood.getNeighborhood(conceptId1, 1);
      var nh2 = neighborhood.getNeighborhood(conceptId2, 1);
      var shared = 0;
      if (nh1 && nh2) {
        var ids1 = {};
        for (var n = 0; n < nh1.neighbors.length; n++) ids1[nh1.neighbors[n].id] = true;
        for (var m = 0; m < nh2.neighbors.length; m++) {
          if (ids1[nh2.neighbors[m].id]) shared++;
        }
      }

      if (shared > 0) {
        similarity = 0.4 + (shared * 0.1) + categoryBonus;
        distance = 1 - similarity;
        label = 'Shared context';
      } else if (c1.category && c1.category === c2.category) {
        similarity = 0.35 + categoryBonus;
        distance = 1 - similarity;
        label = 'Same domain';
      } else {
        similarity = 0.15;
        distance = 0.85;
        label = 'Distant';
      }
    }

    return {
      similarity: Math.min(similarity, 0.99),
      distance: Math.max(distance, 0.01),
      label: label,
      directLink: directLink,
      linkType: linkType,
      sameCategory: c1.category === c2.category,
      deterministic: true
    };
  }

  /* ─── Shared Knowledge ────────────────────────────────── */

  function findSharedKnowledge(conceptId1, conceptId2) {
    var engine = getEngine();
    if (!engine) return { shared: [], unique1: [], unique2: [] };

    var c1 = engine.getConcept(conceptId1);
    var c2 = engine.getConcept(conceptId2);
    if (!c1 || !c2) return { shared: [], unique1: [], unique2: [] };

    var domains1 = {};
    var domains2 = {};

    for (var i = 0; i < c1.sharedKnowledgeDomains.length; i++) {
      domains1[c1.sharedKnowledgeDomains[i]] = true;
    }
    for (var j = 0; j < c2.sharedKnowledgeDomains.length; j++) {
      domains2[c2.sharedKnowledgeDomains[j]] = true;
    }

    var shared = [];
    var unique1 = [];
    var unique2 = [];

    var allDomains = Object.keys(Object.assign({}, domains1, domains2));
    for (var k = 0; k < allDomains.length; k++) {
      var d = allDomains[k];
      if (domains1[d] && domains2[d]) shared.push(d);
      else if (domains1[d]) unique1.push(d);
      else unique2.push(d);
    }

    // Shared category
    if (c1.category && c1.category === c2.category) {
      shared.push(c1.category + ' (category)');
    }

    return {
      shared: shared,
      unique1: unique1,
      unique2: unique2,
      hasOverlap: shared.length > 0
    };
  }

  /* ─── Concept Differentiation ─────────────────────────── */

  function differentiateConcepts(conceptId1, conceptId2) {
    var engine = getEngine();
    if (!engine) return null;

    var c1 = engine.getConcept(conceptId1);
    var c2 = engine.getConcept(conceptId2);
    if (!c1 || !c2) return null;

    var deps1 = engine.getDependents(conceptId1);
    var deps2 = engine.getDependents(conceptId2);
    var prereqs1 = engine.getPrerequisites(conceptId1);
    var prereqs2 = engine.getPrerequisites(conceptId2);

    var diff = {
      concept1: { name: c1.name, category: c1.category, difficulty: c1.difficulty },
      concept2: { name: c2.name, category: c2.category, difficulty: c2.difficulty },
      distinctions: []
    };

    if (c1.category !== c2.category) {
      diff.distinctions.push({
        aspect: 'Domain',
        c1: c1.category || 'Unclassified',
        c2: c2.category || 'Unclassified'
      });
    }

    if (c1.difficulty !== c2.difficulty) {
      diff.distinctions.push({
        aspect: 'Difficulty',
        c1: c1.difficulty || '—',
        c2: c2.difficulty || '—'
      });
    }

    if (deps1.length !== deps2.length) {
      diff.distinctions.push({
        aspect: 'Downstream impact',
        c1: deps1.length + ' dependents',
        c2: deps2.length + ' dependents'
      });
    }

    if (prereqs1.length !== prereqs2.length) {
      diff.distinctions.push({
        aspect: 'Prerequisites',
        c1: prereqs1.length + ' required',
        c2: prereqs2.length + ' required'
      });
    }

    if (c1.summary && c2.summary && c1.summary !== c2.summary) {
      diff.distinctions.push({
        aspect: 'Purpose',
        c1: c1.summary.slice(0, 80),
        c2: c2.summary.slice(0, 80)
      });
    }

    return diff;
  }

  /* ─── Learning Trajectory ─────────────────────────────── */

  function generateLearningTrajectory(conceptId) {
    var engine = getEngine();
    var recs = getRecommendations();
    if (!engine || !recs) return null;

    var concept = engine.getConcept(conceptId);
    if (!concept) return null;

    var trajectory = {
      current: { id: concept.id, name: concept.name, category: concept.category },
      next: [],
      rationale: []
    };

    var recommendations = recs.getRecommendations(conceptId);
    if (!recommendations || !recommendations.categories) return trajectory;

    // Priority: prerequisites first, then related, then dependents
    var priority = ['prerequisites', 'relatedConcepts', 'dependentConcepts'];
    var added = {};
    var count = 0;

    for (var p = 0; p < priority.length && count < 4; p++) {
      var items = recommendations.categories[priority[p]] || [];
      for (var i = 0; i < items.length && count < 4; i++) {
        if (!added[items[i].id]) {
          added[items[i].id] = true;
          var itemConcept = engine.getConcept(items[i].id);
          trajectory.next.push({
            id: items[i].id,
            name: items[i].name || items[i].id,
            category: itemConcept ? itemConcept.category : '',
            reason: items[i].reason || 'Related concept',
            difficulty: itemConcept ? itemConcept.difficulty : ''
          });
          count++;
        }
      }
    }

    // Generate rationale
    var prereqs = engine.getPrerequisites(conceptId);
    var deps = engine.getDependents(conceptId);

    if (prereqs.length > 0) {
      trajectory.rationale.push('Prerequisite review: ' + prereqs.map(function (p) { return p.name; }).join(', '));
    }
    if (deps.length > 0) {
      trajectory.rationale.push('Unlocks: ' + deps.map(function (d) { return d.name; }).join(', '));
    }

    return trajectory;
  }

  /* ─── Knowledge Bridges ───────────────────────────────── */

  function findBridgeConcepts(conceptId) {
    var engine = getEngine();
    if (!engine) return [];

    var concept = engine.getConcept(conceptId);
    if (!concept) return [];

    var bridges = [];
    var related = engine.getRelatedConcepts(conceptId);
    var prereqs = engine.getPrerequisites(conceptId);
    var deps = engine.getDependents(conceptId);

    // A bridge concept connects multiple relationship types
    var allNeighbors = related.concat(prereqs).concat(deps);
    var neighborCategories = {};
    for (var i = 0; i < allNeighbors.length; i++) {
      var cat = allNeighbors[i].category || 'unknown';
      if (!neighborCategories[cat]) neighborCategories[cat] = [];
      neighborCategories[cat].push(allNeighbors[i]);
    }

    // Find concepts that appear in multiple categories
    var seen = {};
    for (var catKey in neighborCategories) {
      if (neighborCategories[catKey].length >= 2) {
        for (var j = 0; j < neighborCategories[catKey].length; j++) {
          var n = neighborCategories[catKey][j];
          if (!seen[n.id]) {
            seen[n.id] = true;
            bridges.push({
              id: n.id,
              name: n.name,
              category: n.category,
              connectingDomains: [catKey],
              bridgeType: 'multi-domain'
            });
          } else {
            // Add another domain
            for (var b = 0; b < bridges.length; b++) {
              if (bridges[b].id === n.id) {
                bridges[b].connectingDomains.push(catKey);
                bridges[b].bridgeType = bridges[b].connectingDomains.length > 2 ? 'hub' : 'multi-domain';
                break;
              }
            }
          }
        }
      }
    }

    return bridges;
  }

  /* ─── Neighborhood Statistics ─────────────────────────── */

  function calculateNeighborhoodStats(conceptId) {
    var engine = getEngine();
    var neighborhood = getNeighborhood();
    if (!engine || !neighborhood) return null;

    var concept = engine.getConcept(conceptId);
    if (!concept) return null;

    var nh = neighborhood.getNeighborhood(conceptId, 2);
    var prereqs = engine.getPrerequisites(conceptId);
    var deps = engine.getDependents(conceptId);
    var related = engine.getRelatedConcepts(conceptId);
    var domains = engine.getSharedKnowledgeDomains(conceptId);

    var bridgeCount = findBridgeConcepts(conceptId).length;

    return {
      totalNeighbors: nh ? nh.neighbors.length : 0,
      prerequisites: prereqs.length,
      dependents: deps.length,
      related: related.length,
      bridgeConnections: bridgeCount,
      domainCoverage: domains.length > 0 ? domains.map(function (d) { return d.id; }).join(', ') : concept.category || '—',
      deterministic: true
    };
  }

  /* ─── Concept Context Overview ────────────────────────── */

  function generateSemanticContext(conceptId) {
    var engine = getEngine();
    if (!engine) return null;

    var concept = engine.getConcept(conceptId);
    if (!concept) return null;

    var prereqs = engine.getPrerequisites(conceptId);
    var deps = engine.getDependents(conceptId);
    var related = engine.getRelatedConcepts(conceptId);
    var domains = engine.getSharedKnowledgeDomains(conceptId);

    return {
      primaryDomain: concept.category || 'Unclassified',
      frequentlyWith: related.slice(0, 3).map(function (r) { return r.name; }),
      usefulBefore: deps.slice(0, 3).map(function (d) { return d.name; }),
      requiresUnderstanding: prereqs.slice(0, 3).map(function (p) { return p.name; }),
      knowledgeDomains: domains.map(function (d) { return d.id; })
    };
  }

  /* ─── Public API ──────────────────────────────────────── */

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.SemanticIntelligence = {
    generateExplanation: generateExplanation,
    generateRelationshipReasons: generateRelationshipReasons,
    calculateSemanticDistance: calculateSemanticDistance,
    findSharedKnowledge: findSharedKnowledge,
    differentiateConcepts: differentiateConcepts,
    generateLearningTrajectory: generateLearningTrajectory,
    findBridgeConcepts: findBridgeConcepts,
    calculateNeighborhoodStats: calculateNeighborhoodStats,
    generateSemanticContext: generateSemanticContext
  };
})();
