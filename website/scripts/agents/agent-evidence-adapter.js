/**
 * NV-1000-A0 — Agent Evidence Adapter
 *
 * Bridges the Copilot Runtime Bridge to the real deterministic agent
 * implementations. Replaces placeholder evidence with structured
 * evidence collected from the D1–D10 agent modules.
 *
 * Read-only. Deterministic. No LLM calls. No network calls.
 * No curriculum mutation. No guardrail bypass.
 */

/* =========================================================
   AGENT RESOLUTION MAP
   Registry ID → window.NeuralVerse global property name
   ========================================================= */

const AGENT_GLOBAL_MAP = {
  'curriculum-dependency': 'curriculumDependencyAgent',
  'didactic-architecture': 'didacticArchitectureAgent',
  'visual-interactive-media': 'visualInteractiveMediaAgent',
  'code-simulation-lab': 'codeSimulationLaboratoryAgent',
  'assessment-reinforcement': 'assessmentReinforcementAgent',
  'research-state-of-art': 'researchStateOfArtAgent',
  'application-professional-transfer': 'applicationProfessionalTransferAgent',
  'storytelling-learning-journey': 'storytellingLearningJourneyAgent',
  'obsidian-knowledge-governance': 'obsidianKnowledgeGovernanceAgent',
  'curiosity-engagement': 'curiosityEngagementAgent'
};

/* =========================================================
   EVIDENCE CATEGORY MAP
   Registry ID → canonical evidence category
   ========================================================= */

const EVIDENCE_CATEGORY_MAP = {
  'curriculum-dependency': 'dependency',
  'didactic-architecture': 'pedagogy',
  'visual-interactive-media': 'visualization',
  'code-simulation-lab': 'practice',
  'assessment-reinforcement': 'assessment',
  'research-state-of-art': 'research',
  'application-professional-transfer': 'application',
  'storytelling-learning-journey': 'narrative',
  'obsidian-knowledge-governance': 'knowledge-structure',
  'curiosity-engagement': 'engagement'
};

/* =========================================================
   INTENT → MODE MAP
   Maps Copilot intent keywords to agent-specific modes
   ========================================================= */

const INTENT_MODE_MAP = {
  'curriculum-dependency': {
    'explain': 'curriculum_context',
    'plan-learning': 'route',
    'review': 'summary',
    'default': 'curriculum_context'
  },
  'didactic-architecture': {
    'explain': 'default',
    'compare': 'comparison',
    'solve': 'default',
    'visualize': 'default',
    'review': 'default',
    'correct-misconceptions': 'misconception',
    'default': 'default'
  },
  'visual-interactive-media': {
    'visualize': 'diagram_recommendation',
    'explain': 'visual_intuition',
    'default': 'visual_intuition'
  },
  'code-simulation-lab': {
    'practice': 'code_example',
    'solve': 'code_example',
    'build-laboratory': 'mini_lab',
    'default': 'code_example'
  },
  'assessment-reinforcement': {
    'assess-knowledge': 'practice_questions',
    'review': 'reinforcement_plan',
    'correct-misconceptions': 'misconception_check',
    'default': 'practice_questions'
  },
  'research-state-of-art': {
    'research': 'curriculum_bridge',
    'explain': 'curriculum_bridge',
    'default': 'curriculum_bridge'
  },
  'application-professional-transfer': {
    'apply': 'real_world_applications',
    'research': 'industry_case_study',
    'default': 'real_world_applications'
  },
  'storytelling-learning-journey': {
    'explain': 'origin_story',
    'review': 'learning_journey',
    'default': 'origin_story'
  },
  'obsidian-knowledge-governance': {
    'explain': 'concept_map',
    'review': 'knowledge_review',
    'plan-learning': 'collection_organization',
    'default': 'concept_map'
  },
  'curiosity-engagement': {
    'explain': 'did_you_know',
    'research': 'frontier_curiosity',
    'default': 'did_you_know'
  }
};

/* =========================================================
   HELPERS
   ========================================================= */

function resolveAgent(agentId) {
  if (typeof window === 'undefined' || !window.NeuralVerse) return null;
  const globalKey = AGENT_GLOBAL_MAP[agentId];
  if (!globalKey) return null;
  return window.NeuralVerse[globalKey] || null;
}

function resolveMode(agentId, intents) {
  const modeMap = INTENT_MODE_MAP[agentId];
  if (!modeMap) return undefined;
  for (const intent of intents) {
    if (modeMap[intent]) return modeMap[intent];
  }
  return modeMap.default || undefined;
}

