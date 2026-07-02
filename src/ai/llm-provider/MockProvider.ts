/**
 * MockProvider — Deterministic LLM Provider for Tests
 *
 * Returns fixed responses without network calls.
 * Default provider for tests and development.
 */

import type {
  LLMProvider,
  LLMProviderId,
  LLMProviderConfig,
  LLMProviderError,
  LLMRequest,
  LLMResponse,
  LLMModelId,
  LLMUsage,
  LLMResponseMetadata
} from './LLMProvider.ts';

// ============================================================================
// MOCK RESPONSES
// ============================================================================

const MOCK_RESPONSES: Record<string, string> = {
  default: 'I understand your question. Based on the current context, here is my analysis. The concept you are exploring is fundamental to understanding the broader topic. Let me break this down into key components.',
  teaching: 'Let me explain this concept step by step. First, consider the foundational principle. Then, we can build upon it with practical examples. This approach helps solidify your understanding.',
  research: 'The research landscape for this topic includes several key findings. Recent studies have shown significant progress in understanding the underlying mechanisms. The evidence suggests multiple valid approaches.',
  practice: 'Here is a hands-on exercise to help you understand this concept. Start with the basic setup, then progressively add complexity. Pay attention to the key variables and their interactions.',
  engineering: 'From an engineering perspective, this concept has several practical applications. Consider the trade-offs between different approaches: performance, maintainability, and scalability are key factors.',
  visual: 'Let me create a mental model for this concept. Imagine a diagram where the core components are connected through defined relationships. The flow moves from input to processing to output.',
  knowledge: 'This concept connects to several other topics in your learning path. The relationships form a knowledge graph where understanding one node helps illuminate neighboring nodes.',
  advanced: 'The technical depth of this topic involves several layers. At the lowest level, we have the mathematical foundations. Above that, the implementation details. At the highest level, the architectural patterns.'
};

const MOCK_USAGE: LLMUsage = {
  promptTokens: 150,
  completionTokens: 200,
  totalTokens: 350
};

// ============================================================================
// MOCK PROVIDER
// ============================================================================

export class MockProvider implements LLMProvider {
  readonly id: LLMProviderId = 'mock';
  readonly isAvailable: boolean = true;

  private responseOverride: string | null = null;
  private callCount: number = 0;
  private lastRequest: LLMRequest | null = null;

  async complete(request: LLMRequest): Promise<LLMResponse | LLMProviderError> {
    this.callCount++;
    this.lastRequest = request;

    // Simulate minimal latency
    const startTime = Date.now();

    // Determine response based on metadata
    const mode = request.metadata?.mode || 'automatic';
    let content = this.responseOverride || MOCK_RESPONSES[mode] || MOCK_RESPONSES.default;

    // Check for governance violations in messages
    const userMessage = request.messages.find(m => m.role === 'user')?.content || '';
    if (this.containsForbiddenContent(userMessage)) {
      return {
        code: 'response_forbidden',
        message: 'Request violates content governance rules',
        provider: 'mock',
        requestId: request.metadata?.requestId,
        retryable: false
      };
    }

    const latencyMs = Date.now() - startTime;

    return {
      content,
      model: request.model || 'mock-model',
      provider: 'mock',
      usage: MOCK_USAGE,
      metadata: {
        requestId: request.metadata?.requestId || `mock-${Date.now()}`,
        timestamp: new Date().toISOString(),
        latencyMs
      },
      finishReason: 'stop'
    };
  }

  getSupportedModels(): readonly LLMModelId[] {
    return ['mock-model'];
  }

  validateConfig(_config: LLMProviderConfig): boolean {
    return true;
  }

  // ============================================================================
  // TEST HELPERS
  // ============================================================================

  setResponseOverride(response: string): void {
    this.responseOverride = response;
  }

  clearResponseOverride(): void {
    this.responseOverride = null;
  }

  getCallCount(): number {
    return this.callCount;
  }

  getLastRequest(): LLMRequest | null {
    return this.lastRequest;
  }

  reset(): void {
    this.callCount = 0;
    this.lastRequest = null;
    this.responseOverride = null;
  }

  private containsForbiddenContent(text: string): boolean {
    const forbidden = ['hack', 'exploit', 'bypass security'];
    return forbidden.some(f => text.toLowerCase().includes(f));
  }
}
