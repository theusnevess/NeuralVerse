/**
 * NV-1300-D1A — Multi-Perspective Engine
 *
 * Allows the same didactic plan to be presented through different explanation
 * styles without changing factual content. Each perspective changes emphasis, not truth.
 *
 * Deterministic. No Math.random. No Date.now.
 */

const PERSPECTIVES = {
  intuitive: {
    id: 'intuitive',
    label: 'Intuitive',
    description: 'Plain language, mental models, everyday reasoning.',
    emphasis: ['motivation', 'intuition', 'core_explanation', 'summary'],
    deemphasis: ['mathematics', 'algorithm'],
    styleNotes: [
      'Use everyday language',
      'Build mental models before formal definitions',
      'Prefer concrete examples over abstract statements',
      'Minimize jargon'
    ],
    sectionPriorities: {
      motivation: 1,
      context: 3,
      intuition: 1,
      core_explanation: 2,
      visualization: 2,
      mathematics: 6,
      algorithm: 5,
      implementation: 4,
      laboratory: 3,
      misconception: 3,
      assessment: 4,
      summary: 1,
      forward_connections: 4
    }
  },
  visual: {
    id: 'visual',
    label: 'Visual',
    description: 'Spatial reasoning, diagram-first explanations.',
    emphasis: ['visualization', 'intuition', 'core_explanation'],
    deemphasis: ['mathematics', 'algorithm'],
    styleNotes: [
      'Lead with visual representations',
      'Describe spatial relationships',
      'Reference parametric visualizations when available',
      'Use geometric reasoning'
    ],
    sectionPriorities: {
      motivation: 3,
      context: 3,
      intuition: 1,
      core_explanation: 2,
      visualization: 1,
      mathematics: 5,
      algorithm: 4,
      implementation: 3,
      laboratory: 2,
      misconception: 3,
      assessment: 3,
      summary: 2,
      forward_connections: 4
    }
  },
  mathematical: {
    id: 'mathematical',
    label: 'Mathematical',
    description: 'Formal definitions, formulas, assumptions, derivations.',
    emphasis: ['mathematics', 'algorithm', 'core_explanation'],
    deemphasis: ['motivation', 'intuition'],
    styleNotes: [
      'Lead with formal definitions',
      'State assumptions explicitly',
      'Use precise notation',
      'Provide derivations when available'
    ],
    sectionPriorities: {
      motivation: 4,
      context: 3,
      intuition: 4,
      core_explanation: 2,
      visualization: 3,
      mathematics: 1,
      algorithm: 1,
      implementation: 3,
      laboratory: 3,
      misconception: 2,
      assessment: 2,
      summary: 3,
      forward_connections: 3
    }
  },
  engineering: {
    id: 'engineering',
    label: 'Engineering',
    description: 'System constraints, trade-offs, production considerations.',
    emphasis: ['implementation', 'limitations_tradeoffs', 'laboratory'],
    deemphasis: ['motivation', 'intuition'],
    styleNotes: [
      'Focus on system constraints',
      'Discuss trade-offs explicitly',
      'Address production considerations',
      'Cover failure modes'
    ],
    sectionPriorities: {
      motivation: 4,
      context: 2,
      intuition: 4,
      core_explanation: 3,
      visualization: 3,
      mathematics: 3,
      algorithm: 2,
      implementation: 1,
      laboratory: 1,
      misconception: 2,
      assessment: 3,
      summary: 3,
      forward_connections: 2
    }
  },
  implementation_first: {
    id: 'implementation_first',
    label: 'Implementation First',
    description: 'Algorithm, code reasoning, execution steps.',
    emphasis: ['algorithm', 'implementation', 'laboratory'],
    deemphasis: ['motivation', 'context'],
    styleNotes: [
      'Lead with algorithmic structure',
      'Reference code patterns',
      'Connect to laboratory execution',
      'Focus on computational steps'
    ],
    sectionPriorities: {
      motivation: 5,
      context: 4,
      intuition: 3,
      core_explanation: 3,
      visualization: 3,
      mathematics: 3,
      algorithm: 1,
      implementation: 1,
      laboratory: 1,
      misconception: 3,
      assessment: 2,
      summary: 3,
      forward_connections: 3
    }
  },
  historical: {
    id: 'historical',
    label: 'Historical',
    description: 'Origin, development, motivation from historical problems.',
    emphasis: ['context', 'motivation', 'core_explanation'],
    deemphasis: ['implementation', 'laboratory'],
    styleNotes: [
      'Trace the historical development',
      'Explain the problem that motivated the concept',
      'Reference key papers and researchers',
      'Show evolution of understanding'
    ],
    sectionPriorities: {
      motivation: 1,
      context: 1,
      intuition: 2,
      core_explanation: 2,
      visualization: 3,
      mathematics: 3,
      algorithm: 3,
      implementation: 4,
      laboratory: 4,
      misconception: 2,
      assessment: 3,
      summary: 2,
      forward_connections: 1
    }
  },
  research: {
    id: 'research',
    label: 'Research',
    description: 'Papers, benchmarks, limitations, open questions.',
    emphasis: ['limitations_tradeoffs', 'forward_connections', 'context'],
    deemphasis: ['intuition', 'motivation'],
    styleNotes: [
      'Reference relevant research papers',
      'Discuss benchmarks and evaluations',
      'Highlight open questions',
      'Emphasize limitations and future directions'
    ],
    sectionPriorities: {
      motivation: 3,
      context: 1,
      intuition: 4,
      core_explanation: 3,
      visualization: 3,
      mathematics: 2,
      algorithm: 2,
      implementation: 3,
      laboratory: 3,
      misconception: 1,
      assessment: 2,
      summary: 3,
      forward_connections: 1
    }
  },
  analogy_driven: {
    id: 'analogy_driven',
    label: 'Analogy Driven',
    description: 'Domain analogies with explicit mapping and limitation warnings.',
    emphasis: ['intuition', 'misconception', 'core_explanation'],
    deemphasis: ['mathematics', 'algorithm'],
    styleNotes: [
      'Lead with a domain analogy',
      'Map analogy components explicitly',
      'State analogy limitations',
      'Warn about invalid interpretations'
    ],
    sectionPriorities: {
      motivation: 2,
      context: 3,
      intuition: 1,
      core_explanation: 2,
      visualization: 3,
      mathematics: 5,
      algorithm: 5,
      implementation: 4,
      laboratory: 3,
      misconception: 1,
      assessment: 3,
      summary: 2,
      forward_connections: 4
    }
  }
};

