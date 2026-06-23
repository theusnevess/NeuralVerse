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
    realAgents.set(agentId, agentImpl);
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

    const context = options.context || contextBuilder.getContextForAgent(agentId);
    context.userQuery = userQuery;

    const guardrailCheck = guardrails.checkAgentRequest(agentId, userQuery, context);
    if (!guardrailCheck.allowed) {
      const refusal = guardrailCheck.governedRefusal;
      guardrails.logInvocation(agentId, 'user-query', { type: 'governed-refusal' }, context);
      invocationHistory.push({
        agentId,
        userQuery,
        response: refusal,
        timestamp: new Date().toISOString(),
        status: 'refused'
      });
      return refusal;
    }

    const realAgent = realAgents.get(agentId);
    if (realAgent && realAgent.canHandle && realAgent.run) {
      try {
        const result = await realAgent.run(context, options);
        guardrails.logInvocation(agentId, 'user-query', { type: 'success' }, context);
        invocationHistory.push({
          agentId,
          userQuery,
          response: result,
          timestamp: new Date().toISOString(),
          status: 'success'
        });
        return result;
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
        userQuery,
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
    const context = options.context || contextBuilder.buildContext();
    context.userQuery = userQuery;

    const eligibleAgents = selectEligibleAgents(context);

    if (eligibleAgents.length === 0) {
      const defaultAgentId = options.preferredAgent || findBestAgentForQuery(userQuery);
      if (defaultAgentId) {
        return {
          primary: await invokeAgent(defaultAgentId, userQuery, { context }),
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
    const primaryResponse = await invokeAgent(primaryAgentId, userQuery, { context });

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
    const lowerQuery = query.toLowerCase();
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
