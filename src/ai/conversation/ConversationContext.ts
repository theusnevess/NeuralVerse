/**
 * Conversation Context — Context Synchronization
 *
 * Automatically updates educational context from route and lesson data.
 * Context is deterministic — no LLM involvement.
 */

import type {
  ConversationContextState,
  LessonState,
  ModuleState,
  PathState,
  RetrievalContextState
} from './ConversationState.ts';
import type { ConversationSession } from './ConversationSession.ts';
import { updateSessionContext } from './ConversationSession.ts';

// ============================================================================
// CONTEXT SYNC
// ============================================================================

export interface RouteContext {
  readonly route: string;
  readonly lessonId?: string;
  readonly lessonTitle?: string;
  readonly moduleId?: string;
  readonly moduleTitle?: string;
  readonly pathId?: string;
  readonly pathTitle?: string;
  readonly difficulty?: string;
  readonly progress?: string;
}

interface MutableContextUpdate {
  currentRoute?: string;
  currentLesson?: LessonState;
  currentModule?: ModuleState;
  currentPath?: PathState;
  currentLaboratory?: string;
  currentAssessment?: string;
  currentResearch?: string;
  bookmarks?: readonly string[];
  notes?: readonly string[];
  retrievalContext?: RetrievalContextState;
  sharedKnowledge?: readonly string[];
}

export function syncContextFromRoute(
  session: ConversationSession,
  routeContext: RouteContext
): ConversationSession {
  const contextUpdate: MutableContextUpdate = {
    currentRoute: routeContext.route
  };

  if (routeContext.lessonId && routeContext.lessonTitle) {
    const lesson: LessonState = {
      lessonId: routeContext.lessonId,
      lessonTitle: routeContext.lessonTitle,
      moduleId: routeContext.moduleId || '',
      moduleTitle: routeContext.moduleTitle || '',
      pathId: routeContext.pathId || '',
      pathTitle: routeContext.pathTitle || '',
      difficulty: routeContext.difficulty,
      progress: routeContext.progress
    };
    contextUpdate.currentLesson = lesson;
  }

  if (routeContext.moduleId && routeContext.moduleTitle) {
    const moduleState: ModuleState = {
      moduleId: routeContext.moduleId,
      moduleTitle: routeContext.moduleTitle,
      pathId: routeContext.pathId || '',
      pathTitle: routeContext.pathTitle || '',
      lessonCount: 0,
      completedLessons: 0
    };
    contextUpdate.currentModule = moduleState;
  }

  if (routeContext.pathId && routeContext.pathTitle) {
    const path: PathState = {
      pathId: routeContext.pathId,
      pathTitle: routeContext.pathTitle,
      moduleCount: 0,
      completedModules: 0
    };
    contextUpdate.currentPath = path;
  }

  return updateSessionContext(session, contextUpdate as Partial<import('./ConversationState.ts').ConversationContextState>);
}

export function syncLaboratoryContext(
  session: ConversationSession,
  laboratoryId: string
): ConversationSession {
  return updateSessionContext(session, {
    currentLaboratory: laboratoryId
  });
}

export function syncAssessmentContext(
  session: ConversationSession,
  assessmentId: string
): ConversationSession {
  return updateSessionContext(session, {
    currentAssessment: assessmentId
  });
}

export function syncResearchContext(
  session: ConversationSession,
  researchId: string
): ConversationSession {
  return updateSessionContext(session, {
    currentResearch: researchId
  });
}

export function syncRetrievalContext(
  session: ConversationSession,
  retrieval: RetrievalContextState
): ConversationSession {
  return updateSessionContext(session, {
    retrievalContext: retrieval
  });
}

export function addBookmark(
  session: ConversationSession,
  bookmarkId: string
): ConversationSession {
  const bookmarks = [...session.context.bookmarks];
  if (!bookmarks.includes(bookmarkId)) {
    bookmarks.push(bookmarkId);
  }
  return updateSessionContext(session, { bookmarks });
}

export function removeBookmark(
  session: ConversationSession,
  bookmarkId: string
): ConversationSession {
  const bookmarks = session.context.bookmarks.filter(b => b !== bookmarkId);
  return updateSessionContext(session, { bookmarks });
}

export function addNote(
  session: ConversationSession,
  noteId: string
): ConversationSession {
  const notes = [...session.context.notes];
  if (!notes.includes(noteId)) {
    notes.push(noteId);
  }
  return updateSessionContext(session, { notes });
}

export function removeNote(
  session: ConversationSession,
  noteId: string
): ConversationSession {
  const notes = session.context.notes.filter(n => n !== noteId);
  return updateSessionContext(session, { notes });
}

export function addSharedKnowledge(
  session: ConversationSession,
  knowledgeId: string
): ConversationSession {
  const sharedKnowledge = [...session.context.sharedKnowledge];
  if (!sharedKnowledge.includes(knowledgeId)) {
    sharedKnowledge.push(knowledgeId);
  }
  return updateSessionContext(session, { sharedKnowledge });
}

// ============================================================================
// CONTEXT SERIALIZATION
// ============================================================================

export function serializeContext(context: ConversationContextState): string {
  return JSON.stringify(context);
}

export function deserializeContext(data: string): ConversationContextState {
  try {
    const parsed = JSON.parse(data);
    return {
      currentRoute: parsed.currentRoute || '',
      currentLesson: parsed.currentLesson,
      currentModule: parsed.currentModule,
      currentPath: parsed.currentPath,
      currentLaboratory: parsed.currentLaboratory,
      currentAssessment: parsed.currentAssessment,
      currentResearch: parsed.currentResearch,
      bookmarks: parsed.bookmarks || [],
      notes: parsed.notes || [],
      retrievalContext: parsed.retrievalContext,
      sharedKnowledge: parsed.sharedKnowledge || []
    };
  } catch {
    return {
      currentRoute: '',
      bookmarks: [],
      notes: [],
      sharedKnowledge: []
    };
  }
}
