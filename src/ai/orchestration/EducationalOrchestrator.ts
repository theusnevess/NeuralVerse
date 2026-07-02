/**
 * Educational Orchestrator — Main Pipeline Orchestrator
 *
 * Coordinates intent classification, agent selection, evidence aggregation,
 * and prompt compilation. This is the entry point for educational reasoning.
 *
 * The LLM must stop behaving like a generic chatbot and instead behave
 * like the NeuralVerse educational engine.
 */

import type { EducationalIntent, IntentClassification } from './IntentClassifier.ts';
import { classifyIntent } from './IntentClassifier.ts';
import type { AgentSelection, AgentId } from './AgentSelector.ts';
import { selectAgents } from './AgentSelector.ts';
import type { EvidenceBundle } from './EvidenceAggregator.ts';
import { aggregateEvidence } from './EvidenceAggregator.ts';
import type { ConfidenceResult } from './EducationalConfidence.ts';
import { calculateConfidence, shouldAskClarification } from './EducationalConfidence.ts';

// ============================================================================
// ORCHESTRATOR TYPES
// ============================================================================

export interface OrchestrationRequest {
  readonly query: string;
  readonly mode: string;
  readonly style: string;
  readonly currentRoute: string;
  readonly currentLesson?: string;
  readonly currentModule?: string;
  readonly currentPath?: string;
  readonly conversationSummary?: string;
  readonly conversationHistory?: readonly string[];
  readonly retrievalContext?: {
    readonly relevantConcepts?: readonly string[];
    readonly relatedLessons?: readonly string[];
  };
  readonly developerMode: boolean;
}

export interface OrchestrationResult {
  readonly requestId: string;
  readonly intent: IntentClassification;
  readonly agentSelection: AgentSelection;
  readonly evidence: EvidenceBundle;
  readonly confidence: ConfidenceResult;
  readonly shouldClarify: boolean;
  readonly clarificationQuestion?: string;
  readonly promptContext: PromptContext;
  readonly metadata: OrchestrationMetadata;
}

export interface PromptContext {
  readonly userQuery: string;
  readonly intents: readonly EducationalIntent[];
  readonly selectedAgents: readonly AgentId[];
  readonly evidenceSummary: string;
  readonly conversationContext: string;
  readonly learningContext: string;
  readonly confidenceSummary: string;
}

export interface OrchestrationMetadata {
  readonly orchestrationId: string;
  readonly timestamp: string;
  readonly durationMs: number;
  readonly intentCount: number;
  readonly agentCount: number;
  readonly evidenceCompleteness: number;
  readonly confidenceLevel: string;
}

// ============================================================================
// EDUCATIONAL ORCHESTRATOR
// ============================================================================

export class EducationalOrchestrator {
  orchestrate(request: OrchestrationRequest): OrchestrationResult {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // 1. Classify intent
    const intent = classifyIntent(request.query);

    // 2. Select agents
    const agentSelection = selectAgents(intent.intents, {
      currentRoute: request.currentRoute,
      currentLesson: request.currentLesson,
      conversationHistory: request.conversationHistory
    });

    // 3. Aggregate evidence
    const evidence = aggregateEvidence(agentSelection, {
      userQuery: request.query,
      currentRoute: request.currentRoute,
      currentLesson: request.currentLesson,
      retrievalContext: request.retrievalContext
    });

    // 4. Calculate confidence
    const confidence = calculateConfidence(evidence, request.query);

    // 5. Check if clarification needed
    const shouldClarify = shouldAskClarification(confidence);
    const clarificationQuestion = shouldClarify
      ? this.generateClarificationQuestion(request.query, intent)
      : undefined;

    // 6. Build prompt context
    const promptContext = this.buildPromptContext(
      request,
      intent,
      agentSelection,
      evidence,
      confidence
    );

    // 7. Generate metadata
    const metadata: OrchestrationMetadata = {
      orchestrationId: requestId,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      intentCount: intent.intents.length,
      agentCount: agentSelection.agents.length,
      evidenceCompleteness: evidence.completeness,
      confidenceLevel: confidence.overall
    };

    return {
      requestId,
      intent,
      agentSelection,
      evidence,
      confidence,
      shouldClarify,
      clarificationQuestion,
      promptContext,
      metadata
    };
  }

