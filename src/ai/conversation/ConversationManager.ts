/**
 * Conversation Manager — Main Orchestrator
 *
 * Coordinates conversation state, context, memory, and persistence.
 * This is the primary entry point for conversation management.
 * It does NOT generate responses — that's the LLM's job.
 */

import type { ConversationSession } from './ConversationSession.ts';
import type { ConversationMessage, MessageArtifact } from './ConversationMessage.ts';
import type { ConversationContextState, ConversationMemory, ConversationState } from './ConversationState.ts';
import type { ConversationPersistence } from './ConversationPersistence.ts';
import {
  createNewSession,
  updateSessionState,
  addMessageToSession,
  updateSessionContext,
  updateSessionSummary,
  updateSessionMetadata
} from './ConversationSession.ts';
import {
  createUserMessage,
  createAssistantMessage,
  createSystemMessage,
  createContextMessage,
  createGuardrailMessage
} from './ConversationMessage.ts';
import {
  syncContextFromRoute,
  syncLaboratoryContext,
  syncAssessmentContext,
  syncResearchContext,
  addBookmark,
  addNote
} from './ConversationContext.ts';
import {
  addImportantQuestion,
  addGeneratedQuiz,
  addGeneratedDiagram,
  addGeneratedComparison,
  extractMemoryFromMessages
} from './ConversationMemory.ts';
import { getHistoryOrdered, getLastUserMessage } from './ConversationHistory.ts';
import { generateSummary, updateConversationSummary } from './ConversationSummary.ts';
import { validateSession, type ConversationValidationResult } from './ConversationValidation.ts';
import { InMemoryPersistence } from './ConversationPersistence.ts';

// ============================================================================
// MANAGER CONFIG
// ============================================================================

export interface ConversationManagerConfig {
  readonly persistence?: ConversationPersistence;
  readonly autoSummarize?: boolean;
  readonly maxMessages?: number;
  readonly maxSummaryLength?: number;
}

// ============================================================================
// CONVERSATION MANAGER
// ============================================================================

export class ConversationManager {
  private persistence: ConversationPersistence;
  private currentSession: ConversationSession | null = null;
  private config: ConversationManagerConfig;

  constructor(config: ConversationManagerConfig = {}) {
    this.config = {
      autoSummarize: config.autoSummarize ?? true,
      maxMessages: config.maxMessages ?? 100,
      maxSummaryLength: config.maxSummaryLength ?? 500,
      ...config
    };
    this.persistence = config.persistence || new InMemoryPersistence();
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  startNewSession(
    mode: string = 'automatic',
    style: string = 'default'
  ): ConversationSession {
    this.currentSession = createNewSession(mode, style);
    this.persistence.save(this.currentSession);
    return this.currentSession;
  }

  getCurrentSession(): ConversationSession | null {
    return this.currentSession;
  }

  restoreSession(sessionId: string): ConversationSession | null {
    const session = this.persistence.load(sessionId);
    if (session) {
      this.currentSession = updateSessionState(session, 'restored');
      this.persistence.save(this.currentSession);
    }
    return this.currentSession;
  }

  pauseSession(): void {
    if (this.currentSession) {
      this.currentSession = updateSessionState(this.currentSession, 'paused');
      this.persistence.save(this.currentSession);
    }
  }

  finishSession(): void {
    if (this.currentSession) {
      this.currentSession = updateSessionState(this.currentSession, 'finished');
      this.persistence.save(this.currentSession);
    }
  }

  archiveSession(): void {
    if (this.currentSession) {
      this.currentSession = updateSessionState(this.currentSession, 'archived');
      this.persistence.save(this.currentSession);
    }
  }

  listSessions(): readonly string[] {
    return this.persistence.list();
  }

  deleteSession(sessionId: string): boolean {
    return this.persistence.delete(sessionId);
  }

  // ============================================================================
  // MESSAGE MANAGEMENT
  // ============================================================================

  appendUserMessage(content: string): ConversationMessage {
    if (!this.currentSession) {
      this.startNewSession();
    }

    const message = createUserMessage(content);
    this.currentSession = addMessageToSession(this.currentSession!, message);

    // Track important questions
    this.currentSession = addImportantQuestion(this.currentSession, content);

    // Auto-summarize
    if (this.config.autoSummarize) {
      this.currentSession = updateConversationSummary(this.currentSession);
    }

    this.persistence.save(this.currentSession);
    return message;
  }

  appendAssistantMessage(
    content: string,
    metadata: Record<string, unknown> = {}
  ): ConversationMessage {
    if (!this.currentSession) {
      this.startNewSession();
    }

    const message = createAssistantMessage(content, metadata as Partial<import('./ConversationMessage.ts').MessageMetadata>);
    this.currentSession = addMessageToSession(this.currentSession!, message);

    // Auto-summarize
    if (this.config.autoSummarize) {
      this.currentSession = updateConversationSummary(this.currentSession);
    }

    this.persistence.save(this.currentSession);
    return message;
  }

  appendSystemMessage(content: string): ConversationMessage {
    if (!this.currentSession) {
      this.startNewSession();
    }

    const message = createSystemMessage(content);
    this.currentSession = addMessageToSession(this.currentSession!, message);
    this.persistence.save(this.currentSession);
    return message;
  }

  appendContextMessage(content: string): ConversationMessage {
    if (!this.currentSession) {
      this.startNewSession();
    }

    const message = createContextMessage(content);
    this.currentSession = addMessageToSession(this.currentSession!, message);
    this.persistence.save(this.currentSession);
    return message;
  }

  appendGuardrailMessage(content: string): ConversationMessage {
    if (!this.currentSession) {
      this.startNewSession();
    }

    const message = createGuardrailMessage(content);
    this.currentSession = addMessageToSession(this.currentSession!, message);
    this.persistence.save(this.currentSession);
    return message;
  }

  appendMessageWithArtifacts(
    content: string,
    artifacts: readonly MessageArtifact[]
  ): ConversationMessage {
    if (!this.currentSession) {
      this.startNewSession();
    }

    const message: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: 'artifact',
      content,
      timestamp: new Date().toISOString(),
      metadata: {},
      artifacts
    };

    this.currentSession = addMessageToSession(this.currentSession!, message);

    // Track artifacts in memory
    for (const artifact of artifacts) {
      switch (artifact.type) {
        case 'quiz':
          this.currentSession = addGeneratedQuiz(this.currentSession, artifact.content);
          break;
        case 'diagram':
          this.currentSession = addGeneratedDiagram(this.currentSession, artifact.content);
          break;
        case 'comparison':
          this.currentSession = addGeneratedComparison(this.currentSession, artifact.content);
          break;
      }
    }

    this.persistence.save(this.currentSession);
    return message;
  }

