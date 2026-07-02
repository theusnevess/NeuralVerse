/**
 * StreamingChunk — Incremental token representation
 *
 * Represents a single chunk in a streaming response.
 * Chunks can be text tokens, tool calls, or control signals.
 */

export interface StreamingChunk {
  id: string;
  type: 'text' | 'tool_call' | 'tool_result' | 'control' | 'error';
  content: string;
  delta?: string;
  toolCall?: {
    id: string;
    name: string;
    arguments: string;
  };
  timestamp: number;
  index: number;
}

export interface TextChunk extends StreamingChunk {
  type: 'text';
  content: string;
  delta: string;
}

export interface ToolCallChunk extends StreamingChunk {
  type: 'tool_call';
  toolCall: {
    id: string;
    name: string;
    arguments: string;
  };
}

export interface ToolResultChunk extends StreamingChunk {
  type: 'tool_result';
  toolCall: {
    id: string;
    name: string;
    arguments: string;
  };
  content: string;
}

export interface ControlChunk extends StreamingChunk {
  type: 'control';
  content: 'thinking' | 'planning' | 'synthesizing' | 'complete' | 'aborted' | 'error';
}

export function createTextChunk(content: string, delta: string, index: number): TextChunk {
  return {
    id: `chunk_${Date.now()}_${index}`,
    type: 'text',
    content,
    delta,
    timestamp: Date.now(),
    index
  };
}

export function createToolCallChunk(toolCall: { id: string; name: string; arguments: string }, index: number): ToolCallChunk {
  return {
    id: `chunk_${Date.now()}_${index}`,
    type: 'tool_call',
    content: '',
    toolCall,
    timestamp: Date.now(),
    index
  };
}

export function createToolResultChunk(toolCall: { id: string; name: string; arguments: string }, resultContent: string, index: number): ToolResultChunk {
  return {
    id: `chunk_${Date.now()}_${index}`,
    type: 'tool_result',
    content: resultContent,
    toolCall,
    timestamp: Date.now(),
    index
  };
}

export function createControlChunk(content: ControlChunk['content'], index: number): ControlChunk {
  return {
    id: `chunk_${Date.now()}_${index}`,
    type: 'control',
    content,
    timestamp: Date.now(),
    index
  };
}
