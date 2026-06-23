/**
 * NV-1000-A0 — Agent Contract Interface
 *
 * Defines the common contract that all didactic agents must conform to.
 * Each agent must implement: canHandle, buildPrompt, run, formatResponse, guardrails.
 * For now, run() returns deterministic scaffolded output — no external LLM APIs.
 */

function createAgentContract(agentDefinition) {
  if (!agentDefinition || !agentDefinition.id) {
    throw new Error('Agent contract requires a valid agent definition with id.');
  }

  const contract = {
    id: agentDefinition.id,
    name: agentDefinition.name,
    role: agentDefinition.role,
    description: agentDefinition.description,
    capabilities: agentDefinition.capabilities || [],
    allowedInputs: agentDefinition.allowedInputs || [],
    forbiddenActions: agentDefinition.forbiddenActions || [],
    status: agentDefinition.status || 'scaffolded',

    canHandle(context) {
      if (!context) return false;
      if (!context.userQuery && !context.requestType) return false;

      const query = (context.userQuery || '').toLowerCase();
      const relevantKeywords = getKeywordsForAgent(agentDefinition.id);

      return relevantKeywords.some((kw) => query.includes(kw)) || context.requestType === agentDefinition.id;
    },

    buildPrompt(context) {
      const parts = [];

      parts.push(`Agent: ${agentDefinition.name}`);
      parts.push(`Role: ${agentDefinition.role}`);

      if (context.currentRoute) {
        parts.push(`Current Route: ${context.currentRoute}`);
      }
      if (context.selectedPath) {
        parts.push(`Learning Path: ${context.selectedPath.title || context.selectedPath.id}`);
      }
      if (context.selectedModule) {
        parts.push(`Module: ${context.selectedModule.title || context.selectedModule.id}`);
      }
      if (context.selectedLesson) {
        parts.push(`Lesson: ${context.selectedLesson.title || context.selectedLesson.id}`);
      }
      if (context.selectedArtifact) {
        parts.push(`Artifact: ${context.selectedArtifact.title || context.selectedArtifact.id}`);
        parts.push(`Artifact Type: ${context.selectedArtifact.type || 'unknown'}`);
      }
      if (context.userQuery) {
        parts.push(`User Query: ${context.userQuery}`);
      }

      return parts.join('\n');
    },

    run(context) {
      const prompt = contract.buildPrompt(context);
      const scaffoldedOutput = generateScaffoldedOutput(agentDefinition.id, context);

      return {
        agentId: agentDefinition.id,
        agentName: agentDefinition.name,
        prompt,
        output: scaffoldedOutput,
        timestamp: new Date().toISOString(),
        status: 'scaffolded',
        disclaimer: 'This is a scaffolded response. Full agent behavior requires future implementation phases.'
      };
    },

    formatResponse(result) {
      return {
        agentId: result.agentId,
        agentName: result.agentName,
        content: result.output,
        timestamp: result.timestamp,
        status: result.status,
        disclaimer: result.disclaimer,
        formattedAt: new Date().toISOString()
      };
    },

    guardrails: agentDefinition.forbiddenActions || []
  };

  return contract;
}

function getKeywordsForAgent(agentId) {
  const keywordMap = {
    'curriculum-dependency': ['prerequisite', 'dependency', 'sequence', 'chain', 'order', 'path', 'missing'],
    'didactic-architecture': ['instruction', 'pedagog', 'teaching', 'learning objective', 'design', 'structure'],
    'visual-interactive-media': ['visual', 'chart', 'graph', 'diagram', 'animation', 'interactive', 'media'],
    'code-simulation-lab': ['code', 'simulation', 'lab', 'exercise', 'programming', 'implement', 'python'],
    'assessment-reinforcement': ['assessment', 'quiz', 'test', 'review', 'reinforcement', 'spaced', 'recall'],
    'research-state-of-art': ['research', 'paper', 'state-of-the-art', 'sota', 'recent', 'publication', 'arxiv'],
    'application-professional-transfer': ['application', 'professional', 'industry', 'career', 'portfolio', 'deploy'],
    'storytelling-learning-journey': ['story', 'narrative', 'journey', 'motivation', 'hook', 'engage'],
    'obsidian-knowledge-governance': ['obsidian', 'knowledge graph', 'governance', 'vault', 'link', 'relationship'],
    'curiosity-engagement': ['curious', 'wonder', 'explore', 'discover', 'question', 'think', 'interesting']
  };

  return keywordMap[agentId] || [];
}

