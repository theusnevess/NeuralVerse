/**
 * NV-1300-D3B — Curriculum Explanation Composer
 *
 * Produces structured explanations composed of:
 * - Overview
 * - Dependency Tree
 * - Priority Concepts
 * - Required Depth
 * - Dependency Justifications
 * - Recommended Progression
 * - Goal Summary
 *
 * The composer consumes outputs from every D3 module.
 *
 * Read-only, deterministic, no learner inference.
 */

function createCurriculumExplanationComposer() {

  function getCapabilities() {
    return {
      name: 'CurriculumExplanationComposer',
      version: '1.0.0',
      methods: [
        'composeExplanation',
        'composeOverview',
        'composeDependencyTree',
        'composePriorityConcepts',
        'composeDepthSummary',
        'composeJustifications',
        'composeProgression',
        'composeGoalSummary'
      ]
    };
  }

  function composeExplanation(goal, context = {}) {
    if (!goal) {
      return { valid: false, error: 'No goal provided' };
    }

    const sections = [];

    const overview = composeOverview(goal, context);
    sections.push(overview);

    if (context.prerequisites && context.prerequisites.length > 0) {
      const depTree = composeDependencyTree(context.prerequisites);
      sections.push(depTree);

      const priorities = composePriorityConcepts(context.prerequisites);
      sections.push(priorities);

      const depth = composeDepthSummary(context.prerequisites);
      sections.push(depth);

      const justifications = composeJustifications(context.prerequisites);
      sections.push(justifications);
    }

    if (context.progression) {
      const progression = composeProgression(context.progression);
      sections.push(progression);
    }

    const goalSummary = composeGoalSummary(goal, context);
    sections.push(goalSummary);

    return {
      valid: true,
      goal,
      sections,
      timestamp: null,
      status: 'operational'
    };
  }

  function composeOverview(goal, context) {
    const lines = [];
    lines.push(`This curriculum explanation addresses the goal: ${goal}.`);

    if (context.totalPrerequisites) {
      lines.push(`It identifies ${context.totalPrerequisites} prerequisite(s) required to achieve this goal.`);
    }

    if (context.goalConcept) {
      lines.push(`The target concept is: ${context.goalConcept.name || context.goalConcept.id}.`);
    }

    lines.push('The curriculum structure remains canonical. Only interpretations are provided.');

    return {
      title: 'Overview',
      content: lines.join(' '),
      type: 'text'
    };
  }

  function composeDependencyTree(prerequisites) {
    if (!Array.isArray(prerequisites) || prerequisites.length === 0) {
      return {
        title: 'Dependency Tree',
        content: 'No dependencies identified.',
        type: 'text'
      };
    }

    const lines = [];
    lines.push('Dependency hierarchy:');
    lines.push('');

    const byDepth = groupByDepth(prerequisites);

    for (const [depth, prereqs] of Object.entries(byDepth).sort((a, b) => a[0] - b[0])) {
      lines.push(`Depth ${depth}:`);
      for (const p of prereqs) {
        const name = p.name || p.id;
        const priority = p.priorityLabel || p.priority || '';
        lines.push(`  - ${name} [${priority}]`);
      }
      lines.push('');
    }

    return {
      title: 'Dependency Tree',
      content: lines.join('\n'),
      type: 'tree'
    };
  }

  function composePriorityConcepts(prerequisites) {
    if (!Array.isArray(prerequisites) || prerequisites.length === 0) {
      return {
        title: 'Priority Concepts',
        content: 'No priority concepts identified.',
        type: 'text'
      };
    }

    const lines = [];
    const byPriority = groupByPriority(prerequisites);

    for (const [priority, prereqs] of Object.entries(byPriority)) {
      if (prereqs.length === 0) continue;
      lines.push(`${priority.toUpperCase()}:`);
      for (const p of prereqs) {
        const name = p.name || p.id;
        const score = p.score !== undefined ? ` (${p.score}/100)` : '';
        lines.push(`  - ${name}${score}`);
      }
      lines.push('');
    }

    return {
      title: 'Priority Concepts',
      content: lines.join('\n'),
      type: 'priority'
    };
  }

  function composeDepthSummary(prerequisites) {
    if (!Array.isArray(prerequisites) || prerequisites.length === 0) {
      return {
        title: 'Required Depth',
        content: 'No depth requirements identified.',
        type: 'text'
      };
    }

    const lines = [];
    lines.push('Required curriculum depth levels:');
    lines.push('');

    const depthGroups = {};
    for (const p of prerequisites) {
      const depth = p.depthLevel || p.depth || 'awareness';
      if (!depthGroups[depth]) depthGroups[depth] = [];
      depthGroups[depth].push(p.name || p.id);
    }

    for (const [depth, prereqs] of Object.entries(depthGroups)) {
      lines.push(`${depth}:`);
      for (const name of prereqs) {
        lines.push(`  - ${name}`);
      }
      lines.push('');
    }

    return {
      title: 'Required Depth',
      content: lines.join('\n'),
      type: 'depth'
    };
  }

  function composeJustifications(prerequisites) {
    if (!Array.isArray(prerequisites) || prerequisites.length === 0) {
      return {
        title: 'Dependency Justifications',
        content: 'No justifications available.',
        type: 'text'
      };
    }

    const lines = [];
    lines.push('Dependency justifications:');
    lines.push('');

    for (const p of prerequisites) {
      const name = p.name || p.id;
      const reason = p.reasoning || `Required for understanding the goal`;
      lines.push(`${name}:`);
      lines.push(`  ${reason}`);
      lines.push('');
    }

    return {
      title: 'Dependency Justifications',
      content: lines.join('\n'),
      type: 'justification'
    };
  }

  function composeProgression(progression) {
    if (!progression) {
      return {
        title: 'Recommended Progression',
        content: 'No progression information available.',
        type: 'text'
      };
    }

    const lines = [];
    lines.push('Recommended learning progression:');
    lines.push('');

    if (Array.isArray(progression)) {
      for (let i = 0; i < progression.length; i++) {
        const step = progression[i];
        const name = typeof step === 'string' ? step : step.name || step.id;
        lines.push(`${i + 1}. ${name}`);
      }
    } else if (progression.narrative) {
      lines.push(progression.narrative);
    }

    return {
      title: 'Recommended Progression',
      content: lines.join('\n'),
      type: 'progression'
    };
  }

  function composeGoalSummary(goal, context) {
    const lines = [];
    lines.push(`Goal: ${goal}`);

    if (context.totalPrerequisites) {
      lines.push(`Total prerequisites: ${context.totalPrerequisites}`);
    }

    if (context.byPriority) {
      const summary = [];
      for (const [priority, prereqs] of Object.entries(context.byPriority)) {
        if (prereqs.length > 0) {
          summary.push(`${prereqs.length} ${priority}`);
        }
      }
      if (summary.length > 0) {
        lines.push(`Breakdown: ${summary.join(', ')}`);
      }
    }

    lines.push('The curriculum remains canonical. Only interpretations are provided.');

    return {
      title: 'Goal Summary',
      content: lines.join('\n'),
      type: 'summary'
    };
  }

  function groupByDepth(prerequisites) {
    const grouped = {};
    for (const prereq of prerequisites) {
      const depth = prereq.depth || 1;
      if (!grouped[depth]) grouped[depth] = [];
      grouped[depth].push(prereq);
    }
    return grouped;
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
      const priority = prereq.priority || 'background';
      if (grouped[priority]) {
        grouped[priority].push(prereq);
      }
    }
    return grouped;
  }

  return {
    getCapabilities,
    composeExplanation,
    composeOverview,
    composeDependencyTree,
    composePriorityConcepts,
    composeDepthSummary,
    composeJustifications,
    composeProgression,
    composeGoalSummary
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.curriculumExplanationComposer = createCurriculumExplanationComposer();
}

export { createCurriculumExplanationComposer };
