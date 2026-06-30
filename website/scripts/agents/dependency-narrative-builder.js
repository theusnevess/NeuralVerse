/**
 * NV-1300-D3B — Dependency Narrative Builder
 *
 * Generates deterministic explanations describing why the
 * dependency roadmap exists. Purely deterministic templates.
 * No LLM.
 *
 * Read-only, deterministic, no learner inference.
 */

const NARRATIVE_TEMPLATES = {
  intro: 'To understand {target}, one must first understand {source}.',
  progression: 'Before learning {target}, the learner needs {source}, because {reason}.',
  preparation: 'This prepares the learner for understanding {next}.',
  enabler: 'Once {source} is understood, {target} becomes more accessible.',
  foundation: '{source} provides the foundational knowledge required for {target}.',
  connection: 'Understanding {source} enables {target} because {reason}.',
  summary: 'The dependency path from {source} to {target} follows a logical progression of concepts.'
};

function createDependencyNarrativeBuilder() {

  function getCapabilities() {
    return {
      name: 'DependencyNarrativeBuilder',
      version: '1.0.0',
      methods: [
        'buildNarrative',
        'buildProgressionNarrative',
        'buildGoalNarrative',
        'getNarrativeTemplates',
        'explainNarrative'
      ]
    };
  }

  function getNarrativeTemplates() {
    return Object.keys(NARRATIVE_TEMPLATES);
  }

  function buildNarrative(source, target, context = {}) {
    if (!source || !target) {
      return { valid: false, error: 'Missing source or target' };
    }

    const reason = context.reason || `${source} is a prerequisite for ${target}`;
    const next = context.next || target;

    const sentences = [];

    sentences.push(fillTemplate(NARRATIVE_TEMPLATES.intro, source, target, reason));
    sentences.push(fillTemplate(NARRATIVE_TEMPLATES.progression, source, target, reason));
    sentences.push(fillTemplate(NARRATIVE_TEMPLATES.preparation, source, next, reason));
    sentences.push(fillTemplate(NARRATIVE_TEMPLATES.enabler, source, target, reason));

    return {
      valid: true,
      source,
      target,
      narrative: sentences.join(' '),
      sentences,
      evidence: {
        sourceType: 'curriculum',
        sourceId: source,
        targetId: target,
        reason
      }
    };
  }

  function buildProgressionNarrative(chain, context = {}) {
    if (!Array.isArray(chain) || chain.length === 0) {
      return { valid: false, error: 'Invalid chain' };
    }

    const narratives = [];

    for (let i = 0; i < chain.length - 1; i++) {
      const source = chain[i];
      const target = chain[i + 1];
      const reason = context.reasons?.[i] || `${source} leads to ${target}`;

      narratives.push({
        source: typeof source === 'string' ? source : source.id || source.name,
        target: typeof target === 'string' ? target : target.id || target.name,
        narrative: buildNarrative(
          typeof source === 'string' ? source : source.id || source.name,
          typeof target === 'string' ? target : target.id || target.name,
          { reason }
        )
      });
    }

    const fullNarrative = narratives.map(n => n.narrative.narrative).join(' ');

    return {
      valid: true,
      chain: chain.map(c => typeof c === 'string' ? c : c.id || c.name),
      narratives,
      fullNarrative
    };
  }

  function buildGoalNarrative(goal, prerequisites, context = {}) {
    if (!goal || !Array.isArray(prerequisites)) {
      return { valid: false, error: 'Invalid input' };
    }

    const lines = [];

    lines.push(`To achieve the goal of understanding ${goal}, the following learning path is recommended:`);
    lines.push('');

    const byPriority = groupByPriority(prerequisites);

    if (byPriority.critical && byPriority.critical.length > 0) {
      lines.push('Critical Prerequisites:');
      for (const p of byPriority.critical) {
        const reason = p.reasoning || `${p.name || p.id} is essential for ${goal}`;
        lines.push(`  - ${p.name || p.id}: ${reason}`);
      }
      lines.push('');
    }

    if (byPriority.high && byPriority.high.length > 0) {
      lines.push('High Priority:');
      for (const p of byPriority.high) {
        const reason = p.reasoning || `${p.name || p.id} strongly supports ${goal}`;
        lines.push(`  - ${p.name || p.id}: ${reason}`);
      }
      lines.push('');
    }

    if (byPriority.medium && byPriority.medium.length > 0) {
      lines.push('Medium Priority:');
      for (const p of byPriority.medium) {
        const reason = p.reasoning || `${p.name || p.id} provides useful background`;
        lines.push(`  - ${p.name || p.id}: ${reason}`);
      }
      lines.push('');
    }

    if (byPriority.low && byPriority.low.length > 0) {
      lines.push('Low Priority:');
      for (const p of byPriority.low) {
        const reason = p.reasoning || `${p.name || p.id} offers additional context`;
        lines.push(`  - ${p.name || p.id}: ${reason}`);
      }
      lines.push('');
    }

    lines.push('The curriculum structure remains canonical. Only priority ordering is interpreted.');

    return {
      valid: true,
      goal,
      totalPrerequisites: prerequisites.length,
      narrative: lines.join('\n'),
      byPriority
    };
  }

  function fillTemplate(template, source, target, reason) {
    return template
      .replace(/\{source\}/g, source)
      .replace(/\{target\}/g, target)
      .replace(/\{reason\}/g, reason)
      .replace(/\{next\}/g, target);
  }

  function groupByPriority(prerequisites) {
    const grouped = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      background: []
    };

    for (const prereq of prerequisites) {
      const priority = prereq.priority || prereq.category || 'background';
      if (grouped[priority]) {
        grouped[priority].push(prereq);
      }
    }

    return grouped;
  }

  function explainNarrative(narrativeResult) {
    if (!narrativeResult || !narrativeResult.valid) {
      return 'No narrative available.';
    }

    return narrativeResult.narrative || narrativeResult.fullNarrative || 'No narrative content.';
  }

  return {
    getCapabilities,
    getNarrativeTemplates,
    buildNarrative,
    buildProgressionNarrative,
    buildGoalNarrative,
    explainNarrative
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.dependencyNarrativeBuilder = createDependencyNarrativeBuilder();
}

export { createDependencyNarrativeBuilder };