  // ============================================================================
  // CONTEXT MANAGEMENT
  // ============================================================================

  updateContext(route: string, lessonInfo?: {
    lessonId: string;
    lessonTitle: string;
    moduleId: string;
    moduleTitle: string;
    pathId: string;
    pathTitle: string;
  }): void {
    if (!this.currentSession) return;

    this.currentSession = syncContextFromRoute(this.currentSession, {
      route,
      ...lessonInfo
    });

    this.persistence.save(this.currentSession);
  }

  setLaboratory(laboratoryId: string): void {
    if (!this.currentSession) return;
    this.currentSession = syncLaboratoryContext(this.currentSession, laboratoryId);
    this.persistence.save(this.currentSession);
  }

  setAssessment(assessmentId: string): void {
    if (!this.currentSession) return;
    this.currentSession = syncAssessmentContext(this.currentSession, assessmentId);
    this.persistence.save(this.currentSession);
  }

  setResearch(researchId: string): void {
    if (!this.currentSession) return;
    this.currentSession = syncResearchContext(this.currentSession, researchId);
    this.persistence.save(this.currentSession);
  }

  addBookmark(bookmarkId: string): void {
    if (!this.currentSession) return;
    this.currentSession = addBookmark(this.currentSession, bookmarkId);
    this.persistence.save(this.currentSession);
  }

  addNote(noteId: string): void {
    if (!this.currentSession) return;
    this.currentSession = addNote(this.currentSession, noteId);
    this.persistence.save(this.currentSession);
  }

  // ============================================================================
  // METADATA
  // ============================================================================

  updateProvider(provider: string, model: string): void {
    if (!this.currentSession) return;
    this.currentSession = updateSessionMetadata(this.currentSession, { provider, model });
    this.persistence.save(this.currentSession);
  }

  updateMode(mode: string): void {
    if (!this.currentSession) return;
    this.currentSession = updateSessionMetadata(this.currentSession, { mode });
    this.persistence.save(this.currentSession);
  }

  updateStyle(style: string): void {
    if (!this.currentSession) return;
    this.currentSession = updateSessionMetadata(this.currentSession, { style });
    this.persistence.save(this.currentSession);
  }

  // ============================================================================
  // QUERIES
  // ============================================================================

  getMessages(): readonly ConversationMessage[] {
    if (!this.currentSession) return [];
    return getHistoryOrdered(this.currentSession);
  }

  getMessageCount(): number {
    if (!this.currentSession) return 0;
    return this.currentSession.messages.length;
  }

  getContext(): ConversationContextState | null {
    return this.currentSession?.context || null;
  }

  getMemory(): ConversationMemory | null {
    return this.currentSession?.memory || null;
  }

  getSummary(): string {
    return this.currentSession?.summary || '';
  }

  getState(): ConversationState | null {
    return this.currentSession?.state || null;
  }

  getLastUserMessage(): ConversationMessage | null {
    if (!this.currentSession) return null;
    return getLastUserMessage(this.currentSession);
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  validate(): ConversationValidationResult | null {
    if (!this.currentSession) return null;
    return validateSession(this.currentSession);
  }

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  save(): boolean {
    if (!this.currentSession) return false;
    return this.persistence.save(this.currentSession);
  }

  load(sessionId: string): ConversationSession | null {
    return this.persistence.load(sessionId);
  }

  // ============================================================================
  // DEVELOPER MODE
  // ============================================================================

  getDeveloperInfo(): {
    sessionId: string;
    state: ConversationState;
    messageCount: number;
    summarySize: number;
    provider: string;
    model: string;
    mode: string;
    route: string;
  } | null {
    if (!this.currentSession) return null;

    return {
      sessionId: this.currentSession.id,
      state: this.currentSession.state,
      messageCount: this.currentSession.messages.length,
      summarySize: this.currentSession.summary.length,
      provider: this.currentSession.metadata.provider,
      model: this.currentSession.metadata.model,
      mode: this.currentSession.metadata.mode,
      route: this.currentSession.metadata.route
    };
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

let defaultManager: ConversationManager | null = null;

export function getConversationManager(): ConversationManager {
  if (!defaultManager) {
    defaultManager = new ConversationManager();
  }
  return defaultManager;
}

export function resetConversationManager(): void {
  defaultManager = null;
}
