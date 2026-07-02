/**
 * Conversation Validation — Validation Rules
 *
 * Validates conversation state and messages.
 * Validation is deterministic — no LLM involvement.
 */

import type { ConversationSession } from './ConversationSession.ts';
import type { ConversationMessage } from './ConversationMessage.ts';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export const CANONICAL_VALIDATION_CODES = [
  'session_valid',
  'session_empty',
  'session_invalid_state',
  'message_invalid_type',
  'message_empty_content',
  'message_duplicate_id',
  'context_invalid_route',
  'summary_invalid_format',
  'metadata_inconsistent'
] as const;

export type ConversationValidationCode = (typeof CANONICAL_VALIDATION_CODES)[number];

export interface ConversationValidationResult {
  readonly valid: boolean;
  readonly code: ConversationValidationCode;
  readonly message: string;
  readonly metadata: ValidationMetadata;
}

export interface ValidationMetadata {
  readonly checkedAt: string;
  readonly validatorVersion: string;
  readonly messageCount: number;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateSession(session: ConversationSession): ConversationValidationResult {
  const checkedAt = new Date().toISOString();

  // Check if session has messages
  if (session.messages.length === 0) {
    return {
      valid: false,
      code: 'session_empty',
      message: 'Session has no messages',
      metadata: {
        checkedAt,
        validatorVersion: '1.0.0',
        messageCount: 0
      }
    };
  }

  // Check state validity
  const validStates = ['new', 'active', 'paused', 'restored', 'finished', 'archived'];
  if (!validStates.includes(session.state)) {
    return {
      valid: false,
      code: 'session_invalid_state',
      message: `Invalid session state: ${session.state}`,
      metadata: {
        checkedAt,
        validatorVersion: '1.0.0',
        messageCount: session.messages.length
      }
    };
  }

  // Validate each message
  for (const msg of session.messages) {
    const msgValidation = validateMessage(msg);
    if (!msgValidation.valid) {
      return msgValidation;
    }
  }

  // Check metadata consistency
  if (session.metadata.messageCount !== session.messages.length) {
    return {
      valid: false,
      code: 'metadata_inconsistent',
      message: `Metadata message count ${session.metadata.messageCount} != actual ${session.messages.length}`,
      metadata: {
        checkedAt,
        validatorVersion: '1.0.0',
        messageCount: session.messages.length
      }
    };
  }

  return {
    valid: true,
    code: 'session_valid',
    message: 'Session is valid',
    metadata: {
      checkedAt,
      validatorVersion: '1.0.0',
      messageCount: session.messages.length
    }
  };
}

export function validateMessage(message: ConversationMessage): ConversationValidationResult {
  const checkedAt = new Date().toISOString();

  // Check message type
  const validTypes = ['system', 'user', 'assistant', 'developer', 'tool', 'context', 'guardrail', 'artifact'];
  if (!validTypes.includes(message.type)) {
    return {
      valid: false,
      code: 'message_invalid_type',
      message: `Invalid message type: ${message.type}`,
      metadata: {
        checkedAt,
        validatorVersion: '1.0.0',
        messageCount: 0
      }
    };
  }

  // Check content
  if (!message.content || message.content.trim().length === 0) {
    return {
      valid: false,
      code: 'message_empty_content',
      message: 'Message has empty content',
      metadata: {
        checkedAt,
        validatorVersion: '1.0.0',
        messageCount: 0
      }
    };
  }

  // Check ID format
  if (!message.id || !message.id.startsWith('msg-')) {
    return {
      valid: false,
      code: 'message_duplicate_id',
      message: `Invalid message ID format: ${message.id}`,
      metadata: {
        checkedAt,
        validatorVersion: '1.0.0',
        messageCount: 0
      }
    };
  }

  return {
    valid: true,
    code: 'session_valid',
    message: 'Message is valid',
    metadata: {
      checkedAt,
      validatorVersion: '1.0.0',
      messageCount: 0
    }
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export function isValidSession(session: ConversationSession): boolean {
  return validateSession(session).valid;
}

export function isValidMessage(message: ConversationMessage): boolean {
  return validateMessage(message).valid;
}

export function hasNoDuplicateIds(messages: readonly ConversationMessage[]): boolean {
  const ids = new Set<string>();
  for (const msg of messages) {
    if (ids.has(msg.id)) return false;
    ids.add(msg.id);
  }
  return true;
}

export function hasNoMutatedMessages(
  original: readonly ConversationMessage[],
  modified: readonly ConversationMessage[]
): boolean {
  if (original.length !== modified.length) return false;

  for (let i = 0; i < original.length; i++) {
    if (original[i].id !== modified[i].id) return false;
    if (original[i].content !== modified[i].content) return false;
    if (original[i].type !== modified[i].type) return false;
  }

  return true;
}
