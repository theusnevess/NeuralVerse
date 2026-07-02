/**
 * Educational Response Pipeline — Main Orchestrator
 *
 * Transforms a plain LLM answer into a complete NeuralVerse educational experience.
 * This layer is deterministic — it never calls the LLM.
 *
 * LLM answers. NeuralVerse teaches.
 */

import type { EducationalResponse, EducationalContext, EducationalResponseType, ConfidenceLevel, EducationalSectionRef, EducationalCardRef, EducationalActionRef } from './EducationalResponse.ts';
import { createEducationalResponse } from './EducationalResponse.ts';
import { generateSections, type EducationalSection } from './EducationalSections.ts';
import { generateCards, type EducationalCard } from './EducationalCards.ts';
import { generateActions, type EducationalAction } from './EducationalActions.ts';
import { generateMetadata, type EducationalMetadata } from './EducationalMetadata.ts';
import { validateEducationalResponse, type EducationalValidationResult } from './EducationalValidation.ts';

// ============================================================================
// PIPELINE
// ============================================================================

export class EducationalResponsePipeline {
  process(
    content: string,
    context: EducationalContext
  ): EducationalResponse {
    // 1. Classify response type
    const responseType = classifyResponseType(content, context);

    // 2. Detect content features
    const features = detectContentFeatures(content);

    // 3. Generate sections
    const sections = generateSections(content, responseType, {
      mode: context.mode,
      style: context.style,
      hasMathContent: features.hasMath,
      hasCodeContent: features.hasCode,
      hasResearchContent: features.hasResearch,
      hasVisualContent: features.hasVisual,
      hasLabContent: features.hasLab,
      hasAssessmentContent: features.hasAssessment
    });

    // 4. Generate cards
    const cards = generateCards(content, sections, {
      mode: context.mode,
      style: context.style,
      hasMathContent: features.hasMath,
      hasCodeContent: features.hasCode,
      hasResearchContent: features.hasResearch
    });

    // 5. Generate actions
    const actions = generateActions(content, responseType, {
      mode: context.mode,
      style: context.style,
      hasMathContent: features.hasMath,
      hasCodeContent: features.hasCode,
      hasLabContent: features.hasLab,
      hasAssessmentContent: features.hasAssessment
    });

    // 6. Build response
    let response = createEducationalResponse(content, responseType, context);

    // 7. Add sections, cards, actions
    response = {
      ...response,
      sections: sections as EducationalSectionRef[],
      cards: cards as EducationalCardRef[],
      actions: actions as EducationalActionRef[]
    };

    // 8. Generate metadata
    const metadata = generateMetadata(content, responseType, sections, cards, actions, {
      mode: context.mode,
      style: context.style,
      route: context.currentRoute,
      conversationId: context.conversationSummary
    });

    response = {
      ...response,
      metadata: metadata as EducationalResponse['metadata']
    };

    // 9. Generate summary
    const summary = generateEducationalSummary(content, sections);
    response = {
      ...response,
      summary
    };

    // 10. Generate next steps
    const nextSteps = generateNextSteps(content, context);
    response = {
      ...response,
      nextSteps
    };

    // 11. Determine confidence
    const confidence = determineConfidence(content, features);
    response = {
      ...response,
      confidence
    };

    return response;
  }

  validate(response: EducationalResponse): EducationalValidationResult {
    return validateEducationalResponse(response);
  }
}

// ============================================================================
// CLASSIFICATION (Deterministic)
// ============================================================================

