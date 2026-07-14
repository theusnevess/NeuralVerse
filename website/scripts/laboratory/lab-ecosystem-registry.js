/**
 * NV-900-P7 — Lab Ecosystem Registry
 * Central registry for cross-laboratory scientific relationships.
 */

(function () {
  'use strict';

  var RELATIONSHIP_TYPES = [
    'prerequisite', 'extension', 'application', 'comparison',
    'failure-mode', 'diagnostic', 'conceptual-neighbor', 'workflow-next'
  ];

  var relationships = [];
  var _sourceIndex = {};
  var _targetIndex = {};
  var _validated = false;
  var _validationWarnings = [];

  function registerRelationship(rel) {
    if (!rel || !rel.source || !rel.target) {
      console.warn('Ecosystem: relationship missing source or target');
      return false;
    }
    if (rel.source === rel.target) {
      console.warn('Ecosystem: self-relation ignored for ' + rel.source);
      return false;
    }
    if (RELATIONSHIP_TYPES.indexOf(rel.type) === -1) {
      console.warn('Ecosystem: unknown relationship type "' + rel.type + '" for ' + rel.source + ' → ' + rel.target);
      return false;
    }
    if (!rel.reason || !rel.outcome) {
      console.warn('Ecosystem: relationship missing reason or outcome for ' + rel.source + ' → ' + rel.target);
      return false;
    }

    // Duplicate detection
    for (var i = 0; i < relationships.length; i++) {
      var existing = relationships[i];
      if (existing.source === rel.source && existing.target === rel.target && existing.type === rel.type) {
        return false;
      }
    }

    relationships.push({
      source: rel.source,
      target: rel.target,
      type: rel.type,
      reason: rel.reason,
      outcome: rel.outcome
    });

    if (!_sourceIndex[rel.source]) _sourceIndex[rel.source] = [];
    _sourceIndex[rel.source].push(relationships.length - 1);

    if (!_targetIndex[rel.target]) _targetIndex[rel.target] = [];
    _targetIndex[rel.target].push(relationships.length - 1);

    return true;
  }

  function getOutgoing(sourceSlug) {
    var indices = _sourceIndex[sourceSlug] || [];
    return indices.map(function (i) { return relationships[i]; });
  }

  function getIncoming(targetSlug) {
    var indices = _targetIndex[targetSlug] || [];
    return indices.map(function (i) { return relationships[i]; });
  }

  function getConnected(slug) {
    var outgoing = getOutgoing(slug);
    var incoming = getIncoming(slug);
    var seen = {};
    var result = [];

    for (var i = 0; i < outgoing.length; i++) {
      if (!seen[outgoing[i].target]) {
        seen[outgoing[i].target] = true;
        result.push(outgoing[i]);
      }
    }
    for (var i = 0; i < incoming.length; i++) {
      if (!seen[incoming[i].source]) {
        seen[incoming[i].source] = true;
        result.push({
          source: incoming[i].source,
          target: slug,
          type: incoming[i].type,
          reason: incoming[i].reason,
          outcome: incoming[i].outcome,
          direction: 'incoming'
        });
      }
    }
    return result;
  }

  function getNextExperiments(sourceSlug) {
    var outgoing = getOutgoing(sourceSlug);
    var priority = ['workflow-next', 'application', 'extension', 'prerequisite', 'diagnostic', 'conceptual-neighbor', 'comparison', 'failure-mode'];
    var sorted = outgoing.slice().sort(function (a, b) {
      return priority.indexOf(a.type) - priority.indexOf(b.type);
    });
    return sorted.slice(0, 3);
  }

  function getPathways() {
    var pathways = [];
    var allLabs = window.NeuralVerse.LabRegistry ? window.NeuralVerse.LabRegistry.getAll() : [];
    var labSlugs = {};
    for (var i = 0; i < allLabs.length; i++) {
      labSlugs[allLabs[i].slug] = allLabs[i].title;
    }

    // Build pathways from prerequisite chains
    var visited = {};
    for (var i = 0; i < relationships.length; i++) {
      var rel = relationships[i];
      if (rel.type === 'prerequisite' || rel.type === 'workflow-next') {
        var chain = buildChain(rel.source, rel.target, labSlugs);
        if (chain.length >= 2) {
          var key = chain.map(function (c) { return c.slug; }).join('→');
          if (!visited[key]) {
            visited[key] = true;
            pathways.push({
              labs: chain,
              label: buildPathwayLabel(chain)
            });
          }
        }
      }
    }

    return pathways;
  }

  function buildChain(startSlug, endSlug, labSlugs) {
    if (!labSlugs[startSlug] || !labSlugs[endSlug]) return [];
    var chain = [{ slug: startSlug, title: labSlugs[startSlug] }];
    var current = startSlug;
    var maxSteps = 5;

    while (current !== endSlug && maxSteps > 0) {
      var next = null;
      var outgoing = getOutgoing(current);
      for (var i = 0; i < outgoing.length; i++) {
        if (outgoing[i].type === 'prerequisite' || outgoing[i].type === 'workflow-next') {
          if (outgoing[i].target === endSlug) {
            next = outgoing[i].target;
            break;
          }
          if (!next) next = outgoing[i].target;
        }
      }
      if (!next || labSlugs[next] === undefined) break;
      chain.push({ slug: next, title: labSlugs[next] });
      current = next;
      maxSteps--;
    }
    return chain;
  }

  function buildPathwayLabel(chain) {
    if (chain.length < 2) return '';
    var labels = chain.map(function (c) { return c.title; });
    return labels.join(' → ');
  }

  function validate() {
    _validationWarnings = [];
    var allLabs = window.NeuralVerse.LabRegistry ? window.NeuralVerse.LabRegistry.getAll() : [];
    var labSlugs = {};
    for (var i = 0; i < allLabs.length; i++) {
      labSlugs[allLabs[i].slug] = true;
    }

    for (var i = 0; i < relationships.length; i++) {
      var rel = relationships[i];
      if (!labSlugs[rel.source]) {
        _validationWarnings.push('Source lab "' + rel.source + '" does not exist');
      }
      if (!labSlugs[rel.target]) {
        _validationWarnings.push('Target lab "' + rel.target + '" does not exist');
      }
      if (RELATIONSHIP_TYPES.indexOf(rel.type) === -1) {
        _validationWarnings.push('Invalid type "' + rel.type + '" for ' + rel.source + ' → ' + rel.target);
      }
    }

    _validated = true;
    if (_validationWarnings.length > 0) {
      console.warn('Ecosystem validation warnings:', _validationWarnings);
    }
    return {
      valid: _validationWarnings.length === 0,
      warnings: _validationWarnings.slice(),
      relationshipCount: relationships.length
    };
  }

  function getAll() {
    return relationships.slice();
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.LabEcosystem = {
    register: registerRelationship,
    getOutgoing: getOutgoing,
    getIncoming: getIncoming,
    getConnected: getConnected,
    getNextExperiments: getNextExperiments,
    getPathways: getPathways,
    validate: validate,
    getAll: getAll,
    TYPES: RELATIONSHIP_TYPES
  };

})();