function normalizeSections(result) {
  if (!result || !Array.isArray(result.sections)) return [];
  return result.sections.filter(s => s && typeof s === 'object');
}

function buildEvidenceFromResult(agentId, result, query) {
  const sections = normalizeSections(result);
  const category = EVIDENCE_CATEGORY_MAP[agentId] || 'general';
  const confidence = result.status === 'operational' ? 'high' : 'medium';

  const contentParts = [];
  for (const section of sections) {
    if (section.title && section.content) {
      contentParts.push(`**${section.title}**: ${section.content}`);
    } else if (section.content) {
      contentParts.push(section.content);
    }
  }

  const content = contentParts.join('\n\n') || result.disclaimer || 'Agent produced output but no readable content was extracted.';

  const evidence = {
    agentId: agentId,
    agentName: result.agentName || agentId,
    category: category,
    confidence: confidence,
    evidenceType: sections.length > 0 ? 'agent-output' : 'limitation',
    summary: `${result.agentName || agentId} produced ${sections.length} section(s) for query: "${query.substring(0, 80)}"`,
    content: content,
    references: [],
    limitations: result.disclaimer ? [result.disclaimer] : [],
    metadata: {
      mode: result.mode || null,
      modeLabel: result.modeLabel || null,
      topic: result.topic || null,
      status: result.status || 'unknown',
      sectionCount: sections.length,
      sectionTypes: sections.map(s => s.type).filter(Boolean),
      timestamp: result.timestamp || new Date().toISOString(),
      source: 'deterministic-agent'
    }
  };

  // Apply evidence quality guard
  if (typeof window !== 'undefined' && window.NeuralVerse?.CopilotRuntimeBridge?.validateEvidenceQuality) {
    const validation = window.NeuralVerse.CopilotRuntimeBridge.validateEvidenceQuality(evidence);
    if (!validation.valid) {
      evidence.evidenceType = 'limitation';
      evidence.confidence = 'none';
      evidence.limitations = [...(evidence.limitations || []), `Evidence quality guard: ${validation.reason}`];
      evidence.metadata.qualityGuard = true;
      evidence.metadata.qualityGuardReason = validation.reason;
      evidence.metadata.originalEvidenceType = 'agent-output';
    }
  }

  return evidence;
}

function buildLimitationEvidence(agentId, query, reason) {
  const category = EVIDENCE_CATEGORY_MAP[agentId] || 'general';
  const agentName = formatAgentName(agentId);

  return {
    agentId: agentId,
    agentName: agentName,
    category: category,
    confidence: 'none',
    evidenceType: 'limitation',
    summary: `${agentName} could not provide evidence: ${reason}`,
    content: `This agent could not provide evidence for the current request. Reason: ${reason}.`,
    references: [],
    limitations: [reason],
    metadata: {
      source: 'adapter-fallback',
      timestamp: new Date().toISOString()
    }
  };
}

