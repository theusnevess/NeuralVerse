/**
 * NV-1300-D1C — Laboratory Placer
 *
 * Deterministically selects and places laboratories within a didactic plan.
 * Laboratories appear when interaction > passive observation.
 * Maximum 1 laboratory per explanation.
 *
 * Deterministic. No Math.random. No Date.now.
 */

var LAB_SELECTION_ROLES = {
  exploration: { weight: 0.20, description: 'Open-ended discovery of concept behavior' },
  guided_practice: { weight: 0.25, description: 'Step-by-step reinforcement with scaffolding' },
  validation: { weight: 0.15, description: 'Verify understanding through concrete testing' },
  comparison: { weight: 0.10, description: 'Compare approaches or parameter settings' },
  challenge: { weight: 0.10, description: 'Push beyond basic understanding' },
  experiment: { weight: 0.10, description: 'Test hypotheses about concept behavior' },
  post_explanation: { weight: 0.05, description: 'Consolidate after detailed explanation' },
  implementation: { weight: 0.05, description: 'Practice real-world implementation' }
};

var CONCEPT_LAB_AFFINITY = {
  'gradient-descent': { role: 'exploration', strong: true, reason: 'Learning rate and convergence are best explored interactively' },
  'pca': { role: 'experiment', strong: true, reason: 'Dimensionality reduction requires hands-on manipulation' },
  'word-embeddings': { role: 'exploration', strong: true, reason: 'Embedding space relationships are discovered through interaction' },
  'self-attention': { role: 'guided_practice', strong: true, reason: 'Attention mechanisms benefit from step-by-step exploration' },
  'bayes-theorem': { role: 'experiment', strong: true, reason: 'Probability updating is best understood through experimentation' },
  'linear-models': { role: 'guided_practice', strong: true, reason: 'Fitting lines to data reinforces visual understanding' },
  'logistic-regression': { role: 'validation', strong: true, reason: 'Classification boundaries need concrete validation' },
  'sigmoid-function': { role: 'exploration', strong: false, reason: 'Sigmoid behavior is explored through parameter variation' },
  'decision-boundary': { role: 'comparison', strong: true, reason: 'Comparing boundaries across models is instructive' },
  'softmax-function': { role: 'validation', strong: false, reason: 'Output distribution validation through interaction' },
  'loss-functions': { role: 'comparison', strong: false, reason: 'Comparing loss landscapes aids understanding' },
  'neural-networks': { role: 'exploration', strong: false, reason: 'Network behavior exploration is valuable' },
  'transformer-architecture': { role: 'guided_practice', strong: false, reason: 'Attention flow benefits from guided exploration' },
  'convolution': { role: 'experiment', strong: false, reason: 'Kernel effects are experimentally discoverable' },
  'learning-rate-scheduling': { role: 'experiment', strong: true, reason: 'Schedule effects must be experienced' },
  'optimizers': { role: 'comparison', strong: true, reason: 'Optimizer comparison is most effective interactively' },
  'regularization': { role: 'experiment', strong: false, reason: 'Regularization effects are experimentally verified' }
};

var MAX_LABS_PER_PLAN = 1;

var LAB_ROLES_SUPPORTED = [
  'exploration', 'guided_practice', 'validation', 'comparison',
  'challenge', 'experiment', 'post_explanation', 'implementation'
];

