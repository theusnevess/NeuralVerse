/**
 * LocalProvider — Ollama-Compatible Local LLM Provider
 *
 * Connects to local Ollama server for qwen3:8b and other local models.
 * Default model: qwen3:8b
 * Fallback model: qwen2.5-coder:7b
 *
 * Security: Only connects to localhost. Rejects non-localhost URLs.
 * Tests: Uses mockable fetch transport. No test calls real Ollama.
 */

import type {
  LLMProvider,
  LLMProviderId,
  LLMProviderConfig,
  LLMProviderError,
  LLMRequest,
  LLMResponse,
  LLMModelId,
  LLMMessage,
  LLMUsage,
  LLMResponseMetadata
} from './LLMProvider.ts';

// ============================================================================
// OLLAMA TYPES
// ============================================================================

interface OllamaChatRequest {
  readonly model: string;
  readonly messages: readonly OllamaMessage[];
  readonly stream: false;
  readonly options: OllamaOptions;
}

interface OllamaMessage {
  readonly role: string;
  readonly content: string;
}

interface OllamaOptions {
  readonly temperature: number;
  readonly top_p: number;
  readonly num_ctx: number;
}

interface OllamaChatResponse {
  readonly model: string;
  readonly message: {
    readonly role: string;
    readonly content: string;
  };
  readonly done: boolean;
  readonly total_duration?: number;
  readonly eval_count?: number;
  readonly prompt_eval_count?: number;
}

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_MODEL: LLMModelId = 'qwen3:8b';
const FALLBACK_MODEL: LLMModelId = 'qwen2.5-coder:7b';
const DEFAULT_BASE_URL = 'http://localhost:11434';
const DEFAULT_TIMEOUT_MS = 30000;

const DEFAULT_OPTIONS: OllamaOptions = {
  temperature: 0.3,
  top_p: 0.9,
  num_ctx: 4096
};

// ============================================================================
// LOCAL PROVIDER
// ============================================================================

export class LocalProvider implements LLMProvider {
  readonly id: LLMProviderId = 'local';
  readonly isAvailable: boolean;

  private baseUrl: string;
  private model: LLMModelId;
  private timeoutMs: number;
  private options: OllamaOptions;
  private fetchFn: typeof fetch;

  constructor(
    config?: LLMProviderConfig,
    fetchTransport?: typeof fetch
  ) {
    this.baseUrl = config?.baseUrl || process.env.NEURALVERSE_LOCAL_LLM_URL || DEFAULT_BASE_URL;
    this.model = (config?.model || process.env.NEURALVERSE_LOCAL_LLM_MODEL || DEFAULT_MODEL) as LLMModelId;
    this.timeoutMs = config?.timeoutMs || DEFAULT_TIMEOUT_MS;
    this.fetchFn = fetchTransport || fetch;

    // Validate options from environment
    this.options = {
      temperature: parseFloat(process.env.NEURALVERSE_LLM_TEMPERATURE || String(DEFAULT_OPTIONS.temperature)),
      top_p: parseFloat(process.env.NEURALVERSE_LLM_TOP_P || String(DEFAULT_OPTIONS.top_p)),
      num_ctx: parseInt(process.env.NEURALVERSE_LLM_NUM_CTX || String(DEFAULT_OPTIONS.num_ctx), 10)
    };

    this.isAvailable = this.validateConfig(config || { provider: 'local' });
  }

  async complete(request: LLMRequest): Promise<LLMResponse | LLMProviderError> {
    const requestId = request.metadata?.requestId || `local-${Date.now()}`;
    const startTime = Date.now();

    // Validate URL is localhost
    if (!this.isLocalhost(this.baseUrl)) {
      return {
        code: 'network_error',
        message: `LocalProvider only connects to localhost. Rejected URL: ${this.baseUrl}`,
        provider: 'local',
        requestId,
        retryable: false
      };
    }

    // Build Ollama request
    const ollamaRequest: OllamaChatRequest = {
      model: this.model,
      messages: request.messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      stream: false,
      options: {
        temperature: request.temperature ?? this.options.temperature,
        top_p: this.options.top_p,
        num_ctx: this.options.num_ctx
      }
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await this.fetchFn(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ollamaRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        return this.handleError('network_error', `Ollama returned ${response.status}: ${errorText}`, requestId);
      }

      const data: OllamaChatResponse = await response.json();

      if (!data.message?.content) {
        return this.handleError('response_empty', 'Ollama returned empty response', requestId);
      }

      const latencyMs = Date.now() - startTime;

      return {
        content: data.message.content,
        model: data.model as LLMModelId,
        provider: 'local',
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        },
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          latencyMs
        },
        finishReason: data.done ? 'stop' : 'length'
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return this.handleError('timeout', `Ollama request timed out after ${this.timeoutMs}ms`, requestId);
      }

      if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
        return this.handleError('network_error', 'Ollama server is not running. Start Ollama and try again.', requestId);
      }

      return this.handleError('network_error', error instanceof Error ? error.message : 'Unknown error', requestId);
    }
  }

  getSupportedModels(): readonly LLMModelId[] {
    return [DEFAULT_MODEL, FALLBACK_MODEL, 'llama-3', 'mistral'];
  }

  validateConfig(config: LLMProviderConfig): boolean {
    const baseUrl = config.baseUrl || process.env.NEURALVERSE_LOCAL_LLM_URL;

    if (!baseUrl) {
      return false;
    }

    if (!this.isLocalhost(baseUrl)) {
      return false;
    }

    return true;
  }

  getEndpoint(): string {
    return this.baseUrl;
  }

  getModel(): LLMModelId {
    return this.model;
  }

  getFallbackModel(): LLMModelId {
    return FALLBACK_MODEL;
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private isLocalhost(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'localhost' ||
             parsed.hostname === '127.0.0.1' ||
             parsed.hostname === '::1' ||
             parsed.hostname === '[::1]';
    } catch {
      return false;
    }
  }

  private handleError(
    code: LLMProviderError['code'],
    message: string,
    requestId: string
  ): LLMProviderError {
    const retryable = code === 'network_error' || code === 'timeout';
    return {
      code,
      message: `[LocalProvider] ${message}`,
      provider: 'local',
      requestId,
      retryable
    };
  }
}
