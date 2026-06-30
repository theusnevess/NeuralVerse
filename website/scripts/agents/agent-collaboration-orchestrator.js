/**
 * NV-1300-D1D — Agent Collaboration Orchestrator
 *
 * Coordinates existing deterministic agents as a fixed-order pipeline.
 * Planner requests contributions from each allowed contributor and the
 * orchestrator merges them deterministically. No autonomous conversations.
 * No recursive agent calls.
 *
 * Pipeline order (D1D spec):
 *   Applications → Research → Shared Knowledge → Curiosity →
 *   Laboratory → Visualization → Assessment
 *
 * Each agent returns structured blocks. Blocks are scored, ranked,
 * and merged. Conflicts are resolved deterministically.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 * No learner inference. No curriculum mutation.
 */

const AGENT_PIPELINE_ORDER = [
  'applications',
  'research',
  'sharedKnowledge',
  'curiosity',
  'laboratory',
  'visualization',
  'assessment'
];

const ALLOWED_CONTRIBUTORS = [
  'sharedKnowledge',
  'research',
  'applications',
  'curiosity',
  'assessment',
  'visualization',
  'laboratory',
  'semanticLearning'
];

const BLOCK_TYPES = {
  ALTERNATIVE_ANALOGY: 'alternative_analogy',
  HISTORICAL_ANECDOTE: 'historical_anecdote',
  APPLICATION_DOMAINS: 'application_domains',
  CURIOSITY_PROMPT: 'curiosity_prompt',
  PRACTICE_QUESTION: 'practice_question',
  SEMANTIC_NEIGHBORHOOD: 'semantic_neighborhood',
  SHARED_KNOWLEDGE: 'shared_knowledge',
  RESEARCH_CONTEXT: 'research_context',
  VISUALIZATION: 'visualization',
  LABORATORY: 'laboratory'
};

function _safeArray(v) { return Array.isArray(v) ? v : []; }
function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }

function _dedupBlocks(blocks) {
  var seen = Object.create(null);
  var out = [];
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    if (!b) continue;
    var key = b.id || (b.agentId + ':' + b.type + ':' + (b.title || ''));
    if (seen[key]) continue;
    seen[key] = true;
    out.push(b);
  }
  return out;
}

