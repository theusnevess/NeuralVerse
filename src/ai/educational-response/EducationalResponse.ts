/**
 * Educational Response — Main Response Type
 *
 * Defines the structured educational response that transforms
 * a plain LLM answer into a complete learning experience.
 */

import type { AIMode, ResponseStyle } from '../prompt-compiler/PromptCompiler.ts';

// ============================================================================
// EDUCATIONAL RESPONSE
// ============================================================================

export interface EducationalResponse {
  readonly id: string;
  readonly type: EducationalResponseType;
  readonly content: string;
  readonly sections: readonly EducationalSectionRef[];
  readonly cards: readonly EducationalCardRef[];
  readonly actions: readonly EducationalActionRef[];
  readonly metadata: EducationalMetadataRef;
  readonly summary: string;
  readonly nextSteps: readonly string[];
  readonly confidence: ConfidenceLevel;
}

export const CANONICAL_EDUCATIONAL_RESPONSE_TYPES = [
  'explanation',
  'definition',
  'comparison',
  'application',
  'research',
  'practice',
  'visual',
  'comprehensive'
] as const;

export type EducationalResponseType = (typeof CANONICAL_EDUCATIONAL_RESPONSE_TYPES)[number];

export const CANONICAL_CONFIDENCE_LEVELS = [
  'high',
  'medium',
  'low',
  'uncertain'
] as const;

export type ConfidenceLevel = (typeof CANONICAL_CONFIDENCE_LEVELS)[number];

// ============================================================================
// REFERENCE TYPES (to avoid circular deps)
// ============================================================================

export interface EducationalSectionRef {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly content: string;
  readonly priority: number;
  readonly expandable: boolean;
  readonly defaultExpanded: boolean;
}

export interface EducationalCardRef {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly content: string;
  readonly metadata: {
    readonly priority: number;
    readonly category: string;
    readonly tags: readonly string[];
    readonly relatedConcepts: readonly string[];
  };
  readonly expandable: boolean;
}

export interface EducationalActionRef {
  readonly id: string;
  readonly type: string;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
  readonly priority: number;
  readonly enabled: boolean;
}

export interface EducationalMetadataRef {
  readonly responseType: string;
  readonly estimatedReadingTime: number;
  readonly difficulty: string;
  readonly mode: string;
  readonly style: string;
  readonly route: string;
  readonly createdAt: string;
  readonly pipelineVersion: string;
  readonly sectionCount: number;
  readonly cardCount: number;
  readonly actionCount: number;
  readonly contentLength: number;
  readonly hasMath: boolean;
  readonly hasCode: boolean;
  readonly hasResearch: boolean;
  readonly hasVisual: boolean;
  readonly conversationLinkage?: string;
}

// ============================================================================
// RESPONSE CONTEXT
// ============================================================================

export interface EducationalContext {
  readonly userQuery: string;
  readonly mode: AIMode;
  readonly style: ResponseStyle;
  readonly currentRoute: string;
  readonly currentLesson?: EducationalLessonContext;
  readonly currentModule?: EducationalModuleContext;
  readonly currentPath?: EducationalPathContext;
  readonly agentOutputs: readonly EducationalAgentOutput[];
  readonly retrievalContext?: EducationalRetrievalContext;
  readonly conversationSummary?: string;
  readonly developerMode: boolean;
}

export interface EducationalLessonContext {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly moduleId: string;
  readonly moduleTitle: string;
  readonly pathId: string;
  readonly pathTitle: string;
  readonly difficulty?: string;
}

export interface EducationalModuleContext {
  readonly moduleId: string;
  readonly moduleTitle: string;
  readonly pathId: string;
  readonly pathTitle: string;
}

export interface EducationalPathContext {
  readonly pathId: string;
  readonly pathTitle: string;
}

export interface EducationalAgentOutput {
  readonly agentId: string;
  readonly agentName: string;
  readonly output: string;
  readonly confidence: string;
}

export interface EducationalRetrievalContext {
  readonly relevantConcepts: readonly string[];
  readonly relatedLessons: readonly string[];
  readonly knowledgeGraphEdges: readonly string[];
}

// ============================================================================
// FACTORY
// ============================================================================

let responseCounter = 0;

export function createEducationalResponse(
  content: string,
  type: EducationalResponseType,
  context: EducationalContext
): EducationalResponse {
  responseCounter++;
  return {
    id: `edu-response-${Date.now()}-${responseCounter}`,
    type,
    content,
    sections: [],
    cards: [],
    actions: [],
    metadata: {
      responseType: type,
      estimatedReadingTime: Math.ceil(content.split(/\s+/).length / 200),
      difficulty: context.currentLesson?.difficulty || 'intermediate',
      mode: context.mode,
      style: context.style,
      route: context.currentRoute,
      createdAt: new Date().toISOString(),
      pipelineVersion: '1.0.0',
      sectionCount: 0,
      cardCount: 0,
      actionCount: 0,
      contentLength: content.length,
      hasMath: false,
      hasCode: false,
      hasResearch: false,
      hasVisual: false
    },
    summary: '',
    nextSteps: [],
    confidence: 'medium'
  };
}
