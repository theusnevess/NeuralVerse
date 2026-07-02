/**
 * Conversation History — History Tracking
 *
 * Tracks and queries conversation message history.
 * History is deterministic — ordered by timestamp.
 */

import type { ConversationMessage } from './ConversationMessage.ts';
import type { ConversationSession } from './ConversationSession.ts';

// ============================================================================
// HISTORY QUERIES
// ============================================================================

export function getHistoryOrdered(
  session: ConversationSession
): readonly ConversationMessage[] {
  return [...session.messages].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeA - timeB;
  });
}

export function getRecentMessages(
  session: ConversationSession,
  count: number
): readonly ConversationMessage[] {
  const ordered = getHistoryOrdered(session);
  return ordered.slice(-count);
}

export function getMessagesByType(
  session: ConversationSession,
  type: ConversationMessage['type']
): readonly ConversationMessage[] {
  return session.messages.filter(m => m.type === type);
}

export function getMessageById(
  session: ConversationSession,
  id: string
): ConversationMessage | undefined {
  return session.messages.find(m => m.id === id);
}

export function getMessagesInTimeRange(
  session: ConversationSession,
  startTime: string,
  endTime: string
): readonly ConversationMessage[] {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  return session.messages.filter(m => {
    const msgTime = new Date(m.timestamp).getTime();
    return msgTime >= start && msgTime <= end;
  });
}

// ============================================================================
// HISTORY ANALYTICS
// ============================================================================

export function getConversationLength(session: ConversationSession): number {
  return session.messages.length;
}

export function getUserMessageCount(session: ConversationSession): number {
  return session.messages.filter(m => m.type === 'user').length;
}

export function getAssistantMessageCount(session: ConversationSession): number {
  return session.messages.filter(m => m.type === 'assistant').length;
}

export function getTotalContentLength(session: ConversationSession): number {
  return session.messages.reduce((total, m) => total + m.content.length, 0);
}

export function getAverageMessageLength(session: ConversationSession): number {
  const count = session.messages.length;
  if (count === 0) return 0;
  return getTotalContentLength(session) / count;
}

// ============================================================================
// HISTORY UTILITIES
// ============================================================================

export function findMessageByContent(
  session: ConversationSession,
  contentSubstring: string
): ConversationMessage | undefined {
  return session.messages.find(m => m.content.includes(contentSubstring));
}

export function getLastUserMessage(
  session: ConversationSession
): ConversationMessage | null {
  const userMessages = session.messages.filter(m => m.type === 'user');
  return userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
}

export function getLastAssistantMessage(
  session: ConversationSession
): ConversationMessage | null {
  const assistantMessages = session.messages.filter(m => m.type === 'assistant');
  return assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : null;
}

export function hasUserAskedQuestion(
  session: ConversationSession,
  question: string
): boolean {
  return session.messages.some(
    m => m.type === 'user' && m.content.toLowerCase().includes(question.toLowerCase())
  );
}
