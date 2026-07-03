/**
 * StreamingRuntime — Core streaming orchestration
 *
 * Manages the streaming lifecycle: start, chunk processing, tool execution,
 * planning updates, completion, and abort.
 */

import type { StreamingChunk } from './StreamingChunk.js';
import { createTextChunk, createToolCallChunk, createToolResultChunk, createControlChunk } from './StreamingChunk.js';
import type { StreamingMessage, MessageMetadata } from './StreamingMessage.js';
import { createUserMessage, createAssistantMessage } from './StreamingMessage.js';
import type { StreamingSessionState } from './StreamingSession.js';
import { createStreamingSession, addUserMessage, addAssistantMessage, addToolMessage, addChunk, abortSession, completeSession, startStreaming, isSessionExpired } from './StreamingSession.js';
import type { EducationalPlan } from './EducationalPlan.js';
import { createEducationalPlan, updatePlanAfterToolCall, addTimelineEntry } from './EducationalPlan.js';
import { validateChunk } from './StreamingValidation.js';

export type ProviderFn = (messages: StreamingMessage[], options?: { tools?: unknown[]; tool_choice?: string }) => Promise<{
  content?: string;
  tool_calls?: Array<{
    id: string;
    type: string;
    function: { name: string; arguments: string };
  }>;
}>;

export interface ToolExecutor {
  execute(toolCall: { id: string; name: string; arguments: string }): Promise<{ content: string; agentId?: string; summary?: string; confidence?: string }>;
}

export interface StreamingRuntimeConfig {
  maxIterations: number;
  timeoutMs: number;
  onChunk?: (chunk: StreamingChunk) => void;
  onToolStart?: (toolName: string) => void;
  onToolEnd?: (toolName: string, durationMs: number) => void;
  onPlanUpdate?: (plan: EducationalPlan) => void;
  onTimelineUpdate?: (timeline: EducationalPlan['timeline']) => void;
  onComplete?: (result: StreamingResult) => void;
  onError?: (error: Error) => void;
}

export interface StreamingResult {
  type: 'success' | 'error' | 'aborted';
  content: string;
  messages: StreamingMessage[];
  chunks: StreamingChunk[];
  plan: EducationalPlan;
  iterations: number;
  stoppedBy: string;
  durationMs: number;
  developerMetadata: Record<string, unknown>;
}

const DEFAULT_RUNTIME_CONFIG: StreamingRuntimeConfig = {
  maxIterations: 5,
  timeoutMs: 60000
};

