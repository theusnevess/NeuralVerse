/**
 * Educational Metadata — Metadata Generation
 *
 * Generates educational metadata for the response.
 * Metadata is deterministic — extracted from context and content.
 */

import type { AIMode, ResponseStyle } from '../prompt-compiler/PromptCompiler.ts';
import type { EducationalResponseType, ConfidenceLevel } from './EducationalResponse.ts';
import type { EducationalSection } from './EducationalSections.ts';
import type { EducationalCard } from './EducationalCards.ts';
import type { EducationalAction } from './EducationalActions.ts';

// ============================================================================
// METADATA TYPES
// ============================================================================

export interface EducationalMetadata {
  readonly responseType: EducationalResponseType;
  readonly estimatedReadingTime: number;
  readonly difficulty: string;
  readonly mode: AIMode;
  readonly style: ResponseStyle;
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
// METADATA GENERATION
// ============================================================================

export function generateMetadata(
  content: string,
  responseType: EducationalResponseType,
  sections: readonly EducationalSection[],
  cards: readonly EducationalCard[],
  actions: readonly EducationalAction[],
  context: {
    mode: AIMode;
    style: ResponseStyle;
    route: string;
    conversationId?: string;
  }
): EducationalMetadata {
  return {
    responseType,
    estimatedReadingTime: estimateReadingTime(content),
    difficulty: detectDifficulty(content),
    mode: context.mode,
    style: context.style,
    route: context.route,
    createdAt: new Date().toISOString(),
    pipelineVersion: '1.0.0',
    sectionCount: sections.length,
    cardCount: cards.length,
    actionCount: actions.length,
    contentLength: content.length,
    hasMath: detectMathContent(content),
    hasCode: detectCodeContent(content),
    hasResearch: detectResearchContent(content),
    hasVisual: detectVisualContent(content),
    conversationLinkage: context.conversationId
  };
}

// ============================================================================
// DETECTION FUNCTIONS (Deterministic)
// ============================================================================

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

function detectDifficulty(content: string): string {
  const advancedTerms = ['theorem', 'derivative', 'integral', 'algorithm', 'complexity', 'optimization'];
  const beginnerTerms = ['simple', 'basic', 'introduction', 'overview', 'getting started'];

  const lowerContent = content.toLowerCase();

  if (advancedTerms.some(term => lowerContent.includes(term))) {
    return 'advanced';
  }
  if (beginnerTerms.some(term => lowerContent.includes(term))) {
    return 'beginner';
  }
  return 'intermediate';
}

function detectMathContent(content: string): boolean {
  const patterns = [
    /\$.*?\$/g,
    /\b(equation|formula|theorem|proof|derivative|integral|matrix|vector)\b/i,
    /\b(=|≤|≥|∑|∫|∂|∇)\b/
  ];
  return patterns.some(p => p.test(content));
}

function detectCodeContent(content: string): boolean {
  const patterns = [
    /```[\s\S]*?```/,
    /\b(function|class|import|export|const|let|var|return)\b/,
    /\b(implement|code|algorithm|function|method)\b/i
  ];
  return patterns.some(p => p.test(content));
}

function detectResearchContent(content: string): boolean {
  const patterns = [
    /\b(study|research|paper|journal|publication|finding|evidence)\b/i,
    /\b(20[0-2]\d)\b/
  ];
  return patterns.some(p => p.test(content));
}

function detectVisualContent(content: string): boolean {
  const patterns = [
    /\b(diagram|flowchart|graph|chart|visualization|illustration)\b/i,
    /\b(visualize|imagine|picture|depict|represent)\b/i
  ];
  return patterns.some(p => p.test(content));
}

// ============================================================================
// METADATA UTILITIES
// ============================================================================

export function getMetadataSummary(metadata: EducationalMetadata): string {
  return [
    `Type: ${metadata.responseType}`,
    `Difficulty: ${metadata.difficulty}`,
    `Reading: ${metadata.estimatedReadingTime} min`,
    `Sections: ${metadata.sectionCount}`,
    `Cards: ${metadata.cardCount}`,
    `Actions: ${metadata.actionCount}`
  ].join(' | ');
}

export function isMetadataConsistent(metadata: EducationalMetadata): boolean {
  return (
    metadata.sectionCount >= 0 &&
    metadata.cardCount >= 0 &&
    metadata.actionCount >= 0 &&
    metadata.contentLength >= 0 &&
    metadata.estimatedReadingTime >= 0
  );
}
