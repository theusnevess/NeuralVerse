/**
 * NV-1300-D3B — Prerequisite Depth Engine
 *
 * Supports five deterministic depth levels for prerequisite relationships:
 * - Awareness
 * - Basic Understanding
 * - Working Knowledge
 * - Advanced Understanding
 * - Mastery
 *
 * IMPORTANT: These are curriculum metadata.
 * They NEVER estimate learner mastery.
 * They define required curriculum depth, not learner ability.
 *
 * Read-only, deterministic, no learner inference.
 */

const DEPTH_LEVELS = {
  awareness: {
    label: 'Awareness',
    order: 1,
    description: 'Basic familiarity with concept',
    complexity: 1
  },
  basic_understanding: {
    label: 'Basic Understanding',
    order: 2,
    description: 'Foundational comprehension',
    complexity: 2
  },
  working_knowledge: {
    label: 'Working Knowledge',
    order: 3,
    description: 'Practical application capability',
    complexity: 3
  },
  advanced_understanding: {
    label: 'Advanced Understanding',
    order: 4,
    description: 'Deep conceptual mastery',
    complexity: 4
  },
  mastery: {
    label: 'Mastery',
    order: 5,
    description: 'Complete command of subject',
    complexity: 5
  }
};

const LEVEL_KEYS = Object.keys(DEPTH_LEVELS);

function createPrerequisiteDepthEngine() {

  function getCapabilities() {
    return {
      name: 'PrerequisiteDepthEngine',
      version: '1.0.0',
      methods: [
        'getSupportedDepthLevels',
        'validateDepthLevel',
        'normalizeDepthLevel',
        'compareDepthLevels',
        'explainDepthLevel',
        'assignDepthLevel',
        'getDepthForDependency'
      ]
    };
  }

  function getSupportedDepthLevels() {
    return LEVEL_KEYS.slice();
  }

  function validateDepthLevel(level) {
    if (!level || typeof level !== 'string') return false;
    const normalized = level.toLowerCase().trim().replace(/[\s-]+/g, '_');
    return LEVEL_KEYS.includes(normalized);
  }

  function normalizeDepthLevel(level) {
    if (!level || typeof level !== 'string') return null;

    const normalized = level.toLowerCase().trim().replace(/[\s-]+/g, '_');

    if (DEPTH_LEVELS[normalized]) {
      return normalized;
    }

    const aliases = {
      'aware': 'awareness',
      'basic': 'basic_understanding',
      'working': 'working_knowledge',
      'advanced': 'advanced_understanding',
      'master': 'mastery',
      'expert': 'mastery'
    };

    return aliases[normalized] || null;
  }

  function compareDepthLevels(a, b) {
    const normalizedA = normalizeDepthLevel(a);
    const normalizedB = normalizeDepthLevel(b);

    if (!normalizedA || !normalizedB) return 0;

    const orderA = DEPTH_LEVELS[normalizedA].order;
    const orderB = DEPTH_LEVELS[normalizedB].order;

    if (orderA < orderB) return -1;
    if (orderA > orderB) return 1;
    return 0;
  }

  function explainDepthLevel(level) {
    const normalized = normalizeDepthLevel(level);
    if (!normalized) {
      return { valid: false, error: 'Unknown depth level' };
    }

    const config = DEPTH_LEVELS[normalized];
    return {
      valid: true,
      level: normalized,
      label: config.label,
      description: config.description,
      order: config.order,
      complexity: config.complexity
    };
  }

  function assignDepthLevel(sourceConcept, targetConcept, context = {}) {
    if (!sourceConcept || !targetConcept) {
      return { valid: false, error: 'Invalid concepts' };
    }

    const sourceType = sourceConcept.type || sourceConcept.category || '';
    const targetType = targetConcept.type || targetConcept.category || '';

    if (sourceType === 'mathematics' || targetType === 'mathematics') {
      return { valid: true, depth: 'working_knowledge', reason: 'Mathematical prerequisite requires working knowledge' };
    }

    if (sourceType === 'fundamental' || targetType === 'fundamental') {
      return { valid: true, depth: 'basic_understanding', reason: 'Fundamental concept requires basic understanding' };
    }

    if (context.depth === 1) {
      return { valid: true, depth: 'working_knowledge', reason: 'Direct prerequisite requires working knowledge' };
    }

    if (context.depth === 2) {
      return { valid: true, depth: 'basic_understanding', reason: 'Indirect prerequisite requires basic understanding' };
    }

    return { valid: true, depth: 'awareness', reason: 'Distant prerequisite requires awareness' };
  }

  function getDepthForDependency(dependency, context = {}) {
    if (!dependency) {
      return { valid: false, error: 'Invalid dependency' };
    }

    const source = dependency.source || dependency.from;
    const target = dependency.target || dependency.to;
    const type = dependency.type || dependency.relationship || 'conceptual';
    const depth = dependency.depth || context.depth || 1;

    const level = assignDepthLevel(
      { id: source, type },
      { id: target },
      { depth }
    );

    return {
      valid: true,
      source,
      target,
      depthLevel: level.depth || 'awareness',
      reason: level.reason
    };
  }

  return {
    getCapabilities,
    getSupportedDepthLevels,
    validateDepthLevel,
    normalizeDepthLevel,
    compareDepthLevels,
    explainDepthLevel,
    assignDepthLevel,
    getDepthForDependency
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.prerequisiteDepthEngine = createPrerequisiteDepthEngine();
}

export { createPrerequisiteDepthEngine };