function createLaboratoryPlacer() {
  function _getLabRegistry() {
    return (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.LabRegistry)
      ? window.NeuralVerse.LabRegistry
      : null;
  }

  function _getSemanticEngine() {
    return (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.SemanticEngine)
      ? window.NeuralVerse.SemanticEngine
      : null;
  }

  function _determineLabRole(conceptId, plan) {
    var affinity = CONCEPT_LAB_AFFINITY[conceptId];
    if (affinity && affinity.role) return affinity.role;

    var difficulty = plan.difficulty || 'standard';
    if (difficulty === 'essentials' || difficulty === 'beginner') return 'guided_practice';
    if (difficulty === 'advanced' || difficulty === 'deep_dive' || difficulty === 'research_notes') return 'experiment';
    return 'exploration';
  }

  function scoreLaboratory(lab, plan) {
    if (!lab || typeof lab !== 'object') return 0;
    if (!plan || typeof plan !== 'object') return 0;

    var conceptIds = Array.isArray(plan.conceptIds) ? plan.conceptIds : [];
    var difficulty = plan.difficulty || 'standard';

    var conceptCoverage = 0;
    var labConcepts = lab.concepts || [];
    if (labConcepts.length > 0 && conceptIds.length > 0) {
      var matched = 0;
      for (var i = 0; i < conceptIds.length; i++) {
        if (labConcepts.indexOf(conceptIds[i]) !== -1) matched++;
      }
      conceptCoverage = matched / Math.max(conceptIds.length, 1);
    }

    var semanticProximity = 0;
    var engine = _getSemanticEngine();
    if (engine && conceptIds.length > 0 && labConcepts.length > 0) {
      for (var s = 0; s < conceptIds.length; s++) {
        var related = engine.getRelatedConcepts ? engine.getRelatedConcepts(conceptIds[s]) : [];
        for (var r = 0; r < related.length; r++) {
          var relId = typeof related[r] === 'string' ? related[r] : (related[r].id || '');
          if (labConcepts.indexOf(relId) !== -1) {
            semanticProximity = Math.max(semanticProximity, 0.6);
          }
        }
      }
    }

    var difficultyCompatibility = 0;
    var labDifficulty = lab.difficulty || 'intermediate';
    var difficultyMap = { essentials: 1, beginner: 2, standard: 3, intermediate: 4, advanced: 5, deep_dive: 5, research_notes: 5 };
    var planLevel = difficultyMap[difficulty] || 3;
    var labLevel = difficultyMap[labDifficulty] || 3;
    var diffDelta = Math.abs(planLevel - labLevel);
    difficultyCompatibility = diffDelta === 0 ? 1.0 : diffDelta === 1 ? 0.7 : diffDelta === 2 ? 0.4 : 0.2;

    var roleAlignment = 0;
    var primaryRole = 'exploration';
    for (var c = 0; c < conceptIds.length; c++) {
      var role = _determineLabRole(conceptIds[c], plan);
      if (role) { primaryRole = role; break; }
    }
    if (lab.category) {
      var catLower = lab.category.toLowerCase();
      if (catLower.indexOf(primaryRole.replace('_', '-')) !== -1 ||
          catLower.indexOf(primaryRole) !== -1) {
        roleAlignment = 0.9;
      } else {
        roleAlignment = 0.5;
      }
    } else {
      roleAlignment = 0.4;
    }

    var vizComplementarity = 0;
    if (plan.selectedResources && plan.selectedResources.visualizations) {
      var vizs = plan.selectedResources.visualizations;
      for (var v = 0; v < vizs.length; v++) {
        var vizConcepts = vizs[v].concepts || [];
        for (var vc = 0; vc < vizConcepts.length; vc++) {
          if (labConcepts.indexOf(vizConcepts[vc]) !== -1) {
            vizComplementarity = 0.7;
            break;
          }
        }
        if (vizComplementarity > 0) break;
      }
    }

    var canonicalPriority = 0;
    if (lab.canonicalStatus === 'Reviewed') canonicalPriority = 1.0;
    else if (lab.canonicalStatus === 'Draft') canonicalPriority = 0.5;
    else canonicalPriority = 0.3;

    var score =
      conceptCoverage * 0.30 +
      semanticProximity * 0.15 +
      difficultyCompatibility * 0.20 +
      roleAlignment * 0.15 +
      vizComplementarity * 0.10 +
      canonicalPriority * 0.10;

    return Math.round(score * 1000) / 1000;
  }

  function selectLaboratory(plan) {
    if (!plan || typeof plan !== 'object') {
      return { selected: null, role: null, explanation: 'No plan provided.' };
    }

    var conceptIds = Array.isArray(plan.conceptIds) ? plan.conceptIds : [];
    if (conceptIds.length === 0) {
      return { selected: null, role: null, explanation: 'No concept IDs in plan.' };
    }

    var hasLabLayer = false;
    if (Array.isArray(plan.layers)) {
      for (var i = 0; i < plan.layers.length; i++) {
        if (plan.layers[i].id === 'laboratory' && plan.layers[i].included) {
          hasLabLayer = true;
          break;
        }
      }
    }
    if (!hasLabLayer) {
      return { selected: null, role: null, explanation: 'Laboratory layer not included in plan.' };
    }

    var registry = _getLabRegistry();
    if (!registry) {
      return { selected: null, role: null, explanation: 'Lab registry not available.' };
    }

    var candidates = [];
    var seen = {};
    for (var c = 0; c < conceptIds.length; c++) {
      var labs = registry.getByConcept ? registry.getByConcept(conceptIds[c]) : [];
      for (var l = 0; l < labs.length; l++) {
        if (seen[labs[l].id]) continue;
        var s = scoreLaboratory(labs[l], plan);
        var role = _determineLabRole(conceptIds[c], plan);
        candidates.push({ laboratory: labs[l], score: s, matchedConcept: conceptIds[c], role: role });
        seen[labs[l].id] = true;
      }
    }

    candidates.sort(function (a, b) { return b.score - a.score; });

    if (candidates.length === 0) {
      return { selected: null, role: null, explanation: 'No laboratories match the plan concepts.' };
    }

    var best = candidates[0];
    var explanation = _buildSelectionExplanation(best, candidates, plan);

    return { selected: best, role: best.role, explanation: explanation };
  }

  function buildPlacement(plan, labResult) {
    if (!plan || typeof plan !== 'object') return null;
    if (!labResult || !labResult.selected) return null;

    var labEntry = labResult.selected;
    var lab = labEntry.laboratory || labEntry;
    var role = labEntry.role || labResult.role || 'exploration';

    var position = -1;
    if (Array.isArray(plan.sections)) {
      for (var i = 0; i < plan.sections.length; i++) {
        if (plan.sections[i].id === 'laboratory' && plan.sections[i].included) {
          position = i;
          break;
        }
      }
    }

    if (position === -1) {
      position = plan.sections ? plan.sections.length : 0;
    }

    return {
      laboratoryId: lab.id,
      laboratoryTitle: lab.title || lab.id,
      sectionId: 'laboratory',
      position: position,
      insertionType: position < (plan.sections ? plan.sections.length : 0) ? 'inline' : 'append',
      role: role,
      roleDescription: LAB_SELECTION_ROLES[role] ? LAB_SELECTION_ROLES[role].description : 'Interactive learning',
      matchedConcept: labEntry.matchedConcept || '',
      score: labEntry.score || 0,
      reason: _buildPlacementReason(labEntry, plan)
    };
  }

  function explainPlacement(plan, labResult, placement) {
    if (!placement) return 'No laboratory placement generated.';

    var lines = [];
    lines.push('Laboratory Placement:');
    lines.push('  Lab: ' + (placement.laboratoryTitle || placement.laboratoryId));
    lines.push('  Role: ' + placement.role + ' — ' + (placement.roleDescription || ''));
    lines.push('  Concept: ' + (placement.matchedConcept || 'none'));
    lines.push('  Score: ' + (placement.score || 0));
    lines.push('  Position: section ' + placement.position + ' (' + placement.insertionType + ')');
    lines.push('  Reason: ' + (placement.reason || 'Deterministic selection'));

    return lines.join('\n');
  }

  function _buildSelectionExplanation(best, candidates, plan) {
    var lines = [];
    lines.push('Laboratory Selection (max ' + MAX_LABS_PER_PLAN + '):');
    lines.push('  Selected: ' + (best.laboratory.title || best.laboratory.id) + ' (score: ' + best.score + ')');
    lines.push('  Role: ' + best.role);
    lines.push('  Concept: ' + best.matchedConcept);

    if (candidates.length > 1) {
      lines.push('  Alternatives considered: ' + (candidates.length - 1));
      for (var i = 1; i < candidates.length && i < 4; i++) {
        lines.push('    - ' + (candidates[i].laboratory.title || candidates[i].laboratory.id) + ' (score: ' + candidates[i].score + ')');
      }
    }

    return lines.join('\n');
  }

  function _buildPlacementReason(labEntry, plan) {
    var lab = labEntry.laboratory || labEntry;
    var conceptId = labEntry.matchedConcept || '';
    var affinity = CONCEPT_LAB_AFFINITY[conceptId];

    var reasons = [];
    if (affinity && affinity.strong) {
      reasons.push(affinity.reason);
    }
    if (labEntry.role) {
      reasons.push('Role: ' + labEntry.role);
    }
    if (conceptId) {
      reasons.push('Matches concept: ' + conceptId);
    }
    if (labEntry.score > 0.5) {
      reasons.push('High score: ' + labEntry.score);
    }

    return reasons.length > 0 ? reasons.join('; ') : 'Selected by deterministic scoring';
  }

  return {
    scoreLaboratory: scoreLaboratory,
    selectLaboratory: selectLaboratory,
    buildPlacement: buildPlacement,
    explainPlacement: explainPlacement,
    LAB_SELECTION_ROLES: LAB_SELECTION_ROLES,
    CONCEPT_LAB_AFFINITY: CONCEPT_LAB_AFFINITY,
    MAX_LABS_PER_PLAN: MAX_LABS_PER_PLAN,
    LAB_ROLES_SUPPORTED: LAB_ROLES_SUPPORTED
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createLaboratoryPlacer = createLaboratoryPlacer;
}

export { createLaboratoryPlacer };
