/**
 * Provider Factory — Creates LLM Provider Instances
 *
 * Selects the appropriate provider based on configuration.
 * Falls back to MockProvider when no production provider is configured.
 *
 * Environment variables:
 *   NEURALVERSE_LLM_PROVIDER: mock | local | openai (default: mock)
 *   NEURALVERSE_LOCAL_LLM_URL: http://localhost:11434
 *   NEURALVERSE_LOCAL_LLM_MODEL: qwen3:8b
 *   NEURALVERSE_LLM_TEMPERATURE: 0.3
 *   NEURALVERSE_LLM_TOP_P: 0.9
 *   NEURALVERSE_LLM_NUM_CTX: 4096
 */

import type { LLMProvider, LLMProviderId, LLMProviderConfig } from './LLMProvider.ts';
import { isSupportedProvider } from './LLMProvider.ts';
import { MockProvider } from './MockProvider.ts';
import { OpenAIProvider } from './OpenAIProvider.ts';
import { LocalProvider } from './LocalProvider.ts';

const mockProvider = new MockProvider();

export function createProvider(config: LLMProviderConfig): LLMProvider {
  const providerId = config.provider;

  if (!isSupportedProvider(providerId)) {
    return mockProvider;
  }

  switch (providerId) {
    case 'mock':
      return mockProvider;

    case 'openai': {
      const provider = new OpenAIProvider(config);
      return provider.isAvailable ? provider : mockProvider;
    }

    case 'local': {
      const provider = new LocalProvider(config);
      return provider.isAvailable ? provider : mockProvider;
    }

    default:
      return mockProvider;
  }
}

export function createProviderFromEnvironment(): LLMProvider {
  const providerEnv = process.env.NEURALVERSE_LLM_PROVIDER || 'mock';

  const config: LLMProviderConfig = {
    provider: providerEnv as LLMProviderId,
    apiKey: process.env.LLM_PROVIDER_OPENAI_API_KEY,
    baseUrl: process.env.NEURALVERSE_LOCAL_LLM_URL || process.env.LLM_PROVIDER_LOCAL_URL,
    model: (process.env.NEURALVERSE_LOCAL_LLM_MODEL || process.env.LLM_MODEL || 'mock-model') as LLMProviderConfig['model'],
    temperature: parseFloat(process.env.NEURALVERSE_LLM_TEMPERATURE || process.env.LLM_TEMPERATURE || '0.3'),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2048', 10),
    timeoutMs: parseInt(process.env.NEURALVERSE_LLM_TIMEOUT_MS || '30000', 10)
  };

  return createProvider(config);
}

export function getMockProvider(): MockProvider {
  return mockProvider;
}

export function getProviderInfo(provider: LLMProvider): {
  id: string;
  available: boolean;
  model?: string;
  endpoint?: string;
} {
  const info: {
    id: string;
    available: boolean;
    model?: string;
    endpoint?: string;
  } = {
    id: provider.id,
    available: provider.isAvailable
  };

  if (provider instanceof LocalProvider) {
    info.model = provider.getModel();
    info.endpoint = provider.getEndpoint();
  }

  return info;
}