  // ============================================================================
  // PROMPT CONTEXT BUILDER
  // ============================================================================

  private buildPromptContext(
    request: OrchestrationRequest,
    intent: { intents: readonly EducationalIntent[]; primaryIntent: EducationalIntent },
    agentSelection: AgentSelection,
    evidence: EvidenceBundle,
    confidence: ConfidenceResult
  ): PromptContext {
    // Build evidence summary
    const evidenceParts: string[] = [];
    if (evidence.conceptDefinitions.length > 0) {
      evidenceParts.push(`Concepts: ${evidence.conceptDefinitions.join('; ')}`);
    }
    if (evidence.applications.length > 0) {
      evidenceParts.push(`Applications: ${evidence.applications.join('; ')}`);
    }
    if (evidence.researchEvidence.length > 0) {
      evidenceParts.push(`Research: ${evidence.researchEvidence.join('; ')}`);
    }
    if (evidence.examples.length > 0) {
      evidenceParts.push(`Examples: ${evidence.examples.join('; ')}`);
    }

    // Build conversation context
    const conversationParts: string[] = [];
    if (request.conversationSummary) {
      conversationParts.push(`Summary: ${request.conversationSummary}`);
    }
    if (request.conversationHistory && request.conversationHistory.length > 0) {
      conversationParts.push(`Recent: ${request.conversationHistory.slice(-3).join('; ')}`);
    }

    // Build learning context
    const learningParts: string[] = [];
    if (request.currentLesson) {
      learningParts.push(`Lesson: ${request.currentLesson}`);
    }
    if (request.currentModule) {
      learningParts.push(`Module: ${request.currentModule}`);
    }
    if (request.currentPath) {
      learningParts.push(`Path: ${request.currentPath}`);
    }

    return {
      userQuery: request.query,
      intents: intent.intents,
      selectedAgents: agentSelection.agents.map(a => a.agentId),
      evidenceSummary: evidenceParts.join('\n') || 'No specific evidence available.',
      conversationContext: conversationParts.join('\n') || 'No conversation history.',
      learningContext: learningParts.join('\n') || 'No learning context available.',
      confidenceSummary: `Confidence: ${confidence.overall} (${Math.round(confidence.evidenceCompleteness * 100)}% evidence)`
    };
  }

  // ============================================================================
  // CLARIFICATION
  // ============================================================================

  private generateClarificationQuestion(
    query: string,
    intent: { intents: readonly EducationalIntent[]; primaryIntent: EducationalIntent }
  ): string {
    const primaryIntent = intent.primaryIntent;

    switch (primaryIntent) {
      case 'explain':
        return `I want to make sure I explain this correctly. Could you tell me more about what specific aspect of "${query}" you'd like me to focus on?`;
      case 'compare':
        return `To provide a meaningful comparison, could you clarify which specific concepts or approaches you'd like me to compare?`;
      case 'solve':
        return `I want to solve this accurately. Could you provide more details about the specific problem or equation you're working with?`;
      case 'visualize':
        return `To create the best visualization, could you tell me what aspect you'd like to see visualized?`;
      case 'practice':
        return `I can help you practice. Could you specify what type of exercise you'd prefer: coding, problem-solving, or conceptual review?`;
      case 'research':
        return `To find relevant research, could you clarify the specific topic or question you're researching?`;
      case 'apply':
        return `To show real-world applications, could you tell me what domain or industry you're interested in?`;
      default:
        return `I want to help you effectively. Could you provide a bit more detail about what you're looking for?`;
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  private generateRequestId(): string {
    return `orch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

let defaultOrchestrator: EducationalOrchestrator | null = null;

export function getEducationalOrchestrator(): EducationalOrchestrator {
  if (!defaultOrchestrator) {
    defaultOrchestrator = new EducationalOrchestrator();
  }
  return defaultOrchestrator;
}

export function resetEducationalOrchestrator(): void {
  defaultOrchestrator = null;
}