function createMultiPerspectiveEngine() {
  function getPerspective(id) {
    return PERSPECTIVES[id] || null;
  }

  function getAllPerspectives() {
    var result = [];
    var keys = Object.keys(PERSPECTIVES);
    for (var i = 0; i < keys.length; i++) {
      result.push(PERSPECTIVES[keys[i]]);
    }
    return result;
  }

  function getAllPerspectiveIds() {
    return Object.keys(PERSPECTIVES);
  }

  function selectPerspective(input) {
    if (!input || typeof input !== 'object') return 'intuitive';

    var perspective = input.perspective;
    if (perspective && PERSPECTIVES[perspective]) return perspective;

    var intent = input.intent || '';
    var mode = input.mode || '';
    var difficulty = input.difficulty || 'standard';

    if (intent === 'analogy' || mode === 'analogy-first') return 'analogy_driven';
    if (intent === 'compare' || mode === 'comparison') return 'engineering';
    if (intent === 'deepen' || difficulty === 'deep_dive') return 'mathematical';
    if (intent === 'transfer' || mode === 'transfer') return 'engineering';
    if (difficulty === 'research_notes') return 'research';
    if (difficulty === 'essentials') return 'intuitive';
    if (mode === 'visual-intuition') return 'visual';
    if (mode === 'mathematical') return 'mathematical';
    if (mode === 'engineering') return 'engineering';
    if (mode === 'step-by-step') return 'implementation_first';
    if (mode === 'research') return 'research';
    if (mode === 'socratic') return 'intuitive';

    return 'intuitive';
  }

  function applyPerspective(plan, perspectiveId) {
    if (!plan || typeof plan !== 'object') return plan;
    var perspective = getPerspective(perspectiveId);
    if (!perspective) return plan;

    var updated = {};
    var planKeys = Object.keys(plan);
    for (var i = 0; i < planKeys.length; i++) {
      updated[planKeys[i]] = plan[planKeys[i]];
    }

    updated.selectedPerspective = perspective.id;

    if (Array.isArray(updated.sections)) {
      var sections = updated.sections;
      for (var j = 0; j < sections.length; j++) {
        var section = sections[j];
        var priority = perspective.sectionPriorities[section.id] || 3;
        section._perspectivePriority = priority;
        section._perspectiveStyle = perspective.styleNotes;
      }

      sections.sort(function (a, b) {
        return (a._perspectivePriority || 3) - (b._perspectivePriority || 3);
      });

      updated.sections = sections;
    }

    if (Array.isArray(updated.layers)) {
      for (var k = 0; k < updated.layers.length; k++) {
        var layer = updated.layers[k];
        var layerPriority = perspective.sectionPriorities[layer.id] || 3;
        layer._perspectivePriority = layerPriority;
      }
    }

    return updated;
  }

  function validatePerspectiveOutput(plan) {
    if (!plan || typeof plan !== 'object') {
      return { valid: false, errors: ['Plan is not an object'] };
    }

    var errors = [];

    if (!plan.selectedPerspective) {
      errors.push('No selectedPerspective in plan');
    } else if (!PERSPECTIVES[plan.selectedPerspective]) {
      errors.push('Unknown perspective: ' + plan.selectedPerspective);
    }

    if (Array.isArray(plan.sections)) {
      var seenIds = Object.create(null);
      for (var i = 0; i < plan.sections.length; i++) {
        var s = plan.sections[i];
        if (!s.id) {
          errors.push('Section at index ' + i + ' missing id');
        } else if (seenIds[s.id]) {
          errors.push('Duplicate section id after perspective sort: ' + s.id);
        } else {
          seenIds[s.id] = true;
        }
      }
    }

    return { valid: errors.length === 0, errors: errors };
  }

  return {
    getPerspective: getPerspective,
    getAllPerspectives: getAllPerspectives,
    getAllPerspectiveIds: getAllPerspectiveIds,
    selectPerspective: selectPerspective,
    applyPerspective: applyPerspective,
    validatePerspectiveOutput: validatePerspectiveOutput,
    PERSPECTIVES: PERSPECTIVES
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createMultiPerspectiveEngine = createMultiPerspectiveEngine;
}

export { createMultiPerspectiveEngine, PERSPECTIVES };
