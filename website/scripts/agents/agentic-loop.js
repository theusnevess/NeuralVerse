/**
 * NV-1000-A0 — Agentic Orchestration Loop
 *
 * Implements an LLM-driven agentic loop where the model decides which
 * deterministic agents to consult via tool calls, then synthesizes
 * evidence into a final response.
 *
 * This is a parallel system to the existing Copilot pipeline.
 * It does not replace the pipeline — it is an alternative orchestration mode.
 *
 * Read-only over agent implementations. Deterministic tool execution.
 */

import {
  getAgentTools,
  getToolToAgentMap,
  getAgenticSystemPrompt,
  isSupportedAgentTool,
  normalizeToolArguments
} from './agent-tools.js?v=1';

/* =========================================================
   CONSTANTS
   ========================================================= */

const MAX_AGENTIC_ITERATIONS = 5;

const STOPPED_BY = {
  DIRECT_RESPONSE: 'direct_response',
  FINAL_ANSWER: 'final_answer',
  MAX_ITERATIONS: 'max_iterations',
  PROVIDER_ERROR: 'provider_error',
  TOOL_ERROR: 'tool_error'
};

/* =========================================================
   HELPERS
   ========================================================= */

function generateToolCallId() {
  return 'tc_' + Math.random().toString(36).substring(2, 10);
}