function createAgentCollaborationOrchestrator(deps) {
  var agents = (deps && deps.agents) || {};
  var _lastResult = null;

  function _safeCall(name, fnName, input) {
    var a = agents[name];
    if (!a || typeof a[fnName] !== 'function') return [];
    try {
      var out = a[fnName](input);
      return _safeArray(out);
    } catch (e) {
      return [];
    }
  }

  function _contributeApplications(input) {
    var a = agents.applications;
    if (!a) return [];
    var topic = input && input.topic;
    var intent = input && input.intent;
    if (typeof a.canHandle === 'function' && !a.canHandle({ userQuery: input.query, intent: intent })) return [];
    if (typeof a.run === 'function') {
      try {
        var r = a.run({ userQuery: input.query, topic: topic, selectedArtifact: input.selectedArtifact }, { mode: 'transfer' });
        if (r && Array.isArray(r.sections)) {
          return r.sections.slice(0, 3).map(function (s, i) {
            return {
              id: 'app-' + (s.title || 'block') + '-' + i,
              agentId: 'applications',
              type: BLOCK_TYPES.APPLICATION_DOMAINS,
              title: s.title,
              content: s.content,
              score: 0.7
            };
          });
        }
      } catch (e) { /* fallthrough */ }
    }
    return [];
  }

  function _contributeResearch(input) {
    var a = agents.research;
    if (!a) return [];
    if (typeof a.canHandle === 'function' && !a.canHandle({ userQuery: input.query })) return [];
    if (typeof a.run === 'function') {
      try {
        var r = a.run({ userQuery: input.query, topic: input.topic, selectedArtifact: input.selectedArtifact }, { mode: 'historical_context' });
        if (r && Array.isArray(r.sections)) {
          return r.sections.slice(0, 2).map(function (s, i) {
            return {
              id: 'res-' + (s.title || 'block') + '-' + i,
              agentId: 'research',
              type: BLOCK_TYPES.RESEARCH_CONTEXT,
              title: s.title,
              content: s.content,
              score: 0.75
            };
          });
        }
      } catch (e) { /* fallthrough */ }
    }
    return [];
  }

  function _contributeSharedKnowledge(input) {
    var a = agents.sharedKnowledge || (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.sharedKnowledgeService);
    if (!a) return [];
    var topic = input.topic;
    var query = input.query;
    var blocks = [];
    try {
      if (typeof a.getSyncDomainByTopic === 'function') {
        var domain = a.getSyncDomainByTopic(topic, query);
        if (domain) {
          if (Array.isArray(domain.analogies)) {
            for (var i = 0; i < domain.analogies.length; i++) {
              var an = domain.analogies[i];
              blocks.push({
                id: 'sk-analogy-' + i,
                agentId: 'sharedKnowledge',
                type: BLOCK_TYPES.ALTERNATIVE_ANALOGY,
                title: an.domain ? an.domain + ' Analogy' : 'Shared Knowledge Analogy',
                content: an.text,
                limitations: an.limitations,
                score: 0.8
              });
            }
          }
          if (Array.isArray(domain.commonMisconceptions)) {
            for (var m = 0; m < domain.commonMisconceptions.length; m++) {
              var ms = domain.commonMisconceptions[m];
              blocks.push({
                id: 'sk-misc-' + m,
                agentId: 'sharedKnowledge',
                type: BLOCK_TYPES.SHARED_KNOWLEDGE,
                title: ms.trigger || 'Common Misconception',
                content: ms.correct,
                score: 0.65
              });
            }
          }
        }
      }
    } catch (e) { /* fallthrough */ }
    return blocks;
  }

  function _contributeCuriosity(input) {
    var a = agents.curiosity;
    if (!a) return [];
    if (typeof a.canHandle === 'function' && !a.canHandle({ userQuery: input.query })) return [];
    if (typeof a.run === 'function') {
      try {
        var r = a.run({ userQuery: input.query, topic: input.topic, selectedArtifact: input.selectedArtifact }, { mode: 'historical_anecdote' });
        if (r && Array.isArray(r.sections)) {
          return r.sections.slice(0, 2).map(function (s, i) {
            return {
              id: 'cur-' + (s.title || 'block') + '-' + i,
              agentId: 'curiosity',
              type: BLOCK_TYPES.HISTORICAL_ANECDOTE,
              title: s.title,
              content: s.content,
              score: 0.6
            };
          });
        }
      } catch (e) { /* fallthrough */ }
    }
    return [];
  }

  function _contributeLaboratory(input) {
    var plan = input.plan;
    if (!plan || !Array.isArray(plan.laboratories) || plan.laboratories.length === 0) return [];
    return plan.laboratories.slice(0, 1).map(function (lab) {
      return {
        id: 'lab-' + (lab.id || 'block'),
        agentId: 'laboratory',
        type: BLOCK_TYPES.LABORATORY,
        title: lab.title || lab.id,
        content: 'Laboratory resource: ' + (lab.title || lab.id) + (lab.role ? ' (role: ' + lab.role + ')' : ''),
        resourceId: lab.id,
        score: 0.85
      };
    });
  }

  function _contributeVisualization(input) {
    var plan = input.plan;
    if (!plan || !Array.isArray(plan.visualizations) || plan.visualizations.length === 0) return [];
    return plan.visualizations.slice(0, 2).map(function (viz) {
      return {
        id: 'viz-' + (viz.id || 'block'),
        agentId: 'visualization',
        type: BLOCK_TYPES.VISUALIZATION,
        title: viz.title || viz.id,
        content: 'Visualization resource: ' + (viz.title || viz.id),
        resourceId: viz.id,
        score: 0.8
      };
    });
  }

  function _contributeAssessment(input) {
    var a = agents.assessment;
    if (!a) return [];
    if (typeof a.canHandle === 'function' && !a.canHandle({ userQuery: input.query })) return [];
    if (typeof a.run === 'function') {
      try {
        var r = a.run({ userQuery: input.query, topic: input.topic, selectedArtifact: input.selectedArtifact }, { mode: 'practice_questions' });
        if (r && Array.isArray(r.sections)) {
          return r.sections.slice(0, 1).map(function (s, i) {
            return {
              id: 'asm-' + (s.title || 'block') + '-' + i,
              agentId: 'assessment',
              type: BLOCK_TYPES.PRACTICE_QUESTION,
              title: s.title,
              content: s.content,
              score: 0.55
            };
          });
        }
      } catch (e) { /* fallthrough */ }
    }
    return [];
  }

  function collectContributions(input) {
    var src = input || {};
    var contributions = {};

    contributions.applications = _contributeApplications(src);
    contributions.research = _contributeResearch(src);
    contributions.sharedKnowledge = _contributeSharedKnowledge(src);
    contributions.curiosity = _contributeCuriosity(src);
    contributions.laboratory = _contributeLaboratory(src);
    contributions.visualization = _contributeVisualization(src);
    contributions.assessment = _contributeAssessment(src);

    return contributions;
  }

  function rankContributions(contributions) {
    var all = [];
    var order = AGENT_PIPELINE_ORDER;
    for (var i = 0; i < order.length; i++) {
      var name = order[i];
      var list = contributions[name];
      if (!Array.isArray(list)) continue;
      for (var j = 0; j < list.length; j++) {
        var block = list[j];
        if (!block) continue;
        all.push({
          block: block,
          agentId: name,
          pipelinePosition: i,
          score: typeof block.score === 'number' ? block.score : 0.5
        });
      }
    }
    all.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.pipelinePosition - b.pipelinePosition;
    });
    return all;
  }

  function resolveConflicts(blocks) {
    var arr = _safeArray(blocks);
    var byType = Object.create(null);
    for (var i = 0; i < arr.length; i++) {
      var b = arr[i];
      if (!b) continue;
      var t = b.type || 'unknown';
      if (!byType[t]) byType[t] = [];
      byType[t].push(b);
    }
    var resolved = [];
    for (var k in byType) {
      if (Object.prototype.hasOwnProperty.call(byType, k)) {
        var list = byType[k];
        list.sort(function (a, b) {
          var sa = typeof a.score === 'number' ? a.score : 0;
          var sb = typeof b.score === 'number' ? b.score : 0;
          if (sb !== sa) return sb - sa;
          var oa = AGENT_PIPELINE_ORDER.indexOf(a.agentId);
          var ob = AGENT_PIPELINE_ORDER.indexOf(b.agentId);
          if (oa === -1) oa = 99;
          if (ob === -1) ob = 99;
          return oa - ob;
        });
        for (var n = 0; n < list.length; n++) resolved.push(list[n]);
      }
    }
    return resolved;
  }

  function mergeBlocks(contributions) {
    var ranked = rankContributions(contributions || {});
    var blocksOnly = [];
    for (var i = 0; i < ranked.length; i++) blocksOnly.push(ranked[i].block);
    var resolved = resolveConflicts(blocksOnly);
    return _dedupBlocks(resolved);
  }

  function buildUnifiedContext(input) {
    var src = input || {};
    var contributions = collectContributions(src);
    var merged = mergeBlocks(contributions);

    var summary = {};
    for (var i = 0; i < AGENT_PIPELINE_ORDER.length; i++) {
      var name = AGENT_PIPELINE_ORDER[i];
      summary[name] = (contributions[name] || []).length;
    }

    _lastResult = {
      contributions: contributions,
      mergedBlocks: merged,
      summary: summary,
      order: AGENT_PIPELINE_ORDER.slice()
    };
    return _lastResult;
  }

  function getLastResult() { return _lastResult; }
  function getOrder() { return AGENT_PIPELINE_ORDER.slice(); }
  function getAllowedContributors() { return ALLOWED_CONTRIBUTORS.slice(); }
  function getBlockTypes() { return Object.assign({}, BLOCK_TYPES); }

  return {
    collectContributions: collectContributions,
    mergeBlocks: mergeBlocks,
    rankContributions: rankContributions,
    resolveConflicts: resolveConflicts,
    buildUnifiedContext: buildUnifiedContext,
    getLastResult: getLastResult,
    getOrder: getOrder,
    getAllowedContributors: getAllowedContributors,
    getBlockTypes: getBlockTypes,
    AGENT_PIPELINE_ORDER: AGENT_PIPELINE_ORDER,
    ALLOWED_CONTRIBUTORS: ALLOWED_CONTRIBUTORS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createAgentCollaborationOrchestrator = createAgentCollaborationOrchestrator;
}

export {
  createAgentCollaborationOrchestrator,
  AGENT_PIPELINE_ORDER,
  ALLOWED_CONTRIBUTORS,
  BLOCK_TYPES
};