export function createStreamingRuntime(config?: Partial<StreamingRuntimeConfig>) {
  const mergedConfig = { ...DEFAULT_RUNTIME_CONFIG, ...config };
  let session: StreamingSessionState = createStreamingSession({ maxIterations: mergedConfig.maxIterations, timeoutMs: mergedConfig.timeoutMs });
  let abortController: AbortController | null = null;

  function emitChunk(chunk: StreamingChunk) {
    const validated = validateChunk(chunk);
    if (validated.valid) {
      session = addChunk(session, chunk);
      mergedConfig.onChunk?.(chunk);
    }
  }

  function emitControl(type: 'thinking' | 'planning' | 'synthesizing' | 'complete' | 'aborted') {
    emitChunk(createControlChunk(type, session.chunks.length));
  }

  async function runStreamingLoop(
    userMessage: string,
    providerFn: ProviderFn,
    toolExecutor: ToolExecutor,
    tools: unknown[],
    context?: Record<string, unknown>
  ): Promise<StreamingResult> {
    const startTime = Date.now();
    abortController = new AbortController();

    // Add user message
    session = addUserMessage(session, userMessage);
    session = startStreaming(session);

    let accumulatedContent = '';
    let iterations = 0;
    let stoppedBy = 'direct_response';

    try {
      emitControl('thinking');

      for (let i = 0; i < mergedConfig.maxIterations; i++) {
        if (abortController.signal.aborted || session.isAborted) {
          stoppedBy = 'aborted';
          break;
        }

        if (isSessionExpired(session)) {
          stoppedBy = 'timeout';
          break;
        }

        iterations = i + 1;
        emitControl('planning');

        // Call provider
        let response;
        try {
          response = await providerFn(session.messages, { tools, tool_choice: 'auto' });
        } catch (e) {
          stoppedBy = 'provider_error';
          break;
        }

        if (abortController.signal.aborted) {
          stoppedBy = 'aborted';
          break;
        }

        const content = response.content || '';
        const toolCalls = response.tool_calls || [];

        // If no tool calls, this is the final answer
        if (toolCalls.length === 0) {
          if (content) {
            accumulatedContent += content;

            // Stream text chunks
            const words = content.split(/(\s+)/);
            for (const word of words) {
              if (abortController.signal.aborted) break;
              emitChunk(createTextChunk(accumulatedContent, word, session.chunks.length));
            }

            // Add assistant message
            session = addAssistantMessage(session, content, {
              iteration: iterations,
              stoppedBy: 'direct_response'
            });
          }
          stoppedBy = 'direct_response';
          break;
        }

        // Execute tool calls
        emitControl('planning');

        // Add assistant message with tool calls
        const assistantContent = content || '';
        if (assistantContent) {
          accumulatedContent += assistantContent;
          session = addAssistantMessage(session, assistantContent, { iteration: iterations });
        }

        for (const tc of toolCalls) {
          if (abortController.signal.aborted) break;

          const toolChunk = createToolCallChunk(
            { id: tc.id, name: tc.function.name, arguments: tc.function.arguments },
            session.chunks.length
          );
          emitChunk(toolChunk);

          mergedConfig.onToolStart?.(tc.function.name);

          const toolStart = Date.now();
          let toolResult;
          try {
            toolResult = await toolExecutor.execute({
              id: tc.id,
              name: tc.function.name,
              arguments: tc.function.arguments
            });
          } catch (e) {
            toolResult = { content: `Error: ${e instanceof Error ? e.message : 'Unknown error'}` };
          }

          const toolDuration = Date.now() - toolStart;
          mergedConfig.onToolEnd?.(tc.function.name, toolDuration);

          const resultChunk = createToolResultChunk(
            { id: tc.id, name: tc.function.name, arguments: tc.function.arguments },
            toolResult.content,
            session.chunks.length
          );
          emitChunk(resultChunk);

          // Add tool message
          session = addToolMessage(session, tc.id, toolResult.content);

          // Update plan
          session = {
            ...session,
            plan: updatePlanAfterToolCall(
              session.plan,
              tc.function.name,
              toolResult.agentId || tc.function.name,
              toolResult.summary || toolResult.content.substring(0, 200),
              toolResult.confidence || 'medium'
            )
          };

          // Add timeline entry
          session = {
            ...session,
            plan: addTimelineEntry(session.plan, {
              type: 'tool_result',
              agentId: toolResult.agentId || tc.function.name,
              toolName: tc.function.name,
              label: `${tc.function.name} (${toolDuration}ms)`,
              durationMs: toolDuration,
              status: 'completed'
            })
          };

          mergedConfig.onPlanUpdate?.(session.plan);
          mergedConfig.onTimelineUpdate?.(session.plan.timeline);
        }
      }

      if (stoppedBy === 'direct_response' && iterations >= mergedConfig.maxIterations) {
        stoppedBy = 'max_iterations';
      }

    } catch (e) {
      stoppedBy = 'error';
      mergedConfig.onError?.(e instanceof Error ? e : new Error(String(e)));
    }

    emitControl('complete');
    session = completeSession(session);

    const durationMs = Date.now() - startTime;

    return {
      type: stoppedBy === 'aborted' ? 'aborted' : stoppedBy === 'error' ? 'error' : 'success',
      content: accumulatedContent,
      messages: session.messages,
      chunks: session.chunks,
      plan: session.plan,
      iterations,
      stoppedBy,
      durationMs,
      developerMetadata: {
        orchestrationMode: 'agentic-streaming',
        iterations,
        stoppedBy,
        toolsUsed: [...new Set(session.plan.completedEvidence.map(e => e.toolName))],
        evidenceCount: session.plan.completedEvidence.length,
        confidence: session.plan.confidence,
        chunkCount: session.chunks.length,
        durationMs
      }
    };
  }

  function abort() {
    abortController?.abort();
    session = abortSession(session);
    emitControl('aborted');
  }

  function getSession() {
    return session;
  }

  function reset() {
    session = createStreamingSession({ maxIterations: mergedConfig.maxIterations, timeoutMs: mergedConfig.timeoutMs });
    abortController = null;
  }

  return {
    runStreamingLoop,
    abort,
    getSession,
    reset
  };
}
