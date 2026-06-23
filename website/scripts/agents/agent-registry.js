/**
 * NV-1000-A0 — Agent Registry
 *
 * Defines the 10 canonical didactic agents for NeuralVerse.
 * All agents start as scaffolded — no autonomous operation yet.
 */

const AGENT_DEFINITIONS = [
  {
    id: 'curriculum-dependency',
    name: 'Curriculum & Dependency Agent',
    role: 'Maps prerequisite chains, dependency graphs, and learning sequence integrity across the NV-800 curriculum structure.',
    description: 'Analyzes curriculum paths for prerequisite completeness, identifies missing dependencies, and validates learning sequence ordering.',
    capabilities: [
      'dependency-analysis',
      'sequence-validation',
      'prerequisite-mapping',
      'gap-identification'
    ],
    allowedInputs: [
      'curriculum-context',
      'learning-path-id',
      'module-id',
      'user-query'
    ],
    forbiddenActions: [
      'modify-curriculum',
      'alter-lifecycle-status',
      'create-mastery-claims',
      'generate-scores'
    ],
    icon: 'chain',
    category: 'structure'
  },
  {
    id: 'didactic-architecture',
    name: 'Didactic Architecture Agent',
    role: 'Evaluates instructional design patterns, pedagogical structure, and learning objective alignment.',
    description: 'Reviews artifact composition, assesses instructional density, and provides scaffolded pedagogical recommendations.',
    capabilities: [
      'instructional-review',
      'objective-alignment',
      'pedagogical-analysis',
      'structure-assessment'
    ],
    allowedInputs: [
      'curriculum-context',
      'artifact-data',
      'lesson-data',
      'module-data',
      'user-query'
    ],
    forbiddenActions: [
      'modify-curriculum',
      'alter-lifecycle-status',
      'create-mastery-claims',
      'generate-scores'
    ],
    icon: 'architecture',
    category: 'design'
  },
  {
    id: 'visual-interactive-media',
    name: 'Visual & Interactive Media Agent',
    role: 'Advises on visualization strategy, interactive media design, and visual learning enhancement.',
    description: 'Recommends visualization types, reviews interactive specifications, and suggests visual learning aids.',
    capabilities: [
      'visualization-recommendation',
      'media-design-review',
      'interactive-spec-analysis',
      'visual-learning-strategy'
    ],
    allowedInputs: [
      'curriculum-context',
      'artifact-data',
      'visualization-type',
      'user-query'
    ],
    forbiddenActions: [
      'modify-curriculum',
      'alter-lifecycle-status',
      'create-mastery-claims',
      'generate-scores'
    ],
    icon: 'visual',
    category: 'media'
  },
  {
    id: 'code-simulation-lab',
    name: 'Code, Simulation & Laboratory Agent',
    role: 'Supports code example design, simulation architecture, and hands-on laboratory exercise planning.',
    description: 'Reviews code exercises, suggests simulation patterns, and provides scaffolded laboratory design guidance.',
    capabilities: [
      'code-review',
      'simulation-design',
      'lab-exercise-planning',
      'example-generation'
    ],
    allowedInputs: [
      'curriculum-context',
      'artifact-data',
      'code-context',
      'user-query'
    ],
    forbiddenActions: [
      'modify-curriculum',
      'alter-lifecycle-status',
      'create-mastery-claims',
      'generate-scores'
    ],
    icon: 'code',
    category: 'practice'
  },
  {
    id: 'assessment-reinforcement',
    name: 'Assessment & Reinforcement Agent',
    role: 'Advises on assessment design, spaced repetition strategy, and reinforcement learning patterns.',
    description: 'Reviews assessment structure, recommends reinforcement schedules, and provides scaffolded quiz design guidance.',
    capabilities: [
      'assessment-design',
      'reinforcement-scheduling',
      'quiz-architecture',
      'review-strategy'
    ],
    allowedInputs: [
      'curriculum-context',
      'artifact-data',
      'lesson-data',
      'user-query'
    ],
    forbiddenActions: [
      'modify-curriculum',
      'alter-lifecycle-status',
      'create-mastery-claims',
      'generate-scores',
      'create-grades'
    ],
    icon: 'assessment',
    category: 'evaluation'
  },
  {
    id: 'research-state-of-art',
    name: 'Research & State-of-the-Art Agent',
    role: 'Connects curriculum content to current research papers, methodologies, and state-of-the-art developments.',
    description: 'Maps curriculum topics to research landscape, identifies cutting-edge references, and provides scaffolded research context.',
    capabilities: [
      'research-mapping',
      'paper-recommendation',
      'methodology-analysis',
      'state-of-art-tracking'
    ],
    allowedInputs: [
      'curriculum-context',
      'topic-keywords',
      'user-query',
      'reference-context'
    ],
    forbiddenActions: [
      'modify-curriculum',
      'alter-lifecycle-status',
      'create-mastery-claims',
      'generate-scores'
    ],
    icon: 'research',
    category: 'research'
  },
  {
    id: 'application-professional-transfer',
    name: 'Application & Professional Transfer Agent',
    role: 'Bridges academic curriculum to professional practice, industry applications, and real-world deployment scenarios.',
    description: 'Maps learning outcomes to professional skills, suggests application scenarios, and provides scaffolded career transfer guidance.',
    capabilities: [
      'skill-mapping',
      'industry-application',
      'career-transfer',
      'portfolio-guidance'
    ],
    allowedInputs: [
      'curriculum-context',
      'learning-outcomes',
      'user-query',
      'career-context'
    ],
    forbiddenActions: [
      'modify-curriculum',
      'alter-lifecycle-status',
      'create-mastery-claims',
      'generate-scores'
    ],
    icon: 'transfer',
    category: 'application'
  },
  {
    id: 'storytelling-learning-journey',
    name: 'Storytelling & Learning Journey Agent',
    role: 'Designs narrative learning experiences, motivation hooks, and coherent learning journey arcs.',
    description: 'Creates narrative framing, suggests motivation hooks, and provides scaffolded learning journey design.',
    capabilities: [
      'narrative-design',
      'motivation-framing',
      'journey-arc',
      'engagement-storytelling'
    ],
    allowedInputs: [
      'curriculum-context',
      'learning-path-data',
      'module-data',
      'user-query'
    ],
    forbiddenActions: [
      'modify-curriculum',
      'alter-lifecycle-status',
      'create-mastery-claims',
      'generate-scores'
    ],
    icon: 'story',
    category: 'engagement'
  },
  {
    id: 'obsidian-knowledge-governance',
    name: 'Obsidian & Knowledge Governance Agent',
    role: 'Manages knowledge graph relationships, Obsidian vault structure, and knowledge governance policies.',
    description: 'Reviews knowledge graph integrity, suggests link structures, and provides scaffolded governance recommendations.',
    capabilities: [
      'graph-relationship-review',
      'vault-structure',
      'knowledge-governance',
      'link-recommendation'
    ],
    allowedInputs: [
      'curriculum-context',
      'graph-context',
      'user-query',
      'knowledge-base-context'
    ],
    forbiddenActions: [
      'modify-curriculum',
      'alter-lifecycle-status',
      'create-mastery-claims',
      'generate-scores',
      'modify-governance-policies'
    ],
    icon: 'governance',
    category: 'governance'
  },
  {
    id: 'curiosity-engagement',
    name: 'Curiosity & Engagement Agent',
    role: 'Stimulates intellectual curiosity, designs engagement hooks, and creates discovery-oriented learning prompts.',
    description: 'Generates curiosity questions, suggests exploration paths, and provides scaffolded engagement strategies.',
    capabilities: [
      'curiosity-generation',
      'engagement-design',
      'exploration-suggestion',
      'discovery-prompts'
    ],
    allowedInputs: [
      'curriculum-context',
      'user-query',
      'learning-path-data',
      'topic-context'
    ],
    forbiddenActions: [
      'modify-curriculum',
      'alter-lifecycle-status',
      'create-mastery-claims',
      'generate-scores'
    ],
    icon: 'curiosity',
    category: 'engagement'
  }
];

function createAgentRegistry() {
  const agents = new Map();

  function registerAgents() {
    AGENT_DEFINITIONS.forEach((def) => {
      agents.set(def.id, {
        ...def,
        status: 'scaffolded',
        registeredAt: new Date().toISOString()
      });
    });
  }

  function getAgent(agentId) {
    return agents.get(agentId) || null;
  }

  function getAllAgents() {
    return Array.from(agents.values());
  }

  function getAgentsByCategory(category) {
    return getAllAgents().filter((a) => a.category === category);
  }

  function getAgentIds() {
    return Array.from(agents.keys());
  }

  function isRegistered(agentId) {
    return agents.has(agentId);
  }

  function getAgentStatus(agentId) {
    const agent = getAgent(agentId);
    return agent ? agent.status : null;
  }

  registerAgents();

  return {
    getAgent,
    getAllAgents,
    getAgentsByCategory,
    getAgentIds,
    isRegistered,
    getAgentStatus,
    AGENT_DEFINITIONS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.agentRegistry = createAgentRegistry();
}

export { createAgentRegistry, AGENT_DEFINITIONS };
