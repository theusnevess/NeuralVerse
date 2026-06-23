/**
 * NV-1000-A0 — Governance Guardrails
 *
 * Enforces hard boundaries on what didactic agents may and may not do.
 * Agents must not modify canonical curriculum, alter lifecycle status,
 * create mastery claims, generate scores, or bypass the Evidence Boundary.
 */

const FORBIDDEN_ACTIONS = [
  'modify-nv800-content',
  'alter-registry-entries',
  'change-lifecycle-status',
  'create-mastery-claims',
  'create-scores',
  'create-grades',
  'certify-competence',
  'mutate-ids',
  'write-canonical-curriculum-files',
  'generate-hidden-recommendations',
  'bypass-evidence-boundary',
  'modify-governance-policies',
  'alter-agent-contracts',
  'invoke-external-llms',
  'call-backend-apis',
  'persist-sensitive-data',
  'modify-personalization-storage',
  'create-autonomous-background-agents'
];

const GUARDRAIL_DEFINITIONS = {
  'no-curriculum-mutation': {
    id: 'no-curriculum-mutation',
    description: 'Agents must not modify NV-800 curriculum content files.',
    forbiddenActions: ['modify-nv800-content', 'write-canonical-curriculum-files'],
    severity: 'critical',
    refusalMessage: 'This action would modify canonical curriculum content. Agents are not permitted to alter NV-800 materials.'
  },
  'no-lifecycle-modification': {
    id: 'no-lifecycle-modification',
    description: 'Agents must not change lifecycle status of any curriculum entity.',
    forbiddenActions: ['change-lifecycle-status', 'alter-registry-entries'],
    severity: 'critical',
    refusalMessage: 'This action would modify curriculum lifecycle status. Only authorized governance processes may alter entity status.'
  },
  'no-mastery-claims': {
    id: 'no-mastery-claims',
    description: 'Agents must not create mastery claims, scores, grades, or certify competence.',
    forbiddenActions: ['create-mastery-claims', 'create-scores', 'create-grades', 'certify-competence'],
    severity: 'critical',
    refusalMessage: 'Agents cannot generate mastery claims, scores, grades, or competence certifications. This is governed by the assessment architecture.'
  },
  'no-id-mutation': {
    id: 'no-id-mutation',
    description: 'Agents must not mutate or reassign curriculum entity IDs.',
    forbiddenActions: ['mutate-ids'],
    severity: 'critical',
    refusalMessage: 'Agents cannot modify curriculum entity identifiers. IDs are immutable.'
  },
  'no-evidence-boundary-bypass': {
    id: 'no-evidence-boundary-bypass',
    description: 'Agents must not bypass the Evidence Boundary for Competency Evidence generation.',
    forbiddenActions: ['bypass-evidence-boundary'],
    severity: 'critical',
    refusalMessage: 'This action would bypass the Evidence Boundary. Competency Evidence generation is governed by future assessment architecture.'
  },
  'no-external-api-calls': {
    id: 'no-external-api-calls',
    description: 'Agents must not invoke external LLM APIs or backend services.',
    forbiddenActions: ['invoke-external-llms', 'call-backend-apis'],
    severity: 'critical',
    refusalMessage: 'External API calls are not permitted in the scaffolded agent runtime. Agents operate locally only.'
  },
  'no-hidden-recommendations': {
    id: 'no-hidden-recommendations',
    description: 'Agents must not generate hidden or undisclosed recommendations.',
    forbiddenActions: ['generate-hidden-recommendations'],
    severity: 'high',
    refusalMessage: 'All agent recommendations must be transparent and visible to the user. Hidden recommendations are prohibited.'
  },
  'no-sensitive-data-persistence': {
    id: 'no-sensitive-data-persistence',
    description: 'Agents must not persist sensitive data beyond local session.',
    forbiddenActions: ['persist-sensitive-data', 'modify-personalization-storage'],
    severity: 'high',
    refusalMessage: 'Agents cannot persist sensitive data. Personalization storage is managed by the personalization service.'
  },
  'no-agent-escalation': {
    id: 'no-agent-escalation',
    description: 'Agents must not alter agent contracts or create autonomous background agents.',
    forbiddenActions: ['alter-agent-contracts', 'create-autonomous-background-agents'],
    severity: 'critical',
    refusalMessage: 'Agents cannot modify their own contracts or spawn autonomous background processes.'
  }
};