function formatAgentName(agentId) {
  return agentId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function isAgentAvailable(agentId) {
  const agent = resolveAgent(agentId);
  return agent !== null && typeof agent === 'object';
}

/* =========================================================
   ADAPTER API
   ========================================================= */

function createAgentEvidenceAdapter() {
  const agentCache = new Map();

  function getAgentInstance(agentId) {
    if (agentCache.has(agentId)) return agentCache.get(agentId);
    const agent = resolveAgent(agentId);
    if (agent) agentCache.set(agentId, agent);
    return agent;
  }

  async function collectAgentEvidence(agentId, request) {
    const agent = getAgentInstance(agentId);

    if (!agent) {
      return buildLimitationEvidence(agentId, request.query, 'Agent module not available on window.NeuralVerse');
    }

    if (typeof agent.canHandle === 'function') {
      try {
        const canHandleResult = agent.canHandle({
          userQuery: request.query,
          selectedArtifact: request.context?.selectedArtifact || null,
          selectedLesson: request.context?.selectedLesson || null,
          selectedModule: request.context?.selectedModule || null
        });
        if (!canHandleResult) {
          return buildLimitationEvidence(agentId, request.query, 'Agent reported it cannot handle this request');
        }
      } catch (e) {
        return buildLimitationEvidence(agentId, request.query, `canHandle() threw: ${e.message}`);
      }
    }

    if (typeof agent.run !== 'function') {
      return buildLimitationEvidence(agentId, request.query, 'Agent does not implement run()');
    }

    const mode = resolveMode(agentId, request.intents || []);

    try {
      const context = {
        userQuery: request.query,
        selectedArtifact: request.context?.selectedArtifact || null,
        selectedLesson: request.context?.selectedLesson || null,
        selectedModule: request.context?.selectedModule || null,
        selectedPath: request.context?.selectedPath || null,
        currentRoute: request.context?.currentRoute || null
      };

      const options = {};
      if (mode) options.mode = mode;

      let result;
      const runResult = agent.run(context, options);

      if (runResult && typeof runResult.then === 'function') {
        result = await runResult;
      } else {
        result = runResult;
      }

      if (!result || typeof result !== 'object') {
        return buildLimitationEvidence(agentId, request.query, 'Agent run() returned invalid result');
      }

      return buildEvidenceFromResult(agentId, result, request.query);

    } catch (e) {
      return buildLimitationEvidence(agentId, request.query, `run() threw: ${e.message}`);
    }
  }

  async function collectEvidence({ query, selectedAgents, context, mode, style }) {
    const agents = Array.isArray(selectedAgents) ? selectedAgents : [];
    const evidenceItems = [];
    const agentStatus = {};

    for (const agent of agents) {
      const agentId = typeof agent === 'string' ? agent : agent.agentId;
      if (!agentId) continue;

      const intents = [];
      if (mode) intents.push(mode);
      if (style) intents.push(style);

      const evidence = await collectAgentEvidence(agentId, {
        query: query || '',
        intents: intents,
        context: context || {}
      });

      evidenceItems.push(evidence);
      agentStatus[agentId] = {
        available: isAgentAvailable(agentId),
        evidenceType: evidence.evidenceType,
        confidence: evidence.confidence,
        sectionCount: evidence.metadata?.sectionCount || 0,
        source: evidence.metadata?.source || 'unknown'
      };
    }

    const realEvidenceCount = evidenceItems.filter(e => e.evidenceType === 'agent-output').length;
    const limitationCount = evidenceItems.filter(e => e.evidenceType === 'limitation').length;
    const unavailableAgents = Object.entries(agentStatus)
      .filter(([, status]) => !status.available)
      .map(([id]) => id);

    return {
      conceptDefinitions: evidenceItems
        .filter(e => e.category === 'pedagogy' || e.category === 'knowledge-structure')
        .map(e => e.content),
      dependencies: evidenceItems
        .filter(e => e.category === 'dependency')
        .map(e => e.content),
      applications: evidenceItems
        .filter(e => e.category === 'application')
        .map(e => e.content),
      researchEvidence: evidenceItems
        .filter(e => e.category === 'research')
        .map(e => e.content),
      misconceptions: evidenceItems
        .filter(e => e.category === 'pedagogy')
        .map(e => e.content),
      examples: evidenceItems
        .filter(e => e.category === 'practice')
        .map(e => e.content),
      laboratories: evidenceItems
        .filter(e => e.category === 'practice')
        .map(e => e.content),
      visualSuggestions: evidenceItems
        .filter(e => e.category === 'visualization')
        .map(e => e.content),
      assessments: evidenceItems
        .filter(e => e.category === 'assessment')
        .map(e => e.content),
      relatedConcepts: evidenceItems
        .filter(e => e.category === 'engagement' || e.category === 'narrative')
        .map(e => e.content),
      agentContributions: evidenceItems,
      completeness: Math.min(100, Math.round((realEvidenceCount / Math.max(1, evidenceItems.length)) * 100)),
      evidenceMetadata: {
        totalAgents: evidenceItems.length,
        realEvidenceCount: realEvidenceCount,
        limitationCount: limitationCount,
        unavailableAgents: unavailableAgents,
        agentStatus: agentStatus,
        isRealEvidence: realEvidenceCount > 0,
        collectedAt: new Date().toISOString()
      }
    };
  }

  function getAgentStatus(agentId) {
    const agent = getAgentInstance(agentId);
    return {
      agentId,
      available: agent !== null,
      hasCanHandle: agent !== null && typeof agent.canHandle === 'function',
      hasRun: agent !== null && typeof agent.run === 'function',
      globalKey: AGENT_GLOBAL_MAP[agentId] || null
    };
  }

  function getAllAgentStatuses() {
    return Object.keys(AGENT_GLOBAL_MAP).map(getAgentStatus);
  }

  return {
    collectEvidence,
    collectAgentEvidence,
    getAgentStatus,
    getAllAgentStatuses,
    isAgentAvailable,
    AGENT_GLOBAL_MAP,
    EVIDENCE_CATEGORY_MAP
  };
}

/* =========================================================
   EXPORTS
   ========================================================= */

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createAgentEvidenceAdapter = createAgentEvidenceAdapter;
}

export { createAgentEvidenceAdapter, AGENT_GLOBAL_MAP, EVIDENCE_CATEGORY_MAP };
