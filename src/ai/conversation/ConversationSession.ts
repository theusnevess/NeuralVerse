/**
 * Conversation Session — Session Management
 *
 * Manages individual conversation sessions.
 * Sessions are immutable data containers.
 */

import type {
  ConversationState,
  ConversationMetadata,
  ConversationContextState,
  ConversationMemory,
  DEFAULT_CONTEXT_STATE,
  DEFAULT_MEMORY
} from './ConversationState.ts';
import type { ConversationMessage } from './ConversationMessage.ts';

// ============================================================================
// SESSION INTERFACE
// ============================================================================

export interface ConversationSession {
  readonly id: string;
  readonly state: ConversationState;
  readonly messages: readonly ConversationMessage[];
  readonly context: ConversationContextState;
  readonly memory: ConversationMemory;
  readonly summary: string;
  readonly metadata: ConversationMetadata;
}

// ============================================================================
// SESSION FACTORY
// ============================================================================

let sessionCounter = 0;

export function createNewSession(
  mode: string = 'automatic',
  style: string = 'default'
): ConversationSession {
  sessionCounter++;
  const now = new Date().toISOString();

  return {
    id: `session-${Date.now()}-${sessionCounter}`,
    state: 'new',
    messages: [],
    context: {
      currentRoute: '',
      bookmarks: [],
      notes: [],
      sharedKnowledge: []
    },
    memory: {
      importantQuestions: [],
      generatedSummaries: [],
      generatedQuizzes: [],
      generatedLaboratories: [],
      generatedDiagrams: [],
      generatedComparisons: [],
      generatedExplanations: [],
      referencesCreated: [],
      artifactsProduced: []
    },
    summary: '',
    metadata: {
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      summarySize: 0,
      mode,
      style,
      provider: 'mock',
      model: 'mock-model',
      route: ''
    }
  };
}

// ============================================================================
// SESSION UPDATES (Immutable)
// ============================================================================

export function updateSessionState(
  session: ConversationSession,
  newState: ConversationState
): ConversationSession {
  return {
    ...session,
    state: newState,
    metadata: {
      ...session.metadata,
      updatedAt: new Date().toISOString()
    }
  };
}

export function addMessageToSession(
  session: ConversationSession,
  message: ConversationMessage
): ConversationSession {
  return {
    ...session,
    messages: [...session.messages, message],
    state: session.state === 'new' ? 'active' : session.state,
    metadata: {
      ...session.metadata,
      updatedAt: new Date().toISOString(),
      messageCount: session.messages.length + 1
    }
  };
}

export function updateSessionContext(
  session: ConversationSession,
  context: Partial<ConversationContextState>
): ConversationSession {
  return {
    ...session,
    context: {
      ...session.context,
      ...context
    },
    metadata: {
      ...session.metadata,
      updatedAt: new Date().toISOString()
    }
  };
}

export function updateSessionSummary(
  session: ConversationSession,
  summary: string
): ConversationSession {
  return {
    ...session,
    summary,
    metadata: {
      ...session.metadata,
      updatedAt: new Date().toISOString(),
      summarySize: summary.length
    }
  };
}

export function updateSessionMemory(
  session: ConversationSession,
  memory: Partial<ConversationMemory>
): ConversationSession {
  return {
    ...session,
    memory: {
      ...session.memory,
      ...memory
    },
    metadata: {
      ...session.metadata,
      updatedAt: new Date().toISOString()
    }
  };
}

export function updateSessionMetadata(
  session: ConversationSession,
  metadata: Partial<ConversationMetadata>
): ConversationSession {
  return {
    ...session,
    metadata: {
      ...session.metadata,
      ...metadata,
      updatedAt: new Date().toISOString()
    }
  };
}

// ============================================================================
// SESSION QUERIES
// ============================================================================

export function getMessageCount(session: ConversationSession): number {
  return session.messages.length;
}

export function getUserMessages(session: ConversationSession): readonly ConversationMessage[] {
  return session.messages.filter(m => m.type === 'user');
}

export function getAssistantMessages(session: ConversationSession): readonly ConversationMessage[] {
  return session.messages.filter(m => m.type === 'assistant');
}

export function getLastMessage(session: ConversationSession): ConversationMessage | null {
  return session.messages.length > 0 ? session.messages[session.messages.length - 1] : null;
}

export function getSessionDuration(session: ConversationSession): number {
  const created = new Date(session.metadata.createdAt).getTime();
  const updated = new Date(session.metadata.updatedAt).getTime();
  return updated - created;
}

export function isSessionActive(session: ConversationSession): boolean {
  return session.state === 'active' || session.state === 'restored';
}