function generateScaffoldedOutput(agentId, context) {
  const query = context.userQuery || 'No specific query provided.';
  const artifactTitle = context.selectedArtifact?.title || context.selectedModule?.title || 'current context';

  const scaffoldedResponses = {
    'curriculum-dependency': `**Curriculum & Dependency Analysis**\n\nRegarding "${query}" in the context of "${artifactTitle}":\n\nAs a scaffolded agent, I can indicate that dependency analysis would examine:\n- Prerequisite chain completeness\n- Learning sequence ordering\n- Missing dependency identification\n- Cross-module relationship validation\n\n*Full dependency graph traversal requires future implementation phases.*`,

    'didactic-architecture': `**Didactic Architecture Review**\n\nRegarding "${query}" in the context of "${artifactTitle}":\n\nAs a scaffolded agent, I can indicate that instructional design review would evaluate:\n- Learning objective alignment\n- Instructional density assessment\n- Pedagogical pattern recognition\n- Artifact composition quality\n\n*Full pedagogical analysis requires future implementation phases.*`,

    'visual-interactive-media': `**Visual & Interactive Media Assessment**\n\nRegarding "${query}" in the context of "${artifactTitle}":\n\nAs a scaffolded agent, I can indicate that visual media review would assess:\n- Visualization type appropriateness\n- Interactive specification quality\n- Visual learning aid effectiveness\n- Media accessibility compliance\n\n*Full visual media analysis requires future implementation phases.*`,

    'code-simulation-lab': `**Code, Simulation & Laboratory Review**\n\nRegarding "${query}" in the context of "${artifactTitle}":\n\nAs a scaffolded agent, I can indicate that code exercise review would evaluate:\n- Code example completeness\n- Simulation architecture validity\n- Laboratory exercise difficulty calibration\n- Hands-on practice alignment\n\n*Full code and simulation analysis requires future implementation phases.*`,

    'assessment-reinforcement': `**Assessment & Reinforcement Strategy**\n\nRegarding "${query}" in the context of "${artifactTitle}":\n\nAs a scaffolded agent, I can indicate that assessment design review would examine:\n- Assessment item quality\n- Spaced repetition scheduling\n- Reinforcement pattern effectiveness\n- Quiz architecture completeness\n\n*Full assessment analysis requires future implementation phases.*`,

    'research-state-of-art': `**Research & State-of-the-Art Context**\n\nRegarding "${query}" in the context of "${artifactTitle}":\n\nAs a scaffolded agent, I can indicate that research mapping would connect to:\n- Current research papers and methodologies\n- State-of-the-art developments\n- Relevant publication references\n- Research landscape positioning\n\n*Full research mapping requires future implementation phases.*`,

    'application-professional-transfer': `**Application & Professional Transfer**\n\nRegarding "${query}" in the context of "${artifactTitle}":\n\nAs a scaffolded agent, I can indicate that professional transfer guidance would cover:\n- Industry application scenarios\n- Professional skill mapping\n- Career transfer pathways\n- Portfolio development guidance\n\n*Full professional transfer analysis requires future implementation phases.*`,

    'storytelling-learning-journey': `**Storytelling & Learning Journey Design**\n\nRegarding "${query}" in the context of "${artifactTitle}":\n\nAs a scaffolded agent, I can indicate that narrative design would create:\n- Learning journey narrative framing\n- Motivation hooks and engagement devices\n- Coherent story arcs across modules\n- Discovery-oriented learning prompts\n\n*Full narrative design requires future implementation phases.*`,

    'obsidian-knowledge-governance': `**Obsidian & Knowledge Governance Review**\n\nRegarding "${query}" in the context of "${artifactTitle}":\n\nAs a scaffolded agent, I can indicate that knowledge governance review would assess:\n- Knowledge graph relationship integrity\n- Obsidian vault structure optimization\n- Link structure recommendations\n- Governance policy compliance\n\n*Full knowledge governance analysis requires future implementation phases.*`,

    'curiosity-engagement': `**Curiosity & Engagement Stimulation**\n\nRegarding "${query}" in the context of "${artifactTitle}":\n\nAs a scaffolded agent, I can indicate that curiosity design would generate:\n- Thought-provoking questions\n- Exploration path suggestions\n- Discovery-oriented prompts\n- Intellectual engagement hooks\n\n*Full curiosity and engagement analysis requires future implementation phases.*`
  };

  return scaffoldedResponses[agentId] || `**${agentId} Response**\n\nRegarding "${query}":\n\nThis agent is currently scaffolded. Full behavior requires future implementation phases.\n\n*Disclaimer: This is a deterministic scaffolded response.*`;
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createAgentContract = createAgentContract;
}

export { createAgentContract, getKeywordsForAgent, generateScaffoldedOutput };
