/**
 * NV-1000-A3 — Visual & Interactive Media Agent
 *
 * Canonical visualization intelligence layer for NeuralVerse.
 * Produces deterministic, educational visualization recommendations and
 * specifications without generating arbitrary art or modifying curriculum data.
 */

const VISUAL_INTENT_PATTERNS = {
  visual_intuition: ['visualize', 'visual intuition', 'visual metaphor', 'look like', 'mental model'],
  diagram_recommendation: ['diagram', 'flowchart', 'architecture', 'pipeline', 'map this', 'draw'],
  interactive_specification: ['interactive', 'simulation', 'widget', 'controls', 'parameter', 'slider'],
  comparison_visualization: ['compare', 'compare visually', 'visual comparison', 'versus', ' vs ', 'side by side', 'matrix'],
  animation_specification: ['animation', 'animate', 'motion', 'stages', 'transition', 'replay'],
  timeline_construction: ['timeline', 'chronological', 'sequence over time', 'training pipeline', 'inference pipeline'],
  mathematical_visualization: ['geometric', 'mathematical', 'vector', 'matrix', 'probability', 'optimization', 'latent'],
  scientific_illustration: ['illustration', 'scientific illustration', 'visual style', 'premium illustration', 'line work'],
  atlas_recommendation: ['atlas', 'graph view', 'knowledge graph', 'cluster', 'semantic neighborhood'],
  media_selection: ['best medium', 'teaching medium', 'media', 'should this be text', 'best representation']
};

const MODE_LABELS = {
  visual_intuition: 'Visual Intuition',
  diagram_recommendation: 'Diagram Recommendation',
  interactive_specification: 'Interactive Specification',
  comparison_visualization: 'Comparison Visualization',
  animation_specification: 'Animation Specification',
  timeline_construction: 'Timeline Construction',
  mathematical_visualization: 'Mathematical Visualization',
  scientific_illustration: 'Scientific Illustration',
  atlas_recommendation: 'Atlas Recommendation',
  media_selection: 'Media Selection'
};

const DIAGRAM_TYPES = [
  'flowchart',
  'layered architecture',
  'pipeline',
  'hierarchy',
  'timeline',
  'dependency tree',
  'comparison matrix',
  'coordinate system',
  'geometric representation',
  'process cycle',
  'state machine',
  'graph/network',
  'concept map'
];

