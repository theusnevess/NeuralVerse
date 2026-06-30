/**
 * NV-1300-D1A — Instructional Layers
 *
 * Defines the 10 progressive instructional layers.
 * Selects layers deterministically based on context, difficulty, and available resources.
 * Records omissions with reasons.
 *
 * Deterministic. No Math.random. No Date.now.
 */

const INSTRUCTIONAL_LAYERS = [
  {
    id: 'motivation',
    label: 'Motivation',
    purpose: 'Explain why this concept matters and what problem it solves.',
    complexity: 1,
    requiredResources: [],
    optionalResources: ['sharedKnowledge'],
    defaultIncluded: true,
    skipRules: []
  },
  {
    id: 'context',
    label: 'Context',
    purpose: 'Position the concept within the curriculum and broader field.',
    complexity: 1,
    requiredResources: [],
    optionalResources: ['concept', 'artifacts'],
    defaultIncluded: true,
    skipRules: []
  },
  {
    id: 'intuition',
    label: 'Intuition',
    purpose: 'Build a mental model before formal definitions.',
    complexity: 2,
    requiredResources: [],
    optionalResources: ['analogies'],
    defaultIncluded: true,
    skipRules: []
  },
  {
    id: 'core_explanation',
    label: 'Core Explanation',
    purpose: 'Deliver the canonical explanation of the concept.',
    complexity: 3,
    requiredResources: [],
    optionalResources: ['concept', 'sharedKnowledge'],
    defaultIncluded: true,
    skipRules: []
  },
  {
    id: 'visualization',
    label: 'Visualization',
    purpose: 'Provide spatial or parametric visual understanding.',
    complexity: 3,
    requiredResources: ['visualizations'],
    optionalResources: [],
    defaultIncluded: true,
    skipRules: [
      {
        condition: 'no_visualization_available',
        reason: 'No visualization resource available for this concept.',
        severity: 'info'
      }
    ]
  },
  {
    id: 'mathematics',
    label: 'Mathematics',
    purpose: 'Present formal definitions, formulas, and derivations.',
    complexity: 4,
    requiredResources: [],
    optionalResources: ['concept'],
    defaultIncluded: true,
    skipRules: [
      {
        condition: 'essentials_difficulty',
        reason: 'Mathematics omitted for essentials difficulty preset.',
        severity: 'info'
      },
      {
        condition: 'no_math_detected',
        reason: 'No mathematical content detected for this topic.',
        severity: 'info'
      }
    ]
  },
  {
    id: 'algorithm',
    label: 'Algorithm',
    purpose: 'Describe the algorithmic structure and computational steps.',
    complexity: 4,
    requiredResources: [],
    optionalResources: ['concept', 'artifacts'],
    defaultIncluded: true,
    skipRules: [
      {
        condition: 'essentials_difficulty',
        reason: 'Algorithm details omitted for essentials difficulty preset.',
        severity: 'info'
      }
    ]
  },
  {
    id: 'implementation',
    label: 'Implementation',
    purpose: 'Show practical implementation patterns and code reasoning.',
    complexity: 5,
    requiredResources: [],
    optionalResources: ['artifacts', 'laboratories'],
    defaultIncluded: true,
    skipRules: [
      {
        condition: 'essentials_difficulty',
        reason: 'Implementation details omitted for essentials difficulty preset.',
        severity: 'info'
      },
      {
        condition: 'standard_difficulty_no_lab',
        reason: 'Implementation omitted: no laboratory resource and standard difficulty.',
        severity: 'info'
      }
    ]
  },
  {
    id: 'laboratory',
    label: 'Laboratory',
    purpose: 'Provide interactive or guided experimentation.',
    complexity: 5,
    requiredResources: ['laboratories'],
    optionalResources: [],
    defaultIncluded: true,
    skipRules: [
      {
        condition: 'no_laboratory_available',
        reason: 'No laboratory resource available for this concept.',
        severity: 'info'
      }
    ]
  },
  {
    id: 'limitations_tradeoffs',
    label: 'Limitations & Trade-offs',
    purpose: 'Discuss failure modes, assumptions, and alternative approaches.',
    complexity: 3,
    requiredResources: [],
    optionalResources: ['sharedKnowledge'],
    defaultIncluded: true,
    skipRules: [
      {
        condition: 'essentials_difficulty',
        reason: 'Limitations and trade-offs omitted for essentials difficulty preset.',
        severity: 'info'
      }
    ]
  }
];

