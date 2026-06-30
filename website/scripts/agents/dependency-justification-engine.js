/**
 * NV-1300-D3B — Dependency Justification Engine
 *
 * Every dependency must answer: Why is this prerequisite required?
 *
 * Each justification includes:
 * - summary
 * - technical_reason
 * - pedagogical_reason
 * - importance
 * - dependency_type
 *
 * Read-only, deterministic, no learner inference.
 */

const JUSTIFICATION_TEMPLATES = {
  mathematics: {
    technical: 'Mathematical foundations provide the formal framework for {target}',
    pedagogical: 'Understanding {source} builds the mathematical intuition needed for {target}'
  },
  fundamental: {
    technical: '{source} is a core building block of {target}',
    pedagogical: 'Learning {source} establishes the conceptual vocabulary required for {target}'
  },
  algorithmic: {
    technical: '{target} directly applies algorithms and techniques from {source}',
    pedagogical: 'Knowledge of {source} enables understanding of {target} mechanisms'
  },
  implementation: {
    technical: '{target} requires practical skills developed through {source}',
    pedagogical: 'Hands-on experience with {source} prepares for implementing {target}'
  },
  conceptual: {
    technical: '{target} extends concepts introduced in {source}',
    pedagogical: 'The mental models from {source} transfer directly to understanding {target}'
  }
};

function createDependencyJustificationEngine() {

  function getCapabilities() {
    return {
      name: 'DependencyJustificationEngine',
      version: '1.0.0',
      methods: [
        'buildJustification',
        'validateJustification',
        'explainDependency',
        'findMissingJustifications',
        'getJustificationTemplates'
      ]
    };
  }

  function getJustificationTemplates() {
    return Object.keys(JUSTIFICATION_TEMPLATES);
  }

  function buildJustification(dependency, context = {}) {
    if (!dependency || typeof dependency !== 'object') {
      return { valid: false, error: 'Invalid dependency' };
    }

    const source = dependency.source || dependency.from;
    const target = dependency.target || dependency.to;
    const type = dependency.type || dependency.relationship || 'conceptual';

    if (!source || !target) {
      return { valid: false, error: 'Missing source or target' };
    }

    const template = JUSTIFICATION_TEMPLATES[type] || JUSTIFICATION_TEMPLATES.conceptual;
    const summary = generateSummary(source, target, type, context);
    const technicalReason = fillTemplate(template.technical, source, target, context);
    const pedagogicalReason = fillTemplate(template.pedagogical, source, target, context);
    const importance = computeImportance(type, context);
    const dependencyType = normalizeType(type);

    return {
      valid: true,
      source,
      target,
      summary,
      technicalReason,
      pedagogicalReason,
      importance,
      dependencyType,
      evidence: {
        sourceType: 'curriculum',
        sourceId: source,
        targetId: target,
        reason: `Dependency from ${source} to ${target}`
      }
    };
  }

  function generateSummary(source, target, type, context) {
    const summaries = {
      mathematics: `${source} provides mathematical foundations required for ${target}`,
      fundamental: `${source} is a fundamental prerequisite for understanding ${target}`,
      algorithmic: `${target} applies algorithms and techniques from ${source}`,
      implementation: `${target} requires practical skills developed in ${source}`,
      conceptual: `${target} builds upon concepts introduced in ${source}`
    };

    return summaries[type] || summaries.conceptual;
  }

  function fillTemplate(template, source, target, context) {
    return template
      .replace(/\{source\}/g, source)
      .replace(/\{target\}/g, target)
      .replace(/\{depth\}/g, context.depth || 'standard');
  }

  function computeImportance(type, context) {
    const baseImportance = {
      mathematics: 90,
      fundamental: 85,
      algorithmic: 80,
      implementation: 75,
      conceptual: 70
    };

    let importance = baseImportance[type] || 70;

    if (context.isDirect) {
      importance = Math.min(100, importance + 15);
    }

    if (context.depth && context.depth > 2) {
      importance = Math.max(30, importance - 10);
    }

    return importance;
  }

  function normalizeType(type) {
    if (!type) return 'conceptual';

    const normalized = type.toLowerCase().replace(/[\s-]+/g, '_');

    const validTypes = ['mathematics', 'fundamental', 'algorithmic', 'implementation', 'conceptual'];
    if (validTypes.includes(normalized)) {
      return normalized;
    }

    const typeMap = {
      required: 'fundamental',
      recommended: 'conceptual',
      optional_background: 'conceptual',
      enrichment: 'implementation',
      co_requisite: 'algorithmic'
    };

    return typeMap[normalized] || 'conceptual';
  }

  function validateJustification(justification) {
    if (!justification || typeof justification !== 'object') {
      return { valid: false, errors: ['Invalid justification object'] };
    }

    const errors = [];

    if (!justification.source) errors.push('Missing source');
    if (!justification.target) errors.push('Missing target');
    if (!justification.summary) errors.push('Missing summary');
    if (!justification.technicalReason) errors.push('Missing technical reason');
    if (!justification.pedagogicalReason) errors.push('Missing pedagogical reason');
    if (justification.importance === undefined) errors.push('Missing importance');
    if (!justification.dependencyType) errors.push('Missing dependency type');

    return {
      valid: errors.length === 0,
      errors
    };
  }

  function explainDependency(source, target, dependencyGraph, conceptIndex) {
    if (!source || !target) {
      return { valid: false, error: 'Missing source or target' };
    }

    const concepts = conceptIndex?.concepts || conceptIndex || [];
    const sourceConcept = concepts.find(c => c.id === source);
    const targetConcept = concepts.find(c => c.id === target);

    if (!sourceConcept || !targetConcept) {
      return { valid: false, error: 'Concept not found' };
    }

    const dependency = findDependency(source, target, dependencyGraph);
    const justification = buildJustification(dependency || {
      source,
      target,
      type: 'conceptual'
    });

    return {
      valid: true,
      source: { id: source, name: sourceConcept.name || source },
      target: { id: target, name: targetConcept.name || target },
      justification,
      explanation: formatExplanation(justification)
    };
  }

  function findDependency(source, target, dependencyGraph) {
    if (!dependencyGraph) return null;

    const edges = dependencyGraph.edges || [];
    return edges.find(e => {
      const eSource = e.source || e.from;
      const eTarget = e.target || e.to;
      return eSource === source && eTarget === target;
    }) || null;
  }

  function formatExplanation(justification) {
    if (!justification || !justification.valid) {
      return 'No justification available.';
    }

    return [
      justification.summary,
      '',
      'Technical:',
      justification.technicalReason,
      '',
      'Pedagogical:',
      justification.pedagogicalReason,
      '',
      `Importance: ${justification.importance}/100`
    ].join('\n');
  }

  function findMissingJustifications(dependencies, concepts) {
    if (!Array.isArray(dependencies)) return [];

    const missing = [];

    for (const dep of dependencies) {
      const justification = buildJustification(dep);
      if (!justification.valid) {
        missing.push({
          dependency: dep,
          reason: justification.error || 'Invalid justification'
        });
      }
    }

    return missing;
  }

  return {
    getCapabilities,
    getJustificationTemplates,
    buildJustification,
    validateJustification,
    explainDependency,
    findMissingJustifications
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.dependencyJustificationEngine = createDependencyJustificationEngine();
}

export { createDependencyJustificationEngine };
