/**
 * NV-1000-A0 — Didactic Orchestrator
 *
 * Receives user intent, reads current curriculum context,
 * selects eligible agents, applies guardrails, invokes scaffolded agents,
 * and returns structured responses.
 *
 * The orchestrator must not modify curriculum content.
 */

import { createAgentRegistry } from './agent-registry.js';
import { createAgentContract } from './agent-contracts.js';
import { createAgentContextBuilder } from './agent-context-builder.js';
import { createAgentGuardrails } from './agent-guardrails.js';

function createDidacticOrchestrator() {
  const registry = window.NeuralVerse?.agentRegistry || createAgentRegistry();
  const guardrails = window.NeuralVerse?.agentGuardrails || createAgentGuardrails();
  const contextBuilder = window.NeuralVerse?.contextBuilder || createAgentContextBuilder();
  const contracts = new Map();
  let invocationHistory = [];

  const realAgents = new Map();

  function registerRealAgent(agentId, agentImpl) {
    const normalizedAgent = normalizeAgentImplementation(agentId, agentImpl);
    const validation = validateAgentContract(agentId, normalizedAgent);
    if (!validation.valid) {
      return { registered: false, reason: validation.reason };
    }
    realAgents.set(agentId, normalizedAgent);
    return { registered: true };
  }

  function normalizeAgentImplementation(agentId, agentImpl) {
    if (!agentImpl || typeof agentImpl !== 'object') return agentImpl;
    if (typeof agentImpl.canHandle !== 'function' || typeof agentImpl.run !== 'function') return agentImpl;
    const fallbackContract = contracts.get(agentId) || createAgentContract(registry.getAgent(agentId));
    return {
      id: agentImpl.id || agentId,
      name: agentImpl.name || fallbackContract.name,
      canHandle: typeof agentImpl.canHandle === 'function' ? agentImpl.canHandle : fallbackContract.canHandle,
      buildPrompt: typeof agentImpl.buildPrompt === 'function' ? agentImpl.buildPrompt : fallbackContract.buildPrompt,
      run: typeof agentImpl.run === 'function' ? agentImpl.run : fallbackContract.run,
      formatResponse: typeof agentImpl.formatResponse === 'function' ? agentImpl.formatResponse : (result) => {
        if (result && typeof result === 'object' && (result.sections || result.content || result.type)) return result;
        return fallbackContract.formatResponse(result);
      },
      guardrails: agentImpl.guardrails || fallbackContract.guardrails
    };
  }

  function validateAgentContract(agentId, agentImpl) {
    if (!registry.isRegistered(agentId)) {
      return { valid: false, reason: 'Agent ID is not registered.' };
    }
    if (!agentImpl || typeof agentImpl !== 'object') {
      return { valid: false, reason: 'Agent implementation must be an object.' };
    }
    const requiredFunctions = ['canHandle', 'buildPrompt', 'run', 'formatResponse'];
    for (const fn of requiredFunctions) {
      if (typeof agentImpl[fn] !== 'function') {
        return { valid: false, reason: `Agent implementation missing ${fn}().` };
      }
    }
    return { valid: true };
  }

  function normalizeContext(context) {
    if (!context || typeof context !== 'object') return contextBuilder.buildContext();
    return { ...context };
  }

  function normalizeQuery(userQuery) {
    return typeof userQuery === 'string' ? userQuery : String(userQuery || '');
  }

  function initialize() {
    const agents = registry.getAllAgents();
    agents.forEach((agentDef) => {
      const contract = createAgentContract(agentDef);
      contracts.set(agentDef.id, contract);
    });
  }

  function selectEligibleAgents(context) {
    const allAgents = registry.getAllAgents();
    return allAgents.filter((agent) => {
      const contract = contracts.get(agent.id);
      if (!contract) return false;
      return contract.canHandle(context);
    });
  }

  async function invokeAgent(agentId, userQuery, options = {}) {
    const agent = registry.getAgent(agentId);
    if (!agent) {
      return buildErrorResponse(agentId, 'Agent not found in registry.');
    }

    const context = normalizeContext(options.context || contextBuilder.getContextForAgent(agentId));
    const query = normalizeQuery(userQuery);
    context.agentId = agentId;
    context.userQuery = query;

    const guardrailCheck = guardrails.checkAgentRequest(agentId, query, context);
    if (!guardrailCheck.allowed) {
      const refusal = guardrailCheck.governedRefusal;
      guardrails.logInvocation(agentId, 'user-query', { type: 'governed-refusal' }, context);
      invocationHistory.push({
        agentId,
        userQuery: query,
        response: refusal,
        timestamp: new Date().toISOString(),
        status: 'refused'
      });
      return refusal;
    }

    const realAgent = realAgents.get(agentId);
    if (realAgent && realAgent.canHandle && realAgent.run) {
      try {
        const canHandleResult = realAgent.canHandle(context);
        if (typeof canHandleResult !== 'boolean') {
          return buildErrorResponse(agentId, 'Agent canHandle() returned a non-boolean value.');
        }
        const result = await realAgent.run(context, options);
        const formattedResult = realAgent.formatResponse(result);
        guardrails.logInvocation(agentId, 'user-query', { type: 'success' }, context);
        invocationHistory.push({
          agentId,
          userQuery: query,
          response: formattedResult,
          timestamp: new Date().toISOString(),
          status: 'success'
        });
        return formattedResult;
      } catch (error) {
        return buildErrorResponse(agentId, `Agent execution failed: ${error.message}`);
      }
    }

    const contract = contracts.get(agentId);
    if (!contract) {
      return buildErrorResponse(agentId, 'Agent contract not initialized.');
    }

    try {
      const rawResult = contract.run(context);
      const formattedResult = contract.formatResponse(rawResult);

      guardrails.logInvocation(agentId, 'user-query', { type: 'success' }, context);

      invocationHistory.push({
        agentId,
        userQuery: query,
        response: formattedResult,
        timestamp: new Date().toISOString(),
        status: 'success'
      });

      return formattedResult;
    } catch (error) {
      return buildErrorResponse(agentId, `Agent execution failed: ${error.message}`);
    }
  }

  async function orchestrate(userQuery, options = {}) {
    const context = normalizeContext(options.context || contextBuilder.buildContext());
    const query = normalizeQuery(userQuery);
    context.userQuery = query;

    const eligibleAgents = selectEligibleAgents(context);

    if (eligibleAgents.length === 0) {
      const defaultAgentId = options.preferredAgent || findBestAgentForQuery(query);
      if (defaultAgentId) {
        return {
          primary: await invokeAgent(defaultAgentId, query, { context }),
          eligibleAgents: [defaultAgentId],
          context
        };
      }

      return {
        primary: buildErrorResponse('none', 'No eligible agent found for this query. Try selecting a specific agent.'),
        eligibleAgents: [],
        context
      };
    }

    const primaryAgentId = options.preferredAgent || eligibleAgents[0].id;
    const primaryResponse = await invokeAgent(primaryAgentId, query, { context });

    return {
      primary: primaryResponse,
      eligibleAgents: eligibleAgents.map((a) => a.id),
      context
    };
  }

  function findBestAgentForQuery(query) {
    const allAgents = registry.getAllAgents();
    let bestMatch = null;
    let bestScore = 0;

    for (const agent of allAgents) {
      const contract = contracts.get(agent.id);
      if (!contract) continue;

      const tempContext = { userQuery: query };
      if (contract.canHandle(tempContext)) {
        const score = calculateQueryRelevance(query, agent);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = agent.id;
        }
      }
    }

    return bestMatch;
  }

  function calculateQueryRelevance(query, agent) {
    const lowerQuery = normalizeQuery(query).toLowerCase();
    const keywords = [agent.name.toLowerCase(), agent.role.toLowerCase(), ...agent.capabilities];
    let score = 0;

    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        score += keyword.length;
      }
    }

    return score;
  }

  function buildErrorResponse(agentId, message) {
    return {
      type: 'error',
      agentId,
      content: message,
      timestamp: new Date().toISOString(),
      status: 'error'
    };
  }

  function getInvocationHistory() {
    return [...invocationHistory];
  }

  function clearInvocationHistory() {
    invocationHistory = [];
  }

  function getRegisteredAgents() {
    return registry.getAllAgents();
  }

  function getAgentContract(agentId) {
    return contracts.get(agentId) || null;
  }

  initialize();

  if (window.NeuralVerse?.didacticArchitectureAgent) {
    registerRealAgent('didactic-architecture', window.NeuralVerse.didacticArchitectureAgent);
  }

  if (window.NeuralVerse?.curriculumDependencyAgent) {
    registerRealAgent('curriculum-dependency', window.NeuralVerse.curriculumDependencyAgent);
  }

  if (window.NeuralVerse?.visualInteractiveMediaAgent) {
    registerRealAgent('visual-interactive-media', window.NeuralVerse.visualInteractiveMediaAgent);
  }

  if (window.NeuralVerse?.codeSimulationLaboratoryAgent) {
    registerRealAgent('code-simulation-lab', window.NeuralVerse.codeSimulationLaboratoryAgent);
  }

  if (window.NeuralVerse?.researchStateOfArtAgent) {
    registerRealAgent('research-state-of-art', window.NeuralVerse.researchStateOfArtAgent);
  }

  return {
    orchestrate,
    invokeAgent,
    selectEligibleAgents,
    getInvocationHistory,
    clearInvocationHistory,
    getRegisteredAgents,
    getAgentContract,
    validateAgentContract,
    registerRealAgent,
    contextBuilder,
    guardrails
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.didacticOrchestrator = createDidacticOrchestrator();
}

export { createDidacticOrchestrator };
