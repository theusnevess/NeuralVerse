/**
 * Copilot Runtime — Orchestrates LLM Integration
 *
 * Coordinates the full pipeline from UI request to rendered response.
 * D1-D10 agents remain deterministic. LLM layer is separate.
 *
 * Updated to integrate EducationalOrchestrator for:
 * - Intent classification
 * - Dynamic agent selection
 * - Evidence aggregation
 * - Confidence calculation
 * - Clarification flow
 */

import type { LLMProvider, LLMRequest, LLMResponse, LLMProviderError } from '../llm-provider/LLMProvider.ts';
import { isLLMResponse } from '../llm-provider/LLMProvider.ts';
import { createProviderFromEnvironment } from '../llm-provider/ProviderFactory.ts';
import type { PromptCompilationContext, AIMode, ResponseStyle, GuardrailContext } from '../prompt-compiler/PromptCompiler.ts';
import { compilePrompt } from '../prompt-compiler/PromptCompiler.ts';
import { validateResponse } from '../response-validator/ResponseValidator.ts';
import type { ResponseValidationResult } from '../response-validator/ResponseValidator.ts';
import { renderCopilotResponse } from '../response-renderer/ResponseRenderer.ts';
import type { CopilotResponsePayload } from '../response-renderer/ResponseRenderer.ts';
import { EducationalOrchestrator, getEducationalOrchestrator } from '../orchestration/EducationalOrchestrator.ts';
import type { OrchestrationResult } from '../orchestration/EducationalOrchestrator.ts';

// ============================================================================
// RUNTIME TYPES
// ============================================================================

export interface CopilotRequest {
  readonly query: string;
  readonly mode: AIMode;
  readonly style: ResponseStyle;
  readonly currentRoute: string;
  readonly currentLesson?: PromptCompilationContext['currentLesson'];
  readonly currentModule?: string;
  readonly currentPath?: string;
  readonly agentOutputs?: PromptCompilationContext['agentOutputs'];
  readonly retrievalContext?: PromptCompilationContext['retrievalContext'];
  readonly guardrails?: PromptCompilationContext['guardrails'];
  readonly developerMode: boolean;
  readonly conversationSummary?: string;
  readonly conversationHistory?: readonly string[];
}

export interface CopilotRuntimeConfig {
  readonly provider?: LLMProvider;
  readonly defaultMode: AIMode;
  readonly defaultStyle: ResponseStyle;
  readonly validationConfig?: Parameters<typeof validateResponse>[1];
  readonly orchestrator?: EducationalOrchestrator;
}

// ============================================================================
// CLARIFICATION RESPONSE
// ============================================================================

export interface ClarificationResponse {
  readonly type: 'clarification';
  readonly clarificationQuestion: string;
  readonly missingEvidence: readonly string[];
  readonly suggestedNextPrompts: readonly string[];
  readonly metadata: ClarificationMetadata;
}

export interface ClarificationMetadata {
  readonly requestId: string;
  readonly confidenceLevel: string;
  readonly confidenceScore: number;
  readonly intents: readonly string[];
  readonly timestamp: string;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_GUARDRAILS: GuardrailContext = {
  forbiddenTopics: [],
  requiredDisclaimers: [],
  governanceLevel: 'standard'
};

// ============================================================================
// COPILOT RUNTIME
// ============================================================================

export class CopilotRuntime {
  private provider: LLMProvider;
  private config: CopilotRuntimeConfig;
  private orchestrator: EducationalOrchestrator;

  constructor(config?: Partial<CopilotRuntimeConfig>) {
    this.config = {
      defaultMode: config?.defaultMode || 'automatic',
      defaultStyle: config?.defaultStyle || 'default',
      ...config
    };
    this.provider = config?.provider || createProviderFromEnvironment();
    this.orchestrator = config?.orchestrator || getEducationalOrchestrator();
  }

  async processRequest(request: CopilotRequest): Promise<CopilotResponsePayload | ClarificationResponse> {
    const requestId = this.generateRequestId();

    // 1. Run orchestration pipeline
    const orchestrationResult = this.orchestrator.orchestrate({
      query: request.query,
      mode: request.mode || this.config.defaultMode,
      style: request.style || this.config.defaultStyle,
      currentRoute: request.currentRoute,
      currentLesson: request.currentLesson?.lessonTitle,
      currentModule: request.currentModule,
      currentPath: request.currentPath,
      conversationSummary: request.conversationSummary,
      conversationHistory: request.conversationHistory,
      retrievalContext: request.retrievalContext ? {
        relevantConcepts: request.retrievalContext.relevantConcepts,
        relatedLessons: request.retrievalContext.relatedLessons
      } : undefined,
      developerMode: request.developerMode
    });

    // 2. Check if clarification is needed
    if (orchestrationResult.shouldClarify) {
      return this.createClarificationResponse(requestId, orchestrationResult);
    }

    // 3. Build prompt compilation context with orchestration data
    const compilationContext: PromptCompilationContext = {
      userQuery: request.query,
      mode: request.mode || this.config.defaultMode,
      style: request.style || this.config.defaultStyle,
      currentRoute: request.currentRoute,
      currentLesson: request.currentLesson,
      agentOutputs: request.agentOutputs || [],
      retrievalContext: request.retrievalContext,
      guardrails: request.guardrails || DEFAULT_GUARDRAILS,
      developerMode: request.developerMode,
      requestId,
      orchestrationIntents: orchestrationResult.intent.intents,
      orchestrationAgents: orchestrationResult.agentSelection.agents.map(a => a.agentId),
      orchestrationEvidence: orchestrationResult.evidence,
      orchestrationConfidence: orchestrationResult.confidence,
      conversationSummary: request.conversationSummary,
      learningContext: orchestrationResult.promptContext.learningContext
    };

    // 4. Compile prompt
    const compiledPrompt = compilePrompt(compilationContext);

    // 5. Create LLM request
    const llmRequest: LLMRequest = {
      messages: compiledPrompt.messages,
      model: compiledPrompt.model,
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        mode: compilationContext.mode,
        style: compilationContext.style,
        contributingAgents: compiledPrompt.metadata.contributingAgents
      }
    };

