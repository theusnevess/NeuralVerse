/**
 * LLM Provider Module — Public API
 *
 * Provider abstraction for LLM integration.
 * Isolated from D1-D10 deterministic agents.
 */

// ============================================================================
// CONTRACTS
// ============================================================================
export {
  CANONICAL_LLM_PROVIDERS,
  CANONICAL_LLM_MODELS,
  CANONICAL_MESSAGE_ROLES,
  CANONICAL_FINISH_REASONS,
  CANONICAL_LLM_ERROR_CODES,
  type LLMProviderId,
  type LLMModelId,
  type MessageRole,
  type FinishReason,
  type LLMErrorCode,
  type LLMMessage,
  type LLMRequest,
  type LLMRequestMetadata,
  type LLMResponse,
  type LLMUsage,
  type LLMResponseMetadata,
  type LLMProviderConfig,
  type LLMProviderError,
  type LLMProvider,
  isLLMResponse,
  isLLMProviderError,
  isSupportedProvider,
  isSupportedModel
} from './LLMProvider.ts';

// ============================================================================
// PROVIDERS
// ============================================================================
export { MockProvider } from './MockProvider.ts';
export { OpenAIProvider } from './OpenAIProvider.ts';
export { LocalProvider } from './LocalProvider.ts';

// ============================================================================
// FACTORY
// ============================================================================
export {
  createProvider,
  createProviderFromEnvironment,
  getMockProvider,
  getProviderInfo
} from './ProviderFactory.ts';
