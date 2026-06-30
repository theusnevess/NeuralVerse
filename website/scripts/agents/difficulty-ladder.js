/**
 * NV-1300-D1A — Difficulty Ladder
 *
 * Controls depth and density of explanations via 4 deterministic presets.
 * Presets represent selected explanation depth, NOT learner ability.
 *
 * Deterministic. No Math.random. No Date.now.
 */

const DIFFICULTY_PRESETS = {
  essentials: {
    id: 'essentials',
    label: 'Essentials',
    description: 'Concise overview focusing on core ideas. Minimal formalism.',
    defaultPerspective: 'intuitive',
    allowedLayers: [
      'motivation',
      'intuition',
      'core_explanation',
      'summary'
    ],
    excludedLayers: [
      'mathematics',
      'algorithm',
      'implementation',
      'laboratory',
      'limitations_tradeoffs'
    ],
    depthRules: {
      maxSectionsPerLayer: 1,
      includeMotivation: true,
      includeContext: false,
      includeIntuition: true,
      includeCoreExplanation: true,
      includeVisualization: true,
      includeMathematics: false,
      includeAlgorithm: false,
      includeImplementation: false,
      includeLaboratory: false,
      includeMisconception: false,
      includeAssessment: false,
      includeSummary: true,
      includeForwardConnections: false,
      maxWordCountPerSection: 150,
      preferAnalogies: true,
      preferFormulas: false,
      preferCode: false,
      preferResearchPapers: false
    }
  },
  standard: {
    id: 'standard',
    label: 'Standard',
    description: 'Balanced explanation with available visualizations and examples.',
    defaultPerspective: 'intuitive',
    allowedLayers: [
      'motivation',
      'context',
      'intuition',
      'core_explanation',
      'visualization',
      'mathematics',
      'algorithm',
      'implementation',
      'laboratory',
      'misconception',
      'assessment',
      'summary',
      'forward_connections'
    ],
    excludedLayers: [],
    depthRules: {
      maxSectionsPerLayer: 2,
      includeMotivation: true,
      includeContext: true,
      includeIntuition: true,
      includeCoreExplanation: true,
      includeVisualization: true,
      includeMathematics: true,
      includeAlgorithm: true,
      includeImplementation: true,
      includeLaboratory: true,
      includeMisconception: true,
      includeAssessment: true,
      includeSummary: true,
      includeForwardConnections: true,
      maxWordCountPerSection: 300,
      preferAnalogies: true,
      preferFormulas: true,
      preferCode: true,
      preferResearchPapers: false
    }
  },
  deep_dive: {
    id: 'deep_dive',
    label: 'Deep Dive',
    description: 'Comprehensive coverage including mathematics, algorithms, and implementation.',
    defaultPerspective: 'mathematical',
    allowedLayers: [
      'motivation',
      'context',
      'intuition',
      'core_explanation',
      'visualization',
      'mathematics',
      'algorithm',
      'implementation',
      'laboratory',
      'misconception',
      'assessment',
      'summary',
      'forward_connections'
    ],
    excludedLayers: [],
    depthRules: {
      maxSectionsPerLayer: 3,
      includeMotivation: true,
      includeContext: true,
      includeIntuition: true,
      includeCoreExplanation: true,
      includeVisualization: true,
      includeMathematics: true,
      includeAlgorithm: true,
      includeImplementation: true,
      includeLaboratory: true,
      includeMisconception: true,
      includeAssessment: true,
      includeSummary: true,
      includeForwardConnections: true,
      maxWordCountPerSection: 500,
      preferAnalogies: true,
      preferFormulas: true,
      preferCode: true,
      preferResearchPapers: true
    }
  },
  research_notes: {
    id: 'research_notes',
    label: 'Research Notes',
    description: 'Research-oriented with historical context, limitations, and open questions.',
    defaultPerspective: 'research',
    allowedLayers: [
      'motivation',
      'context',
      'intuition',
      'core_explanation',
      'visualization',
      'mathematics',
      'algorithm',
      'implementation',
      'laboratory',
      'misconception',
      'assessment',
      'summary',
      'forward_connections'
    ],
    excludedLayers: [],
    depthRules: {
      maxSectionsPerLayer: 3,
      includeMotivation: true,
      includeContext: true,
      includeIntuition: true,
      includeCoreExplanation: true,
      includeVisualization: true,
      includeMathematics: true,
      includeAlgorithm: true,
      includeImplementation: true,
      includeLaboratory: true,
      includeMisconception: true,
      includeAssessment: true,
      includeSummary: true,
      includeForwardConnections: true,
      maxWordCountPerSection: 600,
      preferAnalogies: true,
      preferFormulas: true,
      preferCode: true,
      preferResearchPapers: true
    }
  }
};

function createDifficultyLadder() {
  function getPreset(id) {
    return DIFFICULTY_PRESETS[id] || null;
  }

  function getAllPresets() {
    var result = [];
    var keys = Object.keys(DIFFICULTY_PRESETS);
    for (var i = 0; i < keys.length; i++) {
      result.push(DIFFICULTY_PRESETS[keys[i]]);
    }
    return result;
  }

  function getAllPresetIds() {
    return Object.keys(DIFFICULTY_PRESETS);
  }

  function applyPreset(plan, presetId) {
    if (!plan || typeof plan !== 'object') return plan;
    var preset = getPreset(presetId);
    if (!preset) return plan;

    var updated = {};
    var planKeys = Object.keys(plan);
    for (var i = 0; i < planKeys.length; i++) {
      updated[planKeys[i]] = plan[planKeys[i]];
    }

    updated.difficulty = preset.id;

    if (Array.isArray(updated.layers)) {
      var filteredLayers = [];
      for (var j = 0; j < updated.layers.length; j++) {
        var layer = updated.layers[j];
        var allowed = false;
        for (var k = 0; k < preset.allowedLayers.length; k++) {
          if (preset.allowedLayers[k] === layer.id) {
            allowed = true;
            break;
          }
        }
        if (allowed) {
          filteredLayers.push(layer);
        }
      }
      updated.layers = filteredLayers;
    }

    updated.depthRules = preset.depthRules;
    updated.defaultPerspective = preset.defaultPerspective;

    return updated;
  }

  function getAllowedLayers(presetId) {
    var preset = getPreset(presetId);
    if (!preset) return [];
    return preset.allowedLayers.slice();
  }

  function getDepthRules(presetId) {
    var preset = getPreset(presetId);
    if (!preset) return null;
    return {
      maxSectionsPerLayer: preset.depthRules.maxSectionsPerLayer,
      maxWordCountPerSection: preset.depthRules.maxWordCountPerSection,
      preferAnalogies: preset.depthRules.preferAnalogies,
      preferFormulas: preset.depthRules.preferFormulas,
      preferCode: preset.depthRules.preferCode,
      preferResearchPapers: preset.depthRules.preferResearchPapers
    };
  }

  function getDefaultPerspective(presetId) {
    var preset = getPreset(presetId);
    if (!preset) return 'intuitive';
    return preset.defaultPerspective;
  }

  return {
    getPreset: getPreset,
    getAllPresets: getAllPresets,
    getAllPresetIds: getAllPresetIds,
    applyPreset: applyPreset,
    getAllowedLayers: getAllowedLayers,
    getDepthRules: getDepthRules,
    getDefaultPerspective: getDefaultPerspective,
    DIFFICULTY_PRESETS: DIFFICULTY_PRESETS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createDifficultyLadder = createDifficultyLadder;
}

export { createDifficultyLadder, DIFFICULTY_PRESETS };