function createAgentGuardrails() {
  let invocationLog = [];

  function checkAction(agentId, actionType, context = {}) {
    const violations = [];

    for (const [ruleId, rule] of Object.entries(GUARDRAIL_DEFINITIONS)) {
      if (rule.forbiddenActions.includes(actionType)) {
        violations.push({
          ruleId,
          rule,
          agentId,
          actionType,
          timestamp: new Date().toISOString()
        });
      }
    }

    if (violations.length > 0) {
      logViolation(agentId, actionType, violations, context);
    }

    return {
      allowed: violations.length === 0,
      violations,
      refusalMessage: violations.length > 0 ? violations[0].rule.refusalMessage : null
    };
  }

  function checkAgentRequest(agentId, request, context = {}) {
    const requestedActions = extractRequestedActions(request);
    const allViolations = [];

    for (const action of requestedActions) {
      const result = checkAction(agentId, action, context);
      if (!result.allowed) {
        allViolations.push(...result.violations);
      }
    }

    if (allViolations.length > 0) {
      return {
        allowed: false,
        violations: allViolations,
        governedRefusal: buildRefusalResponse(agentId, allViolations)
      };
    }

    return { allowed: true, violations: [] };
  }

  function extractRequestedActions(request) {
    const actions = [];
    if (!request) return actions;

    const text = typeof request === 'string' ? request : JSON.stringify(request);
    const lowerText = text.toLowerCase();

    if (lowerText.includes('modify') || lowerText.includes('change') || lowerText.includes('update')) {
      actions.push('modify-nv800-content');
    }
    if (lowerText.includes('score') || lowerText.includes('grade') || lowerText.includes('mark')) {
      actions.push('create-scores');
    }
    if (lowerText.includes('mastery') || lowerText.includes('certify') || lowerText.includes('competence')) {
      actions.push('create-mastery-claims');
    }
    if (lowerText.includes('status') || lowerText.includes('lifecycle') || lowerText.includes('review')) {
      actions.push('change-lifecycle-status');
    }

    return actions;
  }

  function buildRefusalResponse(agentId, violations) {
    const primaryViolation = violations[0];
    return {
      type: 'governed-refusal',
      agentId,
      reason: primaryViolation.rule.refusalMessage,
      ruleId: primaryViolation.ruleId,
      severity: primaryViolation.rule.severity,
      timestamp: new Date().toISOString(),
      notice: 'This request was blocked by governance guardrails. Agents cannot perform this action.'
    };
  }

  function logViolation(agentId, actionType, violations, context) {
    invocationLog.push({
      type: 'violation',
      agentId,
      actionType,
      violationCount: violations.length,
      ruleIds: violations.map((v) => v.ruleId),
      context: context.summary || 'no-context',
      timestamp: new Date().toISOString()
    });
  }

  function logInvocation(agentId, action, result, context) {
    invocationLog.push({
      type: 'invocation',
      agentId,
      action,
      result: result.type || 'success',
      context: context.summary || 'no-context',
      timestamp: new Date().toISOString()
    });
  }

  function getInvocationLog() {
    return [...invocationLog];
  }

  function clearInvocationLog() {
    invocationLog = [];
  }

  function getGuardrailDefinitions() {
    return { ...GUARDRAIL_DEFINITIONS };
  }

  return {
    checkAction,
    checkAgentRequest,
    logInvocation,
    getInvocationLog,
    clearInvocationLog,
    getGuardrailDefinitions,
    FORBIDDEN_ACTIONS,
    GUARDRAIL_DEFINITIONS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.agentGuardrails = createAgentGuardrails();
}

export { createAgentGuardrails, FORBIDDEN_ACTIONS, GUARDRAIL_DEFINITIONS };