function safeParseArguments(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

function normalizeProviderResponse(response) {
  if (!response) return { content: '', toolCalls: [] };

  // Direct format: { content, tool_calls }
  if (response.tool_calls && Array.isArray(response.tool_calls)) {
    return {
      content: response.content || '',
      toolCalls: normalizeToolCalls(response.tool_calls)
    };
  }

  // OpenAI-like: { message: { content, tool_calls } }
  if (response.message && response.message.tool_calls) {
    return {
      content: response.message.content || '',
      toolCalls: normalizeToolCalls(response.message.tool_calls)
    };
  }

  // OpenAI-like array: { choices: [{ message: { content, tool_calls } }] }
  if (response.choices && response.choices[0]) {
    const msg = response.choices[0].message || response.choices[0];
    return {
      content: msg.content || '',
      toolCalls: normalizeToolCalls(msg.tool_calls || [])
    };
  }

  // Content-only response
  return {
    content: response.content || response.text || '',
    toolCalls: []
  };
}

function normalizeToolCalls(toolCalls) {
  if (!Array.isArray(toolCalls)) return [];
  return toolCalls.map(tc => ({
    id: tc.id || generateToolCallId(),
    type: 'function',
    function: {
      name: tc.function?.name || tc.name || '',
      arguments: typeof tc.function?.arguments === 'string'
        ? tc.function.arguments
        : typeof tc.arguments === 'string'
          ? tc.arguments
          : JSON.stringify(tc.function?.arguments || tc.arguments || {})
    }
  }));
}

/* =========================================================
   TOOL EXECUTION
   ========================================================= */

function getEvidenceAdapter() {
  if (typeof window !== 'undefined' && window.NeuralVerse?.createAgentEvidenceAdapter) {
    try {
      return window.NeuralVerse.createAgentEvidenceAdapter();
    } catch {
      return null;
    }
  }
  return null;
}

async function executeToolCall(toolCall, context) {
  const toolName = toolCall.function?.name || '';
  const rawArgs = safeParseArguments(toolCall.function?.arguments);
  const args = normalizeToolArguments(toolName, rawArgs);

  if (!isSupportedAgentTool(toolName)) {
    return {
      evidenceType: 'tool_error',
      summary: `Unsupported tool: ${toolName}`,
      content: `The tool "${toolName}" is not a recognized NeuralVerse agent tool.`,
      agentId: null,
      confidence: 'none',
      metadata: { source: 'agentic-loop', toolName, error: 'unsupported_tool' }
    };
  }

  // Handle learner model update tool — special path
  if (toolName === 'update_learner_model') {
    return handleLearnerModelUpdate(args, context);
  }

  const agentId = getToolToAgentMap()[toolName];
  if (!agentId) {
    return {
      evidenceType: 'tool_error',
      summary: `No agent mapped for tool: ${toolName}`,
      content: `Internal mapping error for tool "${toolName}".`,
      agentId: null,
      confidence: 'none',
      metadata: { source: 'agentic-loop', toolName, error: 'mapping_error' }
    };
  }

  const adapter = getEvidenceAdapter();
  if (!adapter) {
    return {
      evidenceType: 'tool_error',
      summary: 'Evidence adapter not available',
      content: 'The agent evidence adapter is not loaded. Cannot execute tool calls.',
      agentId: agentId,
      confidence: 'none',
      metadata: { source: 'agentic-loop', toolName, error: 'adapter_unavailable' }
    };
  }

  try {
    const evidence = await adapter.collectAgentEvidence(agentId, {
      query: args.topic,
      intents: args.mode ? [args.mode] : ['default'],
      context: context || {}
    });
    return evidence;
  } catch (e) {
    return {
      evidenceType: 'tool_error',
      summary: `Tool execution failed: ${e.message}`,
      content: `Agent "${agentId}" failed during execution: ${e.message}`,
      agentId: agentId,
      confidence: 'none',
      metadata: { source: 'agentic-loop', toolName, error: 'execution_error', errorMessage: e.message }
    };
  }
}

/* =========================================================
   LEARNER MODEL UPDATE HANDLER
   ========================================================= */

function handleLearnerModelUpdate(args, context) {
  try {
    const updates = {};
    let updateCount = 0;

    if (args.concepts_introduced && Array.isArray(args.concepts_introduced)) {
      updates.recentlyStudiedTopics = args.concepts_introduced.map(c => ({
        topic: c,
        timestamp: new Date().toISOString(),
        depth: 'introduced'
      }));
      updateCount += args.concepts_introduced.length;
    }

    if (args.concepts_mastered && Array.isArray(args.concepts_mastered)) {
      updates.masteredConcepts = args.concepts_mastered.map(c => ({
        concept: c,
        confidence: 0.8,
        lastSeen: new Date().toISOString()
      }));
      updateCount += args.concepts_mastered.length;
    }

    if (args.concepts_struggling && Array.isArray(args.concepts_struggling)) {
      updates.strugglingConcepts = args.concepts_struggling.map(c => ({
        concept: c,
        confidence: 0.3,
        lastSeen: new Date().toISOString()
      }));
      updateCount += args.concepts_struggling.length;
    }

    if (args.misconceptions && Array.isArray(args.misconceptions)) {
      updates.misconceptionHistory = args.misconceptions.map(m => ({
        misconception: m.misconception,
        correction: m.correction,
        timestamp: new Date().toISOString(),
        resolved: false
      }));
      updateCount += args.misconceptions.length;
    }

    if (args.preferred_teaching_style) {
      updates.preferredExplanationStyle = {
        value: args.preferred_teaching_style,
        confidence: 0.6
      };
      updateCount += 1;
    }

    if (args.difficulty_estimate) {
      updates.difficultyEstimate = args.difficulty_estimate;
      updateCount += 1;
    }

    if (args.learning_goals && Array.isArray(args.learning_goals)) {
      updates.activeLearningGoals = args.learning_goals.map(g => ({
        goal: g,
        priority: 'medium',
        startedAt: new Date().toISOString()
      }));
      updateCount += args.learning_goals.length;
    }

    return {
      evidenceType: 'learner-model-update',
      summary: `Learner model updated: ${updateCount} field(s) changed via ${args.source || 'interaction_analysis'}`,
      content: `Successfully updated learner model with ${updateCount} observation(s).`,
      agentId: 'learner-model-update',
      confidence: 'high',
      metadata: {
        source: 'learner-model-update',
        updateSource: args.source || 'interaction_analysis',
        updateCount,
        timestamp: new Date().toISOString(),
        fieldsUpdated: Object.keys(updates)
      },
      _learnerModelUpdates: updates
    };
  } catch (e) {
    return {
      evidenceType: 'tool_error',
      summary: `Learner model update failed: ${e.message}`,
      content: `Failed to update learner model: ${e.message}`,
      agentId: 'learner-model-update',
      confidence: 'none',
      metadata: { source: 'learner-model-update', error: 'update_failed', errorMessage: e.message }
    };
  }
}

/* =========================================================
   FORCE FINAL ANSWER
   ========================================================= */

async function forceFinalAnswer(providerFn, messages, evidence) {
  const evidenceSummary = evidence.map(e => ({
    agent: e.agentId || 'unknown',
    type: e.evidenceType || 'unknown',
    summary: e.summary || ''
  }));

  const forcedMessages = messages.concat([{
    role: 'user',
    content: 'Please provide your final answer now based on the evidence collected. Do not make any more tool calls.'
  }]);

  try {
    const response = await providerFn(forcedMessages);
    const normalized = normalizeProviderResponse(response);
    return {
      content: normalized.content,
      stoppedBy: STOPPED_BY.FINAL_ANSWER,
      evidenceUsed: evidence,
      toolCalls: []
    };
  } catch (e) {
    return {
      content: 'I was unable to generate a response after collecting evidence. Please try again.',
      stoppedBy: STOPPED_BY.PROVIDER_ERROR,
      evidenceUsed: evidence,
      toolCalls: [],
      error: e.message
    };
  }
}

/* =========================================================
   AGENTIC LOOP
   ========================================================= */

function createAgenticLoop(options) {
  const providerFn = options?.providerFn;
  const context = options?.context || {};

  if (typeof providerFn !== 'function') {
    throw new Error('createAgenticLoop requires a providerFn function');
  }

  async function runAgenticLoop(request) {
    const startTime = Date.now();
    const requestId = 'agentic-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);

    const userMessage = request?.message || '';
    if (!userMessage) {
      return buildResult({
        type: 'error',
        content: 'No message provided.',
        stoppedBy: STOPPED_BY.PROVIDER_ERROR,
        evidenceUsed: [],
        allToolCalls: [],
        iterations: 0,
        startTime,
        requestId
      });
    }

    const systemPrompt = getAgenticSystemPrompt(options?.learnerContext);
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    const evidenceUsed = [];
    const allToolCalls = [];
    let stoppedBy = STOPPED_BY.DIRECT_RESPONSE;

    for (let iteration = 0; iteration < MAX_AGENTIC_ITERATIONS; iteration++) {
      let response;
      try {
        response = await providerFn(messages, {
          tools: getAgentTools(),
          tool_choice: 'auto'
        });
      } catch (e) {
        stoppedBy = STOPPED_BY.PROVIDER_ERROR;
        return buildResult({
          type: 'error',
          content: `Provider error: ${e.message}`,
          stoppedBy,
          evidenceUsed,
          allToolCalls,
          iterations: iteration + 1,
          startTime,
          requestId,
          error: e.message
        });
      }

      const normalized = normalizeProviderResponse(response);

      // No tool calls → direct response
      if (normalized.toolCalls.length === 0) {
        stoppedBy = STOPPED_BY.DIRECT_RESPONSE;
        return buildResult({
          type: 'success',
          content: normalized.content,
          stoppedBy,
          evidenceUsed,
          allToolCalls,
          iterations: iteration + 1,
          startTime,
          requestId
        });
      }

      // Has tool calls → execute them
      messages.push({
        role: 'assistant',
        content: normalized.content || null,
        tool_calls: normalized.toolCalls
      });

      for (const toolCall of normalized.toolCalls) {
        allToolCalls.push({
          id: toolCall.id,
          name: toolCall.function.name,
          arguments: safeParseArguments(toolCall.function.arguments)
        });

        const result = await executeToolCall(toolCall, context);
        evidenceUsed.push(result);

        // Apply learner model updates if present
        if (result._learnerModelUpdates && context?.onLearnerModelUpdate) {
          context.onLearnerModelUpdate(result._learnerModelUpdates, result.metadata?.updateSource);
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });
      }
    }

    // Max iterations reached → force final answer
    stoppedBy = STOPPED_BY.MAX_ITERATIONS;
    const forced = await forceFinalAnswer(providerFn, messages, evidenceUsed);

    return buildResult({
      type: forced.content ? 'success' : 'error',
      content: forced.content || 'Maximum reasoning iterations reached without a final answer.',
      stoppedBy,
      evidenceUsed: forced.evidenceUsed || evidenceUsed,
      allToolCalls,
      iterations: MAX_AGENTIC_ITERATIONS,
      startTime,
      requestId
    });
  }

  return { runAgenticLoop };
}

