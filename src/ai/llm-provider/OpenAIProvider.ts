/**
 * OpenAIProvider — Placeholder for OpenAI Integration
 *
 * Requires backend server for real API calls.
 * API keys must never be exposed to browser JS.
 */

import type {
  LLMProvider,
  LLMProviderId,
  LLMProviderConfig,
  LLMProviderError,
  LLMRequest,
  LLMResponse,
  LLMModelId
} from './LLMProvider.ts';

export class OpenAIProvider implements LLMProvider {
  readonly id: LLMProviderId = 'openai';
  readonly isAvailable: boolean = false;

  private config: LLMProviderConfig | null = null;

  constructor(config?: LLMProviderConfig) {
    this.config = config || null;
    this.isAvailable = this.validateConfig(config || { provider: 'openai' });
  }

  async complete(_request: LLMRequest): Promise<LLMResponse | LLMProviderError> {
    return {
      code: 'provider_not_configured',
      message: 'OpenAI provider requires backend server. Configure LLM_PROVIDER_OPENAI_API_KEY environment variable.',
      provider: 'openai',
      retryable: false
    };
  }

  getSupportedModels(): readonly LLMModelId[] {
    return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  }

  validateConfig(config: LLMProviderConfig): boolean {
    if (!config.apiKey && !process.env.LLM_PROVIDER_OPENAI_API_KEY) {
      return false;
    }
    return true;
  }
}
