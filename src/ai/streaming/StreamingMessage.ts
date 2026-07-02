/**
 * StreamingMessage — Conversation message with streaming support
 *
 * Extends standard message types with streaming-specific fields.
 */

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface StreamingMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  toolCalls?: ToolCallReference[];
  toolCallId?: string;
  metadata?: MessageMetadata;
}

export interface ToolCallReference {
  id: string;
  name: string;
  arguments: string;
  result?: string;
}

export interface MessageMetadata {
  provider?: string;
  model?: string;
  iteration?: number;
  stoppedBy?: string;
  toolsUsed?: string[];
  evidenceCount?: number;
  durationMs?: number;
  streaming?: boolean;
  chunkCount?: number;
}

export function createUserMessage(content: string): StreamingMessage {
  return {
    id: `msg_${Date.now()}_user`,
    role: 'user',
    content,
    timestamp: Date.now()
  };
}

export function createAssistantMessage(content: string, metadata?: MessageMetadata): StreamingMessage {
  return {
    id: `msg_${Date.now()}_assistant`,
    role: 'assistant',
    content,
    timestamp: Date.now(),
    metadata
  };
}

export function createToolMessage(toolCallId: string, content: string): StreamingMessage {
  return {
    id: `msg_${Date.now()}_tool`,
    role: 'tool',
    content,
    toolCallId,
    timestamp: Date.now()
  };
}

export function createSystemMessage(content: string): StreamingMessage {
  return {
    id: `msg_${Date.now()}_system`,
    role: 'system',
    content,
    timestamp: Date.now()
  };
}