/* =========================================================
   RESULT BUILDER
   ========================================================= */

function buildResult({ type, content, stoppedBy, evidenceUsed, allToolCalls, iterations, startTime, requestId, error }) {
  const durationMs = Date.now() - (startTime || Date.now());
  const toolNames = (allToolCalls || []).map(tc => tc.name);
  const uniqueTools = [...new Set(toolNames)];

  return {
    type: type || 'error',
    content: content || '',
    evidenceUsed: evidenceUsed || [],
    toolCalls: allToolCalls || [],
    iterations: iterations || 0,
    stoppedBy: stoppedBy || STOPPED_BY.PROVIDER_ERROR,
    developerMetadata: {
      requestId: requestId || 'unknown',
      orchestrationMode: 'agentic',
      toolsUsed: uniqueTools,
      toolCallCount: allToolCalls?.length || 0,
      evidenceCount: evidenceUsed?.length || 0,
      iterations: iterations || 0,
      stoppedBy: stoppedBy || STOPPED_BY.PROVIDER_ERROR,
      durationMs,
      timestamp: new Date().toISOString()
    }
  };
}

/* =========================================================
   EXPORTS
   ========================================================= */

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.agenticLoop = {
    createAgenticLoop,
    createStreamingAgenticLoop,
    createEducationalPlan,
    updatePlanAfterToolCall,
    addTimelineEntry,
    executeToolCall,
    normalizeProviderResponse,
    forceFinalAnswer,
    MAX_AGENTIC_ITERATIONS,
    STOPPED_BY
  };
}

