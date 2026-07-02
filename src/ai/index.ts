/**
 * AI Module — Public API
 *
 * LLM integration layer for NeuralVerse AI Copilot.
 * Isolated from D1-D10 deterministic agents.
 */

// ============================================================================
// LLM PROVIDER
// ============================================================================
export {
  // Types
  CANONICAL_LLM_PROVIDERS,
  CANONICAL_LLM_MODELS,
  CANONICAL_MESSAGE_ROLES,
  CANONICAL_FINISH_REASONS,
  CANONICAL_LLM_ERROR_CODES,
  type LLMProviderId,
  type LLMModelId,
  type MessageRole,
  type FinishReason,
  type LLMErrorCode,
  type LLMMessage,
  type LLMRequest,
  type LLMRequestMetadata,
  type LLMResponse,
  type LLMUsage,
  type LLMResponseMetadata,
  type LLMProviderConfig,
  type LLMProviderError,
  type LLMProvider,
  isLLMResponse,
  isLLMProviderError,
  isSupportedProvider,
  isSupportedModel,
  // Providers
  MockProvider,
  OpenAIProvider,
  LocalProvider,
  // Factory
  createProvider,
  createProviderFromEnvironment,
  getMockProvider,
  getProviderInfo
} from './llm-provider/index.ts';

// ============================================================================
// PROMPT COMPILER
// ============================================================================
export {
  CANONICAL_AI_MODES,
  CANONICAL_RESPONSE_STYLES,
  type AIMode,
  type ResponseStyle,
  type PromptCompilationContext,
  type LessonContext,
  type AgentOutput,
  type RetrievalContext,
  type GuardrailContext,
  type CompiledPrompt,
  type CompiledPromptMetadata,
  compilePrompt
} from './prompt-compiler/index.ts';

// ============================================================================
// RESPONSE VALIDATOR
// ============================================================================
export {
  CANONICAL_VALIDATION_CODES,
  type ValidationCode,
  type ResponseValidationResult,
  type ValidationMetadata,
  type ValidationConfig,
  validateResponse,
  isValidResponse,
  getSanitizedContent
} from './response-validator/index.ts';

// ============================================================================
// RESPONSE RENDERER
// ============================================================================
export {
  type CopilotResponsePayload,
  type CopilotResponseMetadata,
  type ResponseSection,
  renderCopilotResponse
} from './response-renderer/index.ts';

// ============================================================================
// COPILOT RUNTIME
// ============================================================================
export {
  type CopilotRequest,
  type CopilotRuntimeConfig,
  CopilotRuntime,
  getCopilotRuntime,
  resetCopilotRuntime
} from './copilot-runtime/index.ts';

// ============================================================================
// CONVERSATION
// ============================================================================
export {
  // State
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
  // Message
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
  hasArtifacts as hasMessageArtifacts,
  // Session
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
  isSessionActive,
  // Context
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
  deserializeContext,
  // Memory
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
  hasArtifacts as hasMemoryArtifacts,
  // History
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
  hasUserAskedQuestion,
  // Summary
  generateSummary,
  updateConversationSummary,
  getSummarySize,
  hasSummary,
  getSummaryExcerpt,
  compareSummaries,
  isSummaryStale,
  // Persistence
  type ConversationPersistence,
  InMemoryPersistence,
  LocalStoragePersistence,
  createPersistence,
  // Validation
  CANONICAL_VALIDATION_CODES as CONVERSATION_VALIDATION_CODES,
  type ConversationValidationCode,
  type ConversationValidationResult,
  type ValidationMetadata as ConversationValidationMetadata,
  validateSession,
  validateMessage,
  isValidSession,
  isValidMessage,
  hasNoDuplicateIds,
  hasNoMutatedMessages,
  // Manager
  type ConversationManagerConfig,
  ConversationManager,
  getConversationManager,
  resetConversationManager
} from './conversation/index.ts';

// ============================================================================
// EDUCATIONAL RESPONSE
// ============================================================================
export {
  // Response
  CANONICAL_EDUCATIONAL_RESPONSE_TYPES,
  CANONICAL_CONFIDENCE_LEVELS,
  type EducationalResponseType,
  type ConfidenceLevel,
  type EducationalResponse,
  type EducationalContext,
  type EducationalLessonContext,
  type EducationalModuleContext,
  type EducationalPathContext,
  type EducationalAgentOutput,
  type EducationalRetrievalContext,
  createEducationalResponse,
  // Sections
  CANONICAL_SECTION_TYPES,
  type SectionType,
  type EducationalSection,
  generateSections,
  // Cards
  CANONICAL_CARD_TYPES,
  type CardType,
  type EducationalCard,
  type CardMetadata,
  generateCards,
  // Actions
  CANONICAL_ACTION_TYPES,
  type ActionType,
  type EducationalAction,
  generateActions,
  getActionByType,
  getEnabledActions,
  getActionsByPriority,
  // Metadata
  type EducationalMetadata,
  generateMetadata,
  getMetadataSummary,
  isMetadataConsistent,
  // Validation
  CANONICAL_EDUCATIONAL_VALIDATION_CODES,
  type EducationalValidationCode,
  type EducationalValidationResult,
  type EducationalValidationMetadata,
  validateEducationalResponse,
  validateSection,
  validateCard,
  validateAction,
  isValidEducationalResponse,
  getValidationErrors,
  // Pipeline
  EducationalResponsePipeline,
  getEducationalPipeline,
  resetEducationalPipeline
} from './educational-response/index.ts';

// ============================================================================
// ORCHESTRATION
// ============================================================================
export {
  // Intent Classifier
  CANONICAL_INTENTS,
  type EducationalIntent,
  type IntentClassification,
  classifyIntent,
  hasIntent,
  getPrimaryIntent,
  // Agent Selector
  CANONICAL_AGENT_IDS,
  type AgentId,
  type AgentSelection,
  type AgentSelectionEntry,
  selectAgents,
  getAgentContribution,
  isAgentSelected,
  // Evidence Aggregator
  type EvidenceBundle,
  type AgentContribution,
  aggregateEvidence,
  // Confidence
  CANONICAL_CONFIDENCE_LEVELS as ORCHESTRATION_CONFIDENCE_LEVELS,
  type ConfidenceLevel as OrchestrationConfidenceLevel,
  type ConfidenceResult,
  type ConfidenceFactor,
  calculateConfidence,
  shouldAskClarification,
  getConfidenceSummary,
  // Orchestrator
  type OrchestrationRequest,
  type OrchestrationResult,
  type PromptContext,
  type OrchestrationMetadata,
  EducationalOrchestrator,
  getEducationalOrchestrator,
  resetEducationalOrchestrator
} from './orchestration/index.ts';
