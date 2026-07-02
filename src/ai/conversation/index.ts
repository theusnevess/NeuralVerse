/**
 * Conversation Module — Public API
 *
 * Conversation runtime for NeuralVerse AI Copilot.
 * Manages conversation state, context, memory, and persistence.
 */

// ============================================================================
// STATE
// ============================================================================
export {
  CANONICAL_CONVERSATION_STATES,
  CANONICAL_MESSAGE_TYPES,
  type ConversationState,
  type MessageType,
  type ConversationMetadata,
  type ConversationContextState,
  type LessonState,
  type ModuleState,
  type PathState,
  type RetrievalContextState,
  type ConversationMemory,
  DEFAULT_CONTEXT_STATE,
  DEFAULT_MEMORY
} from './ConversationState.ts';

// ============================================================================
// MESSAGE
// ============================================================================
export {
  type ConversationMessage,
  type MessageMetadata,
  type MessageArtifact,
  CANONICAL_ARTIFACT_TYPES,
  type ArtifactType,
  createUserMessage,
  createAssistantMessage,
  createSystemMessage,
  createDeveloperMessage,
  createContextMessage,
  createGuardrailMessage,
  createToolMessage,
  createArtifactMessage,
  createArtifact,
  isUserMessage,
  isAssistantMessage,
  isSystemMessage,
  hasArtifacts
} from './ConversationMessage.ts';

// ============================================================================
// SESSION
// ============================================================================
export {
  type ConversationSession,
  createNewSession,
  updateSessionState,
  addMessageToSession,
  updateSessionContext,
  updateSessionSummary,
  updateSessionMemory,
  updateSessionMetadata,
  getMessageCount,
  getUserMessages,
  getAssistantMessages,
  getLastMessage,
  getSessionDuration,
  isSessionActive
} from './ConversationSession.ts';

// ============================================================================
// CONTEXT
// ============================================================================
export {
  type RouteContext,
  syncContextFromRoute,
  syncLaboratoryContext,
  syncAssessmentContext,
  syncResearchContext,
  syncRetrievalContext,
  addBookmark,
  removeBookmark,
  addNote,
  removeNote,
  addSharedKnowledge,
  serializeContext,
  deserializeContext
} from './ConversationContext.ts';

// ============================================================================
// MEMORY
// ============================================================================
export {
  addImportantQuestion,
  addGeneratedSummary,
  addGeneratedQuiz,
  addGeneratedLaboratory,
  addGeneratedDiagram,
  addGeneratedComparison,
  addGeneratedExplanation,
  addReferenceCreated,
  addArtifactProduced,
  extractMemoryFromMessages,
  getMemorySize,
  hasArtifacts as hasMemoryArtifacts
} from './ConversationMemory.ts';

// ============================================================================
// HISTORY
// ============================================================================
export {
  getHistoryOrdered,
  getRecentMessages,
  getMessagesByType,
  getMessageById,
  getMessagesInTimeRange,
  getConversationLength,
  getUserMessageCount,
  getAssistantMessageCount,
  getTotalContentLength,
  getAverageMessageLength,
  findMessageByContent,
  getLastUserMessage,
  getLastAssistantMessage,
  hasUserAskedQuestion
} from './ConversationHistory.ts';

// ============================================================================
// SUMMARY
// ============================================================================
export {
  generateSummary,
  updateConversationSummary,
  getSummarySize,
  hasSummary,
  getSummaryExcerpt,
  compareSummaries,
  isSummaryStale
} from './ConversationSummary.ts';

// ============================================================================
// PERSISTENCE
// ============================================================================
export {
  type ConversationPersistence,
  InMemoryPersistence,
  LocalStoragePersistence,
  createPersistence
} from './ConversationPersistence.ts';

// ============================================================================
// VALIDATION
// ============================================================================
export {
  CANONICAL_VALIDATION_CODES,
  type ConversationValidationCode,
  type ConversationValidationResult,
  type ValidationMetadata,
  validateSession,
  validateMessage,
  isValidSession,
  isValidMessage,
  hasNoDuplicateIds,
  hasNoMutatedMessages
} from './ConversationValidation.ts';

// ============================================================================
// MANAGER
// ============================================================================
export {
  type ConversationManagerConfig,
  ConversationManager,
  getConversationManager,
  resetConversationManager
} from './ConversationManager.ts';
