/**
 * StreamingValidation — Validates streaming chunks and messages
 */

import type { StreamingChunk, TextChunk, ToolCallChunk, ControlChunk } from './StreamingChunk.js';
import type { StreamingMessage } from './StreamingMessage.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateChunk(chunk: unknown): ValidationResult {
  const errors: string[] = [];

  if (!chunk || typeof chunk !== 'object') {
    return { valid: false, errors: ['Chunk is not an object'] };
  }

  const c = chunk as Record<string, unknown>;

  if (typeof c.id !== 'string' || c.id.length === 0) {
    errors.push('Chunk missing valid id');
  }

  const validTypes = ['text', 'tool_call', 'tool_result', 'control', 'error'];
  if (!validTypes.includes(c.type as string)) {
    errors.push(`Invalid chunk type: ${c.type}`);
  }

  if (typeof c.content !== 'string') {
    errors.push('Chunk content is not a string');
  }

  if (typeof c.timestamp !== 'number') {
    errors.push('Chunk timestamp is not a number');
  }

  if (typeof c.index !== 'number') {
    errors.push('Chunk index is not a number');
  }

  return { valid: errors.length === 0, errors };
}

export function validateMessage(message: unknown): ValidationResult {
  const errors: string[] = [];

  if (!message || typeof message !== 'object') {
    return { valid: false, errors: ['Message is not an object'] };
  }

  const m = message as Record<string, unknown>;

  if (typeof m.id !== 'string' || m.id.length === 0) {
    errors.push('Message missing valid id');
  }

  const validRoles = ['system', 'user', 'assistant', 'tool'];
  if (!validRoles.includes(m.role as string)) {
    errors.push(`Invalid message role: ${m.role}`);
  }

  if (typeof m.content !== 'string') {
    errors.push('Message content is not a string');
  }

  if (typeof m.timestamp !== 'number') {
    errors.push('Message timestamp is not a number');
  }

  return { valid: errors.length === 0, errors };
}

export function validateStreamingResponse(response: unknown): ValidationResult {
  const errors: string[] = [];

  if (!response || typeof response !== 'object') {
    return { valid: false, errors: ['Response is not an object'] };
  }

  const r = response as Record<string, unknown>;

  if (typeof r.type !== 'string') {
    errors.push('Response missing type');
  }

  if (typeof r.content !== 'string') {
    errors.push('Response missing content');
  }

  return { valid: errors.length === 0, errors };
}