    // 6. Call provider
    const startTime = Date.now();
    let llmResult: LLMResponse | LLMProviderError;

    try {
      llmResult = await this.provider.complete(llmRequest);
    } catch (error) {
      llmResult = {
        code: 'network_error',
        message: error instanceof Error ? error.message : 'Unknown provider error',
        provider: this.provider.id,
        requestId,
        retryable: true
      };
    }

    const latencyMs = Date.now() - startTime;

    // 7. Validate response
    const validation: ResponseValidationResult = validateResponse(
      llmResult,
      this.config.validationConfig
    );

    // 8. Render response with orchestration metadata
    const payload = renderCopilotResponse(
      isLLMResponse(llmResult) ? llmResult : {
        content: '',
        model: compiledPrompt.model,
        provider: this.provider.id,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          latencyMs
        },
        finishReason: 'error'
      },
      validation,
      {
        mode: compilationContext.mode,
        style: compilationContext.style,
        contributingAgents: compiledPrompt.metadata.contributingAgents,
        promptSections: compiledPrompt.metadata.promptSections
      }
    );

    return payload;
  }

  // ============================================================================
  // CLARIFICATION RESPONSE
  // ============================================================================

  private createClarificationResponse(
    requestId: string,
    orchestrationResult: OrchestrationResult
  ): ClarificationResponse {
    const missingEvidence: string[] = [];
    if (orchestrationResult.evidence.conceptDefinitions.length === 0) {
      missingEvidence.push('concept-definitions');
    }
    if (orchestrationResult.evidence.applications.length === 0) {
      missingEvidence.push('applications');
    }
    if (orchestrationResult.evidence.researchEvidence.length === 0) {
      missingEvidence.push('research-evidence');
    }

    const suggestedNextPrompts = this.generateSuggestedPrompts(
      orchestrationResult.intent.primaryIntent
    );

    return {
      type: 'clarification',
      clarificationQuestion: orchestrationResult.clarificationQuestion || 'Could you provide more details?',
      missingEvidence,
      suggestedNextPrompts,
      metadata: {
        requestId,
        confidenceLevel: orchestrationResult.confidence.overall,
        confidenceScore: orchestrationResult.confidence.evidenceCompleteness,
        intents: orchestrationResult.intent.intents,
        timestamp: new Date().toISOString()
      }
    };
  }

  private generateSuggestedPrompts(primaryIntent: string): readonly string[] {
    const suggestions: Record<string, readonly string[]> = {
      'explain': ['Explain this concept in simple terms', 'Give me a detailed explanation', 'Show me examples'],
      'compare': ['Compare with related concepts', 'What are the key differences?', 'Show pros and cons'],
      'solve': ['Walk me through the solution', 'Show me the formula', 'Give me practice problems'],
      'visualize': ['Create a diagram', 'Show me a flowchart', 'Visualize the concept'],
      'practice': ['Give me a coding exercise', 'Create a hands-on lab', 'Show me implementation examples'],
      'research': ['What papers cover this topic?', 'Show me the evidence', 'What are the latest findings?'],
      'apply': ['Show real-world applications', 'How is this used in industry?', 'Give me production examples'],
      'review': ['Summarize the key points', 'What have I learned so far?', 'Create a review plan'],
      'plan-learning': ['Create a learning roadmap', 'What should I study next?', 'Show prerequisites'],
      'build-laboratory': ['Create an interactive lab', 'Build a simulation', 'Design an exercise'],
      'assess-knowledge': ['Generate a quiz', 'Test my understanding', 'Create flashcards'],
      'correct-misconceptions': ['What are common misconceptions?', 'Clarify misunderstandings', 'Show correct explanations']
    };

    return suggestions[primaryIntent] || ['Try rephrasing your question', 'Be more specific', 'Ask about a particular aspect'];
  }

  // ============================================================================
  // PROVIDER ACCESS
  // ============================================================================

  getProviderId(): string {
    return this.provider.id;
  }

  isProviderAvailable(): boolean {
    return this.provider.isAvailable;
  }

  private generateRequestId(): string {
    return `copilot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

let defaultRuntime: CopilotRuntime | null = null;

export function getCopilotRuntime(): CopilotRuntime {
  if (!defaultRuntime) {
    defaultRuntime = new CopilotRuntime();
  }
  return defaultRuntime;
}

export function resetCopilotRuntime(): void {
  defaultRuntime = null;
}
