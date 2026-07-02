/**
 * StreamingSession — Manages a streaming conversation session
 */

import type { StreamingMessage, MessageMetadata } from './StreamingMessage.js';
import { createUserMessage, createAssistantMessage, createToolMessage } from './StreamingMessage.js';
import type { StreamingChunk } from './StreamingChunk.js';
import type { EducationalPlan } from './EducationalPlan.js';
import { createEducationalPlan } from './EducationalPlan.js';

export interface StreamingSessionConfig {
  maxIterations: number;
  timeoutMs: number;
  maxChunks: number;
}

const DEFAULT_CONFIG: StreamingSessionConfig = {
  maxIterations: 5,
  timeoutMs: 60000,
  maxChunks: 1000
};

export interface StreamingSessionState {
  id: string;
  messages: StreamingMessage[];
  chunks: StreamingChunk[];
  plan: EducationalPlan;
  isStreaming: boolean;
  isAborted: boolean;
  startedAt: number;
  lastActivityAt: number;
  config: StreamingSessionConfig;
}

export function createStreamingSession(config?: Partial<StreamingSessionConfig>): StreamingSessionState {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    messages: [],
    chunks: [],
    plan: createEducationalPlan('', mergedConfig.maxIterations),
    isStreaming: false,
    isAborted: false,
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
    config: mergedConfig
  };
}

export function addUserMessage(session: StreamingSessionState, content: string): StreamingSessionState {
  const message = createUserMessage(content);
  return {
    ...session,
    messages: [...session.messages, message],
    lastActivityAt: Date.now(),
    plan: { ...session.plan, learningGoal: content, updatedAt: Date.now() }
  };
}

export function addAssistantMessage(
  session: StreamingSessionState,
  content: string,
  metadata?: MessageMetadata
): StreamingSessionState {
  const message = createAssistantMessage(content, metadata);
  return {
    ...session,
    messages: [...session.messages, message],
    lastActivityAt: Date.now()
  };
}

export function addToolMessage(
  session: StreamingSessionState,
  toolCallId: string,
  content: string
): StreamingSessionState {
  const message = createToolMessage(toolCallId, content);
  return {
    ...session,
    messages: [...session.messages, message],
    lastActivityAt: Date.now()
  };
}

export function addChunk(session: StreamingSessionState, chunk: StreamingChunk): StreamingSessionState {
  if (session.chunks.length >= session.config.maxChunks) {
    return session;
  }
  return {
    ...session,
    chunks: [...session.chunks, chunk],
    lastActivityAt: Date.now()
  };
}

export function abortSession(session: StreamingSessionState): StreamingSessionState {
  return {
    ...session,
    isAborted: true,
    isStreaming: false,
    lastActivityAt: Date.now()
  };
}

export function completeSession(session: StreamingSessionState): StreamingSessionState {
  return {
    ...session,
    isStreaming: false,
    isAborted: false,
    lastActivityAt: Date.now()
  };
}

export function startStreaming(session: StreamingSessionState): StreamingSessionState {
  return {
    ...session,
    isStreaming: true,
    isAborted: false,
    lastActivityAt: Date.now()
  };
}

export function isSessionExpired(session: StreamingSessionState): boolean {
  const elapsed = Date.now() - session.startedAt;
  return elapsed > session.config.timeoutMs;
}

export function getSessionSummary(session: StreamingSessionState) {
  return {
    id: session.id,
    messageCount: session.messages.length,
    chunkCount: session.chunks.length,
    isStreaming: session.isStreaming,
    isAborted: session.isAborted,
    planIteration: session.plan.iteration,
    planConfidence: session.plan.confidence,
    elapsedMs: Date.now() - session.startedAt
  };
}