function createInstructionalLayers() {
  var _allLayers = INSTRUCTIONAL_LAYERS.slice();

  function getAllLayers() {
    return _allLayers.map(function (l) {
      return {
        id: l.id,
        label: l.label,
        purpose: l.purpose,
        complexity: l.complexity,
        requiredResources: l.requiredResources.slice(),
        optionalResources: l.optionalResources.slice(),
        defaultIncluded: l.defaultIncluded,
        skipRules: l.skipRules.map(function (r) {
          return { condition: r.condition, reason: r.reason, severity: r.severity };
        })
      };
    });
  }

  function getLayerById(id) {
    for (var i = 0; i < _allLayers.length; i++) {
      if (_allLayers[i].id === id) return _allLayers[i];
    }
    return null;
  }

  function _hasResource(context, resourceName) {
    if (!context || !context.availableResources) return false;
    var res = context.availableResources[resourceName];
    if (Array.isArray(res)) return res.length > 0;
    return !!res;
  }

  function _hasVisualization(context) {
    return _hasResource(context, 'visualizations');
  }

  function _hasLaboratory(context) {
    return _hasResource(context, 'laboratories');
  }

  function _hasMathContent(context) {
    if (context.conceptIds && context.conceptIds.length > 0) return true;
    if (_hasResource(context, 'concepts')) return true;
    var query = (context.query || '').toLowerCase();
    var mathTerms = ['formula', 'equation', 'mathematical', 'derivation', 'proof', 'definition', 'formal'];
    for (var i = 0; i < mathTerms.length; i++) {
      if (query.indexOf(mathTerms[i]) !== -1) return true;
    }
    return false;
  }

  function _evaluateSkipRule(rule, context) {
    var difficulty = context.difficulty || 'standard';

    switch (rule.condition) {
      case 'no_visualization_available':
        return !_hasVisualization(context);
      case 'no_laboratory_available':
        return !_hasLaboratory(context);
      case 'essentials_difficulty':
        return difficulty === 'essentials';
      case 'no_math_detected':
        return !_hasMathContent(context);
      case 'standard_difficulty_no_lab':
        return difficulty === 'standard' && !_hasLaboratory(context);
      default:
        return false;
    }
  }

  function selectLayers(context) {
    var ctx = context || {};
    var selected = [];
    var omissions = [];

    for (var i = 0; i < _allLayers.length; i++) {
      var layer = _allLayers[i];
      var included = layer.defaultIncluded;
      var omissionReason = null;

      for (var j = 0; j < layer.skipRules.length; j++) {
        var rule = layer.skipRules[j];
        if (_evaluateSkipRule(rule, ctx)) {
          included = false;
          omissionReason = rule.reason;
          break;
        }
      }

      if (included) {
        selected.push({
          id: layer.id,
          label: layer.label,
          purpose: layer.purpose,
          complexity: layer.complexity,
          included: true
        });
      } else {
        omissions.push({
          layerId: layer.id,
          reason: omissionReason || 'Excluded by deterministic rule',
          severity: 'info'
        });
      }
    }

    return { layers: selected, omissions: omissions };
  }

  function explainLayerSelection(context) {
    var result = selectLayers(context);
    var explanation = [];

    for (var i = 0; i < _allLayers.length; i++) {
      var layer = _allLayers[i];
      var found = false;
      for (var j = 0; j < result.layers.length; j++) {
        if (result.layers[j].id === layer.id) {
          found = true;
          break;
        }
      }
      explanation.push({
        layerId: layer.id,
        included: found,
        reason: found ? 'Default inclusion — no skip rule triggered' : _getOmissionReason(result.omissions, layer.id)
      });
    }

    return explanation;
  }

  function _getOmissionReason(omissions, layerId) {
    for (var i = 0; i < omissions.length; i++) {
      if (omissions[i].layerId === layerId) return omissions[i].reason;
    }
    return 'Unknown';
  }

  function validateLayerSelection(layers) {
    if (!Array.isArray(layers)) {
      return { valid: false, errors: ['layers must be an array'] };
    }

    var errors = [];
    var seen = Object.create(null);

    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      if (!layer.id) {
        errors.push('Layer at index ' + i + ' missing id');
        continue;
      }
      if (seen[layer.id]) {
        errors.push('Duplicate layer: ' + layer.id);
      }
      seen[layer.id] = true;

      var known = getLayerById(layer.id);
      if (!known) {
        errors.push('Unknown layer id: ' + layer.id);
      }
    }

    return { valid: errors.length === 0, errors: errors };
  }

  return {
    getAllLayers: getAllLayers,
    getLayerById: getLayerById,
    selectLayers: selectLayers,
    explainLayerSelection: explainLayerSelection,
    validateLayerSelection: validateLayerSelection,
    INSTRUCTIONAL_LAYERS: INSTRUCTIONAL_LAYERS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createInstructionalLayers = createInstructionalLayers;
}

export { createInstructionalLayers, INSTRUCTIONAL_LAYERS };
