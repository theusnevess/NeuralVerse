/**
 * NV-1300-D3A — Typed Dependency Engine
 *
 * Manages typed dependency relationships:
 * - required: Necessary prerequisite
 * - recommended: Strongly useful prerequisite
 * - optional_background: Helpful context but not required
 * - enrichment: Extension or deepening material
 * - co_requisite: Should be studied alongside the target
 *
 * Supports alias normalization, validation, and filtering.
 * Read-only, deterministic, no learner inference.
 */

const DEPENDENCY_TYPES = {
  required: {
    label: 'Required',
    description: 'Necessary prerequisite',
    alias: ['required', 'prerequisite', 'must']
  },
  recommended: {
    label: 'Recommended',
    description: 'Strongly useful prerequisite',
    alias: ['recommended', 'suggested', 'useful']
  },
  optional_background: {
    label: 'Optional Background',
    description: 'Helpful context but not required',
    alias: ['optional_background', 'optional background', 'background', 'optional']
  },
  enrichment: {
    label: 'Enrichment',
    description: 'Extension or deepening material',
    alias: ['enrichment', 'extension', 'deepening', 'supplementary']
  },
  co_requisite: {
    label: 'Co-requisite',
    description: 'Should be studied alongside the target',
    alias: ['co_requisite', 'co-requisite', 'corequisite', 'parallel', 'alongside']
  }
};

const TYPE_KEYS = Object.keys(DEPENDENCY_TYPES);

function createTypedDependencyEngine() {

  function getCapabilities() {
    return {
      name: 'TypedDependencyEngine',
      version: '1.0.0',
      supportedTypes: TYPE_KEYS.slice(),
      methods: [
        'getSupportedTypes',
        'normalizeDependencyType',
        'validateDependencyType',
        'classifyDependency',
        'filterByType',
        'explainType'
      ]
    };
  }

  function getSupportedTypes() {
    return TYPE_KEYS.slice();
  }

  function normalizeDependencyType(type) {
    if (!type || typeof type !== 'string') {
      return null;
    }

    const normalized = type.toLowerCase().trim().replace(/[\s-]+/g, '_');

    if (DEPENDENCY_TYPES[normalized]) {
      return normalized;
    }

    for (const [canonical, config] of Object.entries(DEPENDENCY_TYPES)) {
      for (const alias of config.alias) {
        if (alias.toLowerCase() === type.toLowerCase() ||
            alias.toLowerCase().replace(/[\s-]+/g, '_') === normalized) {
          return canonical;
        }
      }
    }

    return null;
  }

  function validateDependencyType(type) {
    const normalized = normalizeDependencyType(type);
    return normalized !== null;
  }

  function classifyDependency(edge) {
    if (!edge || typeof edge !== 'object') {
      return { valid: false, type: null, error: 'Invalid edge' };
    }

    const rawType = edge.type || edge.relationship || edge.kind;
    const normalized = normalizeDependencyType(rawType);

    if (normalized === null) {
      return { valid: false, type: null, error: 'Unknown dependency type', rawType };
    }

    return { valid: true, type: normalized };
  }

  function filterByType(edges, type) {
    if (!Array.isArray(edges)) {
      return [];
    }

    const normalized = normalizeDependencyType(type);
    if (normalized === null) {
      return [];
    }

    return edges.filter(edge => {
      const classified = classifyDependency(edge);
      return classified.valid && classified.type === normalized;
    });
  }

  function explainType(type) {
    const normalized = normalizeDependencyType(type);
    if (normalized === null) {
      return { valid: false, type: null, error: 'Unknown type' };
    }

    const config = DEPENDENCY_TYPES[normalized];
    return {
      valid: true,
      type: normalized,
      label: config.label,
      description: config.description,
      aliases: config.alias.slice()
    };
  }

  return {
    getCapabilities,
    getSupportedTypes,
    normalizeDependencyType,
    validateDependencyType,
    classifyDependency,
    filterByType,
    explainType
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.typedDependencyEngine = createTypedDependencyEngine();
}

export { createTypedDependencyEngine };