function classifyResponseType(
  content: string,
  context: EducationalContext
): EducationalResponseType {
  const lowerContent = content.toLowerCase();

  // Check for specific patterns
  if (lowerContent.includes(' definition') || lowerContent.includes(' is a ') || lowerContent.includes(' means ')) {
    return 'definition';
  }

  if (lowerContent.includes(' vs ') || lowerContent.includes(' versus ') || lowerContent.includes(' compared to ')) {
    return 'comparison';
  }

  if (lowerContent.includes('used in') || lowerContent.includes('applied to') || lowerContent.includes('real-world')) {
    return 'application';
  }

  if (lowerContent.includes('study') || lowerContent.includes('research') || lowerContent.includes('paper')) {
    return 'research';
  }

  if (lowerContent.includes('practice') || lowerContent.includes('exercise') || lowerContent.includes('try')) {
    return 'practice';
  }

  if (lowerContent.includes('diagram') || lowerContent.includes('visualize') || lowerContent.includes('chart')) {
    return 'visual';
  }

  // Check context mode
  if (context.mode === 'research') return 'research';
  if (context.mode === 'practice') return 'practice';
  if (context.mode === 'visual') return 'visual';
  if (context.mode === 'engineering') return 'application';

  // Check content length for comprehensive
  if (content.length > 500) {
    return 'comprehensive';
  }

  return 'explanation';
}

function detectContentFeatures(content: string): {
  hasMath: boolean;
  hasCode: boolean;
  hasResearch: boolean;
  hasVisual: boolean;
  hasLab: boolean;
  hasAssessment: boolean;
} {
  return {
    hasMath: /\b(equation|formula|theorem|proof|derivative|integral|matrix|vector)\b/i.test(content) ||
             /\$.*?\$/g.test(content) ||
             /[=≤≥∑∫∂∇]/.test(content),
    hasCode: /```[\s\S]*?```/g.test(content) ||
             /\b(function|class|import|export|const|let|var|return)\b/.test(content),
    hasResearch: /\b(study|research|paper|journal|publication|finding|evidence)\b/i.test(content) ||
                 /\b(20[0-2]\d)\b/.test(content),
    hasVisual: /\b(diagram|flowchart|graph|chart|visualization|illustration)\b/i.test(content) ||
               /\b(visualize|imagine|picture|depict|represent)\b/i.test(content),
    hasLab: /\b(laboratory|experiment|hands-on|implement|code|simulate)\b/i.test(content),
    hasAssessment: /\b(quiz|test|question|practice|exercise|assessment)\b/i.test(content)
  };
}

function generateEducationalSummary(
  content: string,
  sections: readonly EducationalSection[]
): string {
  // Use explanation section if available
  const explanation = sections.find(s => s.type === 'explanation');
  if (explanation) {
    const sentences = explanation.content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length >= 2) {
      return `${sentences[0].trim()}. ${sentences[1].trim()}.`;
    }
    return sentences.length > 0 ? sentences[0].trim() + '.' : '';
  }

  // Fallback to first 2 sentences
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length >= 2) {
    return `${sentences[0].trim()}. ${sentences[1].trim()}.`;
  }
  return sentences.length > 0 ? sentences[0].trim() + '.' : '';
}

function generateNextSteps(
  content: string,
  context: EducationalContext
): readonly string[] {
  const steps: string[] = [];

  // Based on mode
  if (context.mode === 'teaching') {
    steps.push('Review the key concepts above');
    steps.push('Try the practice exercises');
  } else if (context.mode === 'research') {
    steps.push('Read the referenced papers');
    steps.push('Explore related research topics');
  } else if (context.mode === 'practice') {
    steps.push('Implement the code examples');
    steps.push('Complete the laboratory exercise');
  } else {
    steps.push('Explore related concepts');
    steps.push('Practice with examples');
  }

  return steps;
}

function determineConfidence(
  content: string,
  features: { hasMath: boolean; hasCode: boolean; hasResearch: boolean }
): ConfidenceLevel {
  // High confidence if has concrete evidence
  if (features.hasResearch && features.hasMath) return 'high';
  if (features.hasCode && features.hasMath) return 'high';

  // Medium confidence for explanations
  if (content.length > 200) return 'medium';

  // Low confidence for very short responses
  if (content.length < 100) return 'low';

  return 'medium';
}

// ============================================================================
// CONVENIENCE
// ============================================================================

let defaultPipeline: EducationalResponsePipeline | null = null;

export function getEducationalPipeline(): EducationalResponsePipeline {
  if (!defaultPipeline) {
    defaultPipeline = new EducationalResponsePipeline();
  }
  return defaultPipeline;
}

export function resetEducationalPipeline(): void {
  defaultPipeline = null;
}