function createVisualInteractiveMediaAgent() {
  const recommendationCache = new Map();
  let visualizationCatalog = null;

  function initialize() {
    discoverExistingVisualizations();
    return Promise.resolve({ status: 'ready', visualizations: visualizationCatalog.length });
  }

  function discoverExistingVisualizations() {
    if (visualizationCatalog) return visualizationCatalog;

    const registry = window.NeuralVerse?.visualizationRegistry;
    const registryItems = registry?.getAll?.() || registry?.getVisualizations?.() || [];
    const knownInteractiveArtifacts = [
      'distance metrics',
      'nearest neighbor',
      'rag pipeline',
      'self attention',
      'convolution intuition',
      'object detection',
      'segmentation',
      'bayes theorem',
      'overfitting',
      'forward propagation'
    ];

    visualizationCatalog = registryItems.length > 0
      ? registryItems.map((item) => String(item.id || item.title || item.name || '').toLowerCase()).filter(Boolean)
      : knownInteractiveArtifacts;

    return visualizationCatalog;
  }

  function canHandle(context) {
    return Boolean(context?.userQuery || context?.selectedArtifact || context?.selectedLesson);
  }

  async function run(context = {}, options = {}) {
    await initialize();
    if (!context) context = {};

    const query = context.userQuery || '';
    const mode = options.mode || detectIntent(query);
    const topic = resolveTopic(context, query);
    const cacheKey = JSON.stringify({ mode, topic, query: normalizeQuery(query), artifactType: context.artifactType || null });

    if (recommendationCache.has(cacheKey)) {
      return cloneWithTimestamp(recommendationCache.get(cacheKey));
    }

    const result = buildResponse(mode, topic, context, query);
    recommendationCache.set(cacheKey, result);
    return cloneWithTimestamp(result);
  }

  function detectIntent(query) {
    const lower = ` ${(query || '').toLowerCase()} `;

    for (const [intent, patterns] of Object.entries(VISUAL_INTENT_PATTERNS)) {
      if (patterns.some((pattern) => lower.includes(pattern))) return intent;
    }

    if (lower.includes('attention') || lower.includes('embedding') || lower.includes('vector')) {
      return 'mathematical_visualization';
    }

    return 'media_selection';
  }

  function buildResponse(mode, topic, context, query) {
    const diagram = chooseDiagramType(topic, query, context);
    const reusable = findReusableVisualization(topic, query, context);
    const sections = buildSectionsForMode(mode, topic, context, query, diagram, reusable);

    return {
      agentId: 'visual-interactive-media',
      agentName: 'Visual & Interactive Media Agent',
      mode,
      modeLabel: MODE_LABELS[mode] || 'Visualization Strategy',
      topic,
      chosenVisualization: diagram.type,
      reasoningStrategy: diagram.reason,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: 'Specifications are read-only educational recommendations. No curriculum or graph topology is modified.'
    };
  }

  function buildSectionsForMode(mode, topic, context, query, diagram, reusable) {
    const builders = {
      visual_intuition: () => buildVisualIntuition(topic, diagram),
      diagram_recommendation: () => buildDiagramRecommendation(topic, diagram),
      interactive_specification: () => buildInteractiveSpecification(topic, diagram, reusable),
      comparison_visualization: () => buildComparisonVisualization(topic, query),
      animation_specification: () => buildAnimationSpecification(topic, diagram),
      timeline_construction: () => buildTimelineConstruction(topic, diagram),
      mathematical_visualization: () => buildMathematicalVisualization(topic, query),
      scientific_illustration: () => buildScientificIllustration(topic, diagram),
      atlas_recommendation: () => buildAtlasRecommendation(topic, context),
      media_selection: () => buildMediaSelection(topic, diagram, reusable)
    };

    return (builders[mode] || builders.media_selection)();
  }

  function buildVisualIntuition(topic, diagram) {
    return [
      visualChoiceSection(diagram),
      {
        title: 'Mapped Visual Metaphor',
        type: 'visual-card',
        content: `Represent **${topic}** as a precise visual system: core entities become labeled nodes, transformations become directional traces, and uncertainty or weighting becomes controlled opacity or line thickness.`
      },
      {
        title: 'Where The Analogy Breaks',
        type: 'text',
        content: 'The image is a reasoning aid, not a literal physical model. It should not imply agency, hidden intent, or causal relationships that are not present in the underlying concept.'
      },
      accessibilitySection()
    ];
  }

  function buildDiagramRecommendation(topic, diagram) {
    return [
      visualChoiceSection(diagram),
      {
        title: 'Diagram Structure',
        type: 'visual-card',
        content: `Use a **${diagram.type}** with 3-6 primary regions, explicit labels, directional connectors, and one highlighted path showing how information moves through **${topic}**.`
      },
      {
        title: 'Supported Diagram Types',
        type: 'text',
        content: DIAGRAM_TYPES.map((type) => `- ${type}`).join('\n')
      },
      accessibilitySection()
    ];
  }

  function buildInteractiveSpecification(topic, diagram, reusable) {
    const reuseText = reusable
      ? `Reuse or extend the existing visualization scaffold related to **${reusable}** before creating a new experience.`
      : 'No directly matching interactive scaffold was found. Create a specification only; do not fabricate an executable widget in this phase.';

    return [
      visualChoiceSection(diagram),
      {
        title: 'Interactive Objective',
        type: 'visual-card',
        content: `Help learners manipulate visible parameters and observe how **${topic}** changes. ${reuseText}`
      },
      {
        title: 'Controls & Parameters',
        type: 'text',
        content: '- Sliders for the most important numeric variables\n- Toggle for simplified vs detailed view\n- Step controls for progressive explanation\n- Reset button returning to canonical defaults'
      },
      {
        title: 'Observable Behaviors',
        type: 'text',
        content: '- Learner changes one parameter at a time\n- Diagram updates labels and highlighted path deterministically\n- Invalid states are prevented or clearly explained\n- Reduced-motion mode replaces transitions with discrete states'
      },
      accessibilitySection()
    ];
  }

  function buildComparisonVisualization(topic, query) {
    const pair = extractComparisonPair(query) || ['Concept A', 'Concept B'];
    return [
      visualChoiceSection({ type: 'comparison matrix', reason: 'The request emphasizes aligned contrasts across shared dimensions.' }),
      {
        title: 'Side-by-Side Layout',
        type: 'comparison-table',
        content: `| Dimension | ${pair[0]} | ${pair[1]} |\n|---|---|---|\n| Representation | Show core structure | Show core structure |\n| Data Flow | Use one highlighted path | Use the equivalent highlighted path |\n| Strength | Mark with restrained cyan emphasis | Mark with restrained cyan emphasis |\n| Limitation | State visually without implying inferiority | State visually without implying inferiority |`
      },
      {
        title: 'Alignment Rule',
        type: 'text',
        content: 'Keep row labels identical across both sides so learners compare one dimension at a time instead of scanning two unrelated diagrams.'
      },
      accessibilitySection()
    ];
  }

  function buildAnimationSpecification(topic, diagram) {
    return [
      visualChoiceSection({ type: 'process animation', reason: 'The request asks for staged change over time rather than a static diagram.' }),
      {
        title: 'Animation Stages',
        type: 'timeline',
        content: `1. Initialize the visible entities for **${topic}**\n2. Highlight the first transformation or decision\n3. Advance one causal step at a time\n4. Pause at the educational bottleneck\n5. Replay the full flow with labels reduced`
      },
      {
        title: 'Pacing & Replay',
        type: 'text',
        content: 'Use short transitions under 400ms, include pause/play/replay controls, and provide a reduced-motion alternative that shows numbered static states.'
      },
      accessibilitySection()
    ];
  }

  function buildTimelineConstruction(topic) {
    return [
      visualChoiceSection({ type: 'timeline', reason: 'The concept is best explained as ordered stages with visible dependencies between steps.' }),
      {
        title: 'Timeline Structure',
        type: 'timeline',
        content: `1. Context setup for **${topic}**\n2. Input or data preparation\n3. Core transformation\n4. Intermediate validation or retrieval\n5. Output interpretation\n6. Optional branch for failure or edge cases`
      },
      {
        title: 'Branching Policy',
        type: 'text',
        content: 'Use a single primary timeline with one optional branch only when the branch changes learner reasoning. Avoid decorative forks.'
      },
      accessibilitySection()
    ];
  }

  function buildMathematicalVisualization(topic, query) {
    const geometry = chooseMathGeometry(topic, query);
    return [
      visualChoiceSection({ type: geometry.type, reason: geometry.reason }),
      {
        title: 'Geometric Intuition',
        type: 'visual-card',
        content: geometry.content
      },
      {
        title: 'Mathematical Boundary',
        type: 'text',
        content: 'The visual should preserve variable names, axes, and units where applicable. It must not hide approximation, dimensionality reduction, or probabilistic uncertainty.'
      },
      accessibilitySection()
    ];
  }

  function buildScientificIllustration(topic, diagram) {
    return [
      visualChoiceSection(diagram),
      {
        title: 'Illustration Guidance',
        type: 'visual-card',
        content: `Create a dark scientific illustration for **${topic}** using thin line work, restrained cyan accents, semantic labels, and low visual noise.`
      },
      {
        title: 'Style Constraints',
        type: 'text',
        content: '- No mascots, robots, glowing brains, or generic AI clichés\n- No decorative gradients that do not encode meaning\n- Every visual element must map to a concept, step, or relationship\n- Use contrast suitable for dark UI reading'
      },
      accessibilitySection()
    ];
  }

  function buildAtlasRecommendation(topic, context) {
    return [
      visualChoiceSection({ type: 'graph/network', reason: 'Atlas integration concerns semantic neighborhoods and dependency emphasis.' }),
      {
        title: 'Atlas Placement',
        type: 'visual-card',
        content: `Represent **${topic}** as a semantic node in its existing curriculum neighborhood. Emphasize dependencies and sibling concepts without changing graph topology.`
      },
      {
        title: 'Graph Policy',
        type: 'text',
        content: `- Highlight current node and immediate prerequisites\n- Group by existing path/module metadata\n- Use edge emphasis only for already-known relationships\n- Do not create new nodes or modify canonical relationships\n- Current route context: ${context.currentRoute || 'unknown'}`
      },
      accessibilitySection()
    ];
  }

  function buildMediaSelection(topic, diagram, reusable) {
    const medium = reusable ? 'interactive widget specification' : diagram.type;
    return [
      visualChoiceSection({ type: medium, reason: reusable ? 'An existing scaffold can be reused, reducing duplicate learning experiences.' : diagram.reason }),
      {
        title: 'Best Teaching Medium',
        type: 'visual-card',
        content: `For **${topic}**, start with a **${medium}** and pair it with a concise text explanation. Use animation or simulation only if learners need to observe state changes.`
      },
      {
        title: 'Fallback Mediums',
        type: 'text',
        content: '- Text: definitions and caveats\n- Diagram: structure and relationships\n- Animation: staged reasoning\n- Simulation: parameter sensitivity\n- Comparison table: aligned contrasts\n- Timeline: ordered workflows or research evolution'
      },
      accessibilitySection()
    ];
  }

  function visualChoiceSection(choice) {
    return {
      title: 'Chosen Visualization',
      type: 'visual-card',
      content: `**${choice.type}**\n\nReason:\n${choice.reason}`
    };
  }

  function accessibilitySection() {
    return {
      title: 'Accessibility & Responsive Behavior',
      type: 'text',
      content: '- Keyboard: all controls reachable with visible focus\n- Screen reader: include concise labels and state changes\n- Contrast: preserve readable text and semantic color contrast\n- Reduced motion: provide static stepped alternative\n- Mobile: stack cards vertically and keep touch targets at least 44px'
    };
  }

  function chooseDiagramType(topic, query, context) {
    const lower = `${topic} ${query} ${context.artifactType || ''}`.toLowerCase();
    if (lower.includes('architecture')) {
      return { type: 'layered architecture', reason: 'The concept implies stacked layers with clear separation of concerns.' };
    }
    if (lower.includes('hierarchy') || lower.includes('hierarchical')) {
      return { type: 'hierarchy', reason: 'The concept decomposes into nested or parent-child structures.' };
    }
    if (lower.includes('timeline') || lower.includes('chronological')) {
      return { type: 'timeline', reason: 'The concept involves ordered phases or temporal progression.' };
    }
    if (lower.includes('rag') || lower.includes('retrieval') || lower.includes('pipeline')) {
      return { type: 'pipeline', reason: 'The concept emphasizes ordered transformations and directional data flow.' };
    }
    if (lower.includes('attention') || lower.includes('matrix')) {
      return { type: 'attention matrix', reason: 'The concept depends on weighted relationships between query and context positions.' };
    }
    if (lower.includes('embedding') || lower.includes('vector') || lower.includes('latent')) {
      return { type: 'coordinate system', reason: 'The concept depends on geometric proximity, direction, and relative distance.' };
    }
    if (lower.includes('compare') || lower.includes(' vs ') || lower.includes('versus')) {
      return { type: 'comparison matrix', reason: 'Aligned dimensions reduce cognitive load during comparison.' };
    }
    if (lower.includes('graph') || lower.includes('dependency') || lower.includes('atlas')) {
      return { type: 'graph/network', reason: 'The concept is relationship-heavy and benefits from visible nodes and edges.' };
    }
    if (lower.includes('training') || lower.includes('deployment') || lower.includes('workflow')) {
      return { type: 'timeline', reason: 'The concept is best understood as ordered phases with checkpoints.' };
    }
    return { type: 'concept map', reason: 'The concept needs semantic grouping before detailed interaction is useful.' };
  }

  function chooseMathGeometry(topic, query) {
    const lower = `${topic} ${query}`.toLowerCase();
    if (lower.includes('attention')) {
      return {
        type: 'attention matrix',
        reason: 'Attention is naturally represented as weighted pairwise relationships.',
        content: 'Use a matrix heatmap where rows are query positions, columns are context positions, and intensity encodes normalized attention weight.'
      };
    }
    if (lower.includes('gradient') || lower.includes('optimization')) {
      return {
        type: 'terrain optimization',
        reason: 'Optimization requires showing movement across a loss surface.',
        content: 'Use contour lines, a current parameter point, gradient direction, and step size markers to show movement toward lower loss.'
      };
    }
    if (lower.includes('convolution') || lower.includes('kernel')) {
      return {
        type: 'sliding kernel grid',
        reason: 'Convolution is spatial and local; learners need to see receptive fields move.',
        content: 'Show an input grid, a highlighted kernel window, multiplication weights, and the resulting output cell.'
      };
    }
    return {
      type: 'coordinate system',
      reason: 'Geometric axes and distances are the most compact way to explain the mathematical relationship.',
      content: `Map **${topic}** onto labeled axes, show vectors or points, and annotate distance, angle, or probability mass as needed.`
    };
  }

  function findReusableVisualization(topic, query, context) {
    const haystack = `${topic} ${query} ${context.selectedArtifact?.title || ''}`.toLowerCase();
    return discoverExistingVisualizations().find((name) => haystack.includes(name.split('-').join(' '))) || null;
  }

  function extractComparisonPair(query) {
    const clean = (query || '').replace(/compare visually|compare|visual comparison/ig, '').trim();
    const match = clean.match(/(.+?)\s+(?:vs|versus)\s+(.+)/i);
    if (!match) return null;
    return [titleCase(match[1].trim()), titleCase(match[2].trim())];
  }

  function resolveTopic(context, query) {
    return context.selectedArtifact?.title
      || context.selectedLesson?.title
      || context.selectedModule?.title
      || context.selectedPath?.title
      || extractTopicFromQuery(query)
      || 'current concept';
  }

  function extractTopicFromQuery(query) {
    const cleaned = (query || '')
      .replace(/can you|please|visualize|show me|diagram|explain|with an animation|geometrically|best medium|for this/ig, '')
      .replace(/[?!.]/g, '')
      .trim();
    return cleaned ? titleCase(cleaned) : null;
  }

  function normalizeQuery(query) {
    return (query || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function titleCase(value) {
    return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }

  function cloneWithTimestamp(result) {
    return {
      ...JSON.parse(JSON.stringify(result)),
      timestamp: new Date().toISOString()
    };
  }

  function getAvailableModes() {
    return Object.keys(MODE_LABELS);
  }

  function getDiagramTypes() {
    return [...DIAGRAM_TYPES];
  }

  function getCacheStats() {
    return { entries: recommendationCache.size };
  }

  return {
    initialize,
    canHandle,
    run,
    detectIntent,
    getAvailableModes,
    getDiagramTypes,
    getCacheStats,
    discoverExistingVisualizations
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.visualInteractiveMediaAgent = createVisualInteractiveMediaAgent();
}

export { createVisualInteractiveMediaAgent };
