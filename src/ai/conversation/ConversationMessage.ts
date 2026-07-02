/**
 * Conversation Message — Message Types
 *
 * Defines message structure for conversations.
 * Messages are deterministic data structures.
 */

import type { MessageType } from './ConversationState.ts';

// ============================================================================
// MESSAGE INTERFACE
// ============================================================================

export interface ConversationMessage {
  readonly id: string;
  readonly type: MessageType;
  readonly content: string;
  readonly timestamp: string;
  readonly metadata: MessageMetadata;
  readonly artifacts?: readonly MessageArtifact[];
}

export interface MessageMetadata {
  readonly requestId?: string;
  readonly provider?: string;
  readonly model?: string;
  readonly mode?: string;
  readonly style?: string;
  readonly latencyMs?: number;
  readonly tokenUsage?: {
    readonly prompt: number;
    readonly completion: number;
    readonly total: number;
  };
  readonly contributingAgents?: readonly string[];
  readonly validationStatus?: string;
}

export interface MessageArtifact {
  readonly id: string;
  readonly type: ArtifactType;
  readonly title: string;
  readonly content: string;
  readonly createdAt: string;
}

export const CANONICAL_ARTIFACT_TYPES = [
  'quiz',
  'laboratory',
  'diagram',
  'comparison',
  'explanation',
  'summary',
  'reference',
  'flashcards'
] as const;

export type ArtifactType = (typeof CANONICAL_ARTIFACT_TYPES)[number];

// ============================================================================
// MESSAGE FACTORY
// ============================================================================

let messageCounter = 0;

export function createUserMessage(content: string): ConversationMessage {
  return createMessage('user', content);
}

export function createAssistantMessage(
  content: string,
  metadata: Partial<MessageMetadata> = {}
): ConversationMessage {
  return createMessage('assistant', content, metadata);
}

export function createSystemMessage(content: string): ConversationMessage {
  return createMessage('system', content);
}

export function createDeveloperMessage(content: string): ConversationMessage {
  return createMessage('developer', content);
}

export function createContextMessage(content: string): ConversationMessage {
  return createMessage('context', content);
}

export function createGuardrailMessage(content: string): ConversationMessage {
  return createMessage('guardrail', content);
}

export function createToolMessage(content: string): ConversationMessage {
  return createMessage('tool', content);
}

export function createArtifactMessage(
  content: string,
  artifacts: readonly MessageArtifact[]
): ConversationMessage {
  const msg = createMessage('artifact', content);
  // Artifacts are added via the spread below
  return {
    ...msg,
    artifacts
  };
}

function createMessage(
  type: MessageType,
  content: string,
  metadata: Partial<MessageMetadata> = {}
): ConversationMessage {
  messageCounter++;
  return {
    id: `msg-${Date.now()}-${messageCounter}`,
    type,
    content,
    timestamp: new Date().toISOString(),
    metadata: {
      ...metadata
    }
  };
}

// ============================================================================
// ARTIFACT FACTORY
// ============================================================================

let artifactCounter = 0;

export function createArtifact(
  type: ArtifactType,
  title: string,
  content: string
): MessageArtifact {
  artifactCounter++;
  return {
    id: `artifact-${Date.now()}-${artifactCounter}`,
    type,
    title,
    content,
    createdAt: new Date().toISOString()
  };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isUserMessage(msg: ConversationMessage): boolean {
  return msg.type === 'user';
}

export function isAssistantMessage(msg: ConversationMessage): boolean {
  return msg.type === 'assistant';
}

export function isSystemMessage(msg: ConversationMessage): boolean {
  return msg.type === 'system';
}

export function hasArtifacts(msg: ConversationMessage): boolean {
  return msg.artifacts !== undefined && msg.artifacts.length > 0;
}
