/**
 * LLM Provider Interface
 *
 * Defines the contract for all LLM providers.
 * Providers are isolated from D1-D10 deterministic agents.
 * The LLM layer only provides natural language synthesis.
 */

// ============================================================================
// PROVIDER TYPES
// ============================================================================

export const CANONICAL_LLM_PROVIDERS = [
  'mock',
  'openai',
  'local',
  'anthropic',
  'gemini'
] as const;

export type LLMProviderId = (typeof CANONICAL_LLM_PROVIDERS)[number];

export const CANONICAL_LLM_MODELS = [
  'gpt-4',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'claude-3-opus',
  'claude-3-sonnet',
  'gemini-pro',
  'llama-3',
  'mistral',
  'qwen3:8b',
  'qwen2.5-coder:7b',
  'mock-model'
] as const;

export type LLMModelId = (typeof CANONICAL_LLM_MODELS)[number];

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export const CANONICAL_MESSAGE_ROLES = [
  'system',
  'user',
  'assistant'
] as const;

export type MessageRole = (typeof CANONICAL_MESSAGE_ROLES)[number];

export interface LLMMessage {
  readonly role: MessageRole;
  readonly content: string;
}

// ============================================================================
// REQUEST / RESPONSE
// ============================================================================

export interface LLMRequest {
  readonly messages: readonly LLMMessage[];
  readonly model: LLMModelId;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly stopSequences?: readonly string[];
  readonly metadata?: LLMRequestMetadata;
}

export interface LLMRequestMetadata {
  readonly requestId: string;
  readonly timestamp: string;
  readonly mode?: string;
  readonly style?: string;
  readonly contributingAgents?: readonly string[];
}

export interface LLMResponse {
  readonly content: string;
  readonly model: LLMModelId;
  readonly provider: LLMProviderId;
  readonly usage: LLMUsage;
  readonly metadata: LLMResponseMetadata;
  readonly finishReason: FinishReason;
}

export interface LLMUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

export interface LLMResponseMetadata {
  readonly requestId: string;
  readonly timestamp: string;
  readonly latencyMs: number;
}

export const CANONICAL_FINISH_REASONS = [
  'stop',
  'length',
  'content_filter',
  'error'
] as const;

export type FinishReason = (typeof CANONICAL_FINISH_REASONS)[number];

// ============================================================================
// PROVIDER CONFIG
// ============================================================================

export interface LLMProviderConfig {
  readonly provider: LLMProviderId;
  readonly apiKey?: string;
  readonly baseUrl?: string;
  readonly model?: LLMModelId;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly timeoutMs?: number;
}

// ============================================================================
// PROVIDER ERROR
// ============================================================================

export const CANONICAL_LLM_ERROR_CODES = [
  'provider_not_configured',
  'api_key_missing',
  'network_error',
  'rate_limited',
  'invalid_request',
  'response_empty',
  'response_invalid',
  'response_forbidden',
  'timeout',
  'unknown'
] as const;

export type LLMErrorCode = (typeof CANONICAL_LLM_ERROR_CODES)[number];

export interface LLMProviderError {
  readonly code: LLMErrorCode;
  readonly message: string;
  readonly provider: LLMProviderId;
  readonly requestId?: string;
  readonly retryable: boolean;
}

// ============================================================================
// PROVIDER INTERFACE
// ============================================================================

export interface LLMProvider {
  readonly id: LLMProviderId;
  readonly isAvailable: boolean;

  complete(request: LLMRequest): Promise<LLMResponse | LLMProviderError>;

  getSupportedModels(): readonly LLMModelId[];

  validateConfig(config: LLMProviderConfig): boolean;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isLLMResponse(result: LLMResponse | LLMProviderError): result is LLMResponse {
  return 'content' in result && 'model' in result && 'provider' in result;
}

export function isLLMProviderError(result: LLMResponse | LLMProviderError): result is LLMProviderError {
  return 'code' in result && 'message' in result && 'provider' in result;
}

export function isSupportedProvider(provider: string): provider is LLMProviderId {
  return (CANONICAL_LLM_PROVIDERS as readonly string[]).includes(provider);
}

export function isSupportedModel(model: string): model is LLMModelId {
  return (CANONICAL_LLM_MODELS as readonly string[]).includes(model);
}
