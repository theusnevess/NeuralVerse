/**
 * Conversation State — Canonical Types
 *
 * Defines conversation states and metadata types.
 * Conversation belongs to NeuralVerse. Generation belongs to the LLM.
 */

// ============================================================================
// CONVERSATION STATES
// ============================================================================

export const CANONICAL_CONVERSATION_STATES = [
  'new',
  'active',
  'paused',
  'restored',
  'finished',
  'archived'
] as const;

export type ConversationState = (typeof CANONICAL_CONVERSATION_STATES)[number];

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export const CANONICAL_MESSAGE_TYPES = [
  'system',
  'user',
  'assistant',
  'developer',
  'tool',
  'context',
  'guardrail',
  'artifact'
] as const;

export type MessageType = (typeof CANONICAL_MESSAGE_TYPES)[number];

// ============================================================================
// CONVERSATION METADATA
// ============================================================================

export interface ConversationMetadata {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly messageCount: number;
  readonly summarySize: number;
  readonly mode: string;
  readonly style: string;
  readonly provider: string;
  readonly model: string;
  readonly route: string;
}

// ============================================================================
// CONVERSATION CONTEXT
// ============================================================================

export interface ConversationContextState {
  readonly currentRoute: string;
  readonly currentLesson?: LessonState;
  readonly currentModule?: ModuleState;
  readonly currentPath?: PathState;
  readonly currentLaboratory?: string;
  readonly currentAssessment?: string;
  readonly currentResearch?: string;
  readonly bookmarks: readonly string[];
  readonly notes: readonly string[];
  readonly retrievalContext?: RetrievalContextState;
  readonly sharedKnowledge: readonly string[];
}

export interface LessonState {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly moduleId: string;
  readonly moduleTitle: string;
  readonly pathId: string;
  readonly pathTitle: string;
  readonly difficulty?: string;
  readonly progress?: string;
}

export interface ModuleState {
  readonly moduleId: string;
  readonly moduleTitle: string;
  readonly pathId: string;
  readonly pathTitle: string;
  readonly lessonCount: number;
  readonly completedLessons: number;
}

export interface PathState {
  readonly pathId: string;
  readonly pathTitle: string;
  readonly moduleCount: number;
  readonly completedModules: number;
}

export interface RetrievalContextState {
  readonly relevantConcepts: readonly string[];
  readonly relatedLessons: readonly string[];
  readonly knowledgeGraphEdges: readonly string[];
}

// ============================================================================
// CONVERSATION MEMORY
// ============================================================================

export interface ConversationMemory {
  readonly importantQuestions: readonly string[];
  readonly generatedSummaries: readonly string[];
  readonly generatedQuizzes: readonly string[];
  readonly generatedLaboratories: readonly string[];
  readonly generatedDiagrams: readonly string[];
  readonly generatedComparisons: readonly string[];
  readonly generatedExplanations: readonly string[];
  readonly referencesCreated: readonly string[];
  readonly artifactsProduced: readonly string[];
}

// ============================================================================
// DEFAULTS
// ============================================================================

export const DEFAULT_CONTEXT_STATE: ConversationContextState = {
  currentRoute: '',
  bookmarks: [],
  notes: [],
  sharedKnowledge: []
};

export const DEFAULT_MEMORY: ConversationMemory = {
  importantQuestions: [],
  generatedSummaries: [],
  generatedQuizzes: [],
  generatedLaboratories: [],
  generatedDiagrams: [],
  generatedComparisons: [],
  generatedExplanations: [],
  referencesCreated: [],
  artifactsProduced: []
};