/* =========================================================
   EDUCATIONAL PLAN (Browser-Compatible)
   ========================================================= */

function createEducationalPlan(goal, maxIterations) {
  return {
    learningGoal: goal || '',
    subGoals: [],
    requiredEvidence: [],
    completedEvidence: [],
    remainingEvidence: [],
    recommendedNextQuestion: [],
    recommendedArtifacts: [],
    estimatedComplexity: 'intermediate',
    estimatedReadingTime: 0,
    confidence: 0,
    iteration: 0,
    maxIterations: maxIterations || MAX_AGENTIC_ITERATIONS,
    timeline: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

function updatePlanAfterToolCall(plan, toolName, agentId, summary, confidence) {
  const updated = Object.assign({}, plan);
  updated.iteration += 1;
  updated.updatedAt = Date.now();

  updated.completedEvidence = updated.completedEvidence.concat([{
    toolName, agentId, summary, confidence, collectedAt: Date.now()
  }]);

  updated.remainingEvidence = updated.requiredEvidence
    .filter(function(r) { return r.status === 'pending'; })
    .map(function(r) { return r.toolName; });

  var highConf = updated.completedEvidence.filter(function(e) { return e.confidence === 'high'; }).length;
  var total = updated.completedEvidence.length;
  updated.confidence = total > 0 ? Math.min(1, highConf * 0.3 + total * 0.1) : 0;

  updated.timeline = updated.timeline.concat([{
    id: 'tl_' + Date.now(),
    type: 'tool_result',
    agentId: agentId,
    toolName: toolName,
    label: agentId + ' evidence collected',
    status: 'completed',
    timestamp: Date.now()
  }]);

  return updated;
}

function addTimelineEntry(plan, entry) {
  var updated = Object.assign({}, plan);
  updated.updatedAt = Date.now();
  updated.timeline = updated.timeline.concat([Object.assign({}, entry, {
    id: 'tl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now()
  })]);
  return updated;
}

/* =========================================================
   STREAMING AGENTIC LOOP (Browser-Compatible)
   ========================================================= */

function createStreamingAgenticLoop(options) {
  var providerFn = options?.providerFn;
  var context = options?.context || {};
  var maxIterations = options?.maxIterations || MAX_AGENTIC_ITERATIONS;
  var onChunk = options?.onChunk || null;
  var onToolStart = options?.onToolStart || null;
  var onToolEnd = options?.onToolEnd || null;
  var onPlanUpdate = options?.onPlanUpdate || null;
  var onTimelineUpdate = options?.onTimelineUpdate || null;
  var onComplete = options?.onComplete || null;
  var onError = options?.onError || null;

  if (typeof providerFn !== 'function') {
    throw new Error('createStreamingAgenticLoop requires a providerFn function');
  }

  var abortController = null;

  function emitChunk(chunk) {
    if (onChunk) onChunk(chunk);
  }

  function emitControl(type) {
    emitChunk({ id: 'chunk_' + Date.now(), type: 'control', content: type, timestamp: Date.now(), index: 0 });
  }

  async function runStreamingLoop(request) {
    var startTime = Date.now();
    var requestId = 'stream-agentic-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    abortController = new AbortController();

    var userMessage = request?.message || '';
    if (!userMessage) {
      return buildResult({ type: 'error', content: 'No message provided.', stoppedBy: STOPPED_BY.PROVIDER_ERROR, evidenceUsed: [], allToolCalls: [], iterations: 0, startTime, requestId });
    }

    var systemPrompt = getAgenticSystemPrompt();
    var messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    var plan = createEducationalPlan(userMessage, maxIterations);
    var evidenceUsed = [];
    var allToolCalls = [];
    var accumulatedContent = '';
    var stoppedBy = STOPPED_BY.DIRECT_RESPONSE;

    emitControl('thinking');

    for (var iteration = 0; iteration < maxIterations; iteration++) {
      if (abortController.signal.aborted) { stoppedBy = STOPPED_BY.MAX_ITERATIONS; break; }

      plan = addTimelineEntry(plan, { type: 'planning', label: 'Planning iteration ' + (iteration + 1), status: 'completed' });
      if (onPlanUpdate) onPlanUpdate(plan);
      if (onTimelineUpdate) onTimelineUpdate(plan.timeline);

      emitControl('planning');

      var response;
      try {
        response = await providerFn(messages, { tools: getAgentTools(), tool_choice: 'auto' });
      } catch (e) {
        stoppedBy = STOPPED_BY.PROVIDER_ERROR;
        if (onError) onError(e);
        break;
      }

      if (abortController.signal.aborted) { stoppedBy = STOPPED_BY.MAX_ITERATIONS; break; }

      var normalized = normalizeProviderResponse(response);

      if (normalized.toolCalls.length === 0) {
        if (normalized.content) {
          accumulatedContent += normalized.content;
          var words = normalized.content.split(/(\s+)/);
          for (var w = 0; w < words.length; w++) {
            if (abortController.signal.aborted) break;
            emitChunk({ id: 'chunk_' + Date.now() + '_' + w, type: 'text', content: accumulatedContent, delta: words[w], timestamp: Date.now(), index: w });
          }
          messages.push({ role: 'assistant', content: normalized.content });
        }
        stoppedBy = STOPPED_BY.DIRECT_RESPONSE;
        break;
      }

      if (normalized.content) {
        accumulatedContent += normalized.content;
        messages.push({ role: 'assistant', content: normalized.content, tool_calls: normalized.toolCalls });
      } else {
        messages.push({ role: 'assistant', content: null, tool_calls: normalized.toolCalls });
      }

      for (var t = 0; t < normalized.toolCalls.length; t++) {
        if (abortController.signal.aborted) break;

        var tc = normalized.toolCalls[t];
        allToolCalls.push({ id: tc.id, name: tc.function.name, arguments: safeParseArguments(tc.function.arguments) });

        emitChunk({ id: 'chunk_' + Date.now(), type: 'tool_call', content: '', toolCall: { id: tc.id, name: tc.function.name, arguments: tc.function.arguments }, timestamp: Date.now(), index: allToolCalls.length });

        if (onToolStart) onToolStart(tc.function.name);

        var toolStart = Date.now();
        var toolResult;
        try {
          toolResult = await executeToolCall(tc, context);
        } catch (e) {
          toolResult = { evidenceType: 'tool_error', summary: e.message, content: e.message, agentId: null, confidence: 'none', metadata: { source: 'agentic-loop', error: 'execution_error' } };
        }

        // Apply learner model updates if present
        if (toolResult._learnerModelUpdates && context?.onLearnerModelUpdate) {
          context.onLearnerModelUpdate(toolResult._learnerModelUpdates, toolResult.metadata?.updateSource);
        }

        var toolDuration = Date.now() - toolStart;
        if (onToolEnd) onToolEnd(tc.function.name, toolDuration);

        emitChunk({ id: 'chunk_' + Date.now(), type: 'tool_result', content: toolResult.summary || '', toolCall: { id: tc.id, name: tc.function.name, arguments: tc.function.arguments }, timestamp: Date.now(), index: allToolCalls.length });

        messages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(toolResult) });

        evidenceUsed.push(toolResult);

        plan = updatePlanAfterToolCall(plan, tc.function.name, toolResult.agentId || tc.function.name, toolResult.summary || toolResult.content.substring(0, 200), toolResult.confidence || 'medium');

        plan = addTimelineEntry(plan, { type: 'tool_result', agentId: toolResult.agentId || tc.function.name, toolName: tc.function.name, label: tc.function.name + ' (' + toolDuration + 'ms)', durationMs: toolDuration, status: 'completed' });

        if (onPlanUpdate) onPlanUpdate(plan);
        if (onTimelineUpdate) onTimelineUpdate(plan.timeline);
      }
    }

    if (stoppedBy === STOPPED_BY.DIRECT_RESPONSE && iteration >= maxIterations) {
      stoppedBy = STOPPED_BY.MAX_ITERATIONS;
    }

    if (!accumulatedContent && stoppedBy === STOPPED_BY.MAX_ITERATIONS) {
      var forced = await forceFinalAnswer(providerFn, messages, evidenceUsed);
      accumulatedContent = forced.content || 'Maximum reasoning iterations reached without a final answer.';
      var fallbackWords = accumulatedContent.split(/(\s+)/);
      for (var fw = 0; fw < fallbackWords.length; fw++) {
        emitChunk({ id: 'chunk_' + Date.now() + '_forced_' + fw, type: 'text', content: accumulatedContent, delta: fallbackWords[fw], timestamp: Date.now(), index: fw });
      }
    }

    emitControl('complete');

    var durationMs = Date.now() - startTime;
    var result = buildResult({
      type: stoppedBy === STOPPED_BY.PROVIDER_ERROR ? 'error' : 'success',
      content: accumulatedContent,
      stoppedBy: stoppedBy,
      evidenceUsed: evidenceUsed,
      allToolCalls: allToolCalls,
      iterations: Math.min(iteration + 1, maxIterations),
      startTime: startTime,
      requestId: requestId
    });

    result.plan = plan;
    result.developerMetadata.orchestrationMode = 'agentic-streaming';
    result.developerMetadata.toolsUsed = [...new Set(plan.completedEvidence.map(function(e) { return e.toolName; }))];
    result.developerMetadata.evidenceCount = plan.completedEvidence.length;
    result.developerMetadata.confidence = plan.confidence;
    result.developerMetadata.timeline = plan.timeline;
    result.developerMetadata.iterations = plan.iteration;

    if (onComplete) onComplete(result);
    return result;
  }

  function abort() {
    if (abortController) abortController.abort();
  }

  return { runStreamingLoop: runStreamingLoop, abort: abort };
}

export {
  createAgenticLoop,
  createStreamingAgenticLoop,
  createEducationalPlan,
  updatePlanAfterToolCall,
  addTimelineEntry,
  executeToolCall,
  normalizeProviderResponse,
  forceFinalAnswer,
  MAX_AGENTIC_ITERATIONS,
  STOPPED_BY
};
