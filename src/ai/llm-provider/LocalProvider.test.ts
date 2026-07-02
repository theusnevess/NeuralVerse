import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LocalProvider } from './LocalProvider.ts';
import { isLLMResponse, isLLMProviderError } from './LLMProvider.ts';
import type { LLMRequest, LLMProviderConfig } from './LLMProvider.ts';

// ============================================================================
// MOCK FETCH
// ============================================================================

function createMockFetch(response: { ok: boolean; status?: number; json?: unknown; text?: string }): typeof fetch {
  const mockResponse = {
    ok: response.ok,
    status: response.status || 200,
    json: async () => response.json || {},
    text: async () => response.text || '',
    headers: new Headers(),
    redirected: false,
    statusText: '',
    type: 'basic' as ResponseType,
    url: '',
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    clone: function() { return this; },
    formData: async () => new FormData(),
    bytes: async () => new Uint8Array()
  };

  return async (): Promise<typeof mockResponse> => mockResponse;
}

function createMockOllamaResponse(content: string, done = true) {
  return {
    model: 'qwen3:8b',
    message: { role: 'assistant', content },
    done,
    total_duration: 1000000000,
    eval_count: 50,
    prompt_eval_count: 100
  };
}

// ============================================================================
// TEST FIXTURES
// ============================================================================

const LOCAL_CONFIG: LLMProviderConfig = {
  provider: 'local',
  baseUrl: 'http://localhost:11434',
  model: 'qwen3:8b'
};

const NON_LOCALHOST_CONFIG: LLMProviderConfig = {
  provider: 'local',
  baseUrl: 'http://example.com:11434'
};

const TEST_REQUEST: LLMRequest = {
  messages: [{ role: 'user', content: 'Hello' }],
  model: 'qwen3:8b',
  metadata: {
    requestId: 'test-001',
    timestamp: new Date().toISOString()
  }
};

// ============================================================================
// LOCAL PROVIDER -- CONFIGURATION
// ============================================================================

describe('LocalProvider -- Configuration', () => {
  it('should have correct provider id', () => {
    const provider = new LocalProvider(LOCAL_CONFIG);
    assert.equal(provider.id, 'local');
  });

  it('should be available with valid localhost config', () => {
    const provider = new LocalProvider(LOCAL_CONFIG);
    assert.equal(provider.isAvailable, true);
  });

  it('should not be available without baseUrl', () => {
    const provider = new LocalProvider({ provider: 'local' });
    assert.equal(provider.isAvailable, false);
  });

  it('should not be available with non-localhost URL', () => {
    const provider = new LocalProvider(NON_LOCALHOST_CONFIG);
    assert.equal(provider.isAvailable, false);
  });

  it('should support qwen3:8b model', () => {
    const provider = new LocalProvider(LOCAL_CONFIG);
    const models = provider.getSupportedModels();
    assert.ok(models.includes('qwen3:8b'));
  });

  it('should support qwen2.5-coder:7b fallback model', () => {
    const provider = new LocalProvider(LOCAL_CONFIG);
    const models = provider.getSupportedModels();
    assert.ok(models.includes('qwen2.5-coder:7b'));
  });

  it('should return endpoint', () => {
    const provider = new LocalProvider(LOCAL_CONFIG);
    assert.equal(provider.getEndpoint(), 'http://localhost:11434');
  });

  it('should return model', () => {
    const provider = new LocalProvider(LOCAL_CONFIG);
    assert.equal(provider.getModel(), 'qwen3:8b');
  });

  it('should return fallback model', () => {
    const provider = new LocalProvider(LOCAL_CONFIG);
    assert.equal(provider.getFallbackModel(), 'qwen2.5-coder:7b');
  });
});

// ============================================================================
// LOCAL PROVIDER -- URL VALIDATION
// ============================================================================

describe('LocalProvider -- URL Validation', () => {
  it('should accept localhost', () => {
    const provider = new LocalProvider({
      provider: 'local',
      baseUrl: 'http://localhost:11434'
    });
    assert.equal(provider.isAvailable, true);
  });

  it('should accept 127.0.0.1', () => {
    const provider = new LocalProvider({
      provider: 'local',
      baseUrl: 'http://127.0.0.1:11434'
    });
    assert.equal(provider.isAvailable, true);
  });

  it('should accept IPv6 localhost', () => {
    const provider = new LocalProvider({
      provider: 'local',
      baseUrl: 'http://[::1]:11434'
    });
    assert.equal(provider.isAvailable, true);
  });

  it('should reject example.com', () => {
    const provider = new LocalProvider({
      provider: 'local',
      baseUrl: 'http://example.com:11434'
    });
    assert.equal(provider.isAvailable, false);
  });

  it('should reject 8.8.8.8', () => {
    const provider = new LocalProvider({
      provider: 'local',
      baseUrl: 'http://8.8.8.8:11434'
    });
    assert.equal(provider.isAvailable, false);
  });

  it('should reject non-localhost URLs in complete()', async () => {
    const provider = new LocalProvider(NON_LOCALHOST_CONFIG);
    const result = await provider.complete(TEST_REQUEST);
    assert.ok(isLLMProviderError(result));
    if (isLLMProviderError(result)) {
      assert.equal(result.code, 'network_error');
      assert.ok(result.message.includes('localhost'));
    }
  });
});

// ============================================================================
// LOCAL PROVIDER -- OLLAMA PAYLOAD
// ============================================================================

describe('LocalProvider -- Ollama Payload', () => {
  it('should build correct Ollama chat payload', async () => {
    let capturedBody: string = '';
    const baseMockFetch = createMockFetch({
      ok: true,
      json: createMockOllamaResponse('Hello!')
    });
    const mockFetch: typeof fetch = async (input, init) => {
      if (init?.body) {
        capturedBody = init.body as string;
      }
      return baseMockFetch(input, init);
    };

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);
    await provider.complete(TEST_REQUEST);

    const body = JSON.parse(capturedBody);
    assert.equal(body.model, 'qwen3:8b');
    assert.equal(body.stream, false);
    assert.ok(body.messages);
    assert.ok(body.options);
    assert.equal(body.options.temperature, 0.3);
    assert.equal(body.options.top_p, 0.9);
    assert.equal(body.options.num_ctx, 4096);
  });

  it('should use request temperature when provided', async () => {
    let capturedBody: string = '';
    const baseMockFetch = createMockFetch({
      ok: true,
      json: createMockOllamaResponse('Response')
    });
    const mockFetch: typeof fetch = async (input, init) => {
      if (init?.body) {
        capturedBody = init.body as string;
      }
      return baseMockFetch(input, init);
    };

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);
    await provider.complete({
      ...TEST_REQUEST,
      temperature: 0.7
    });

    const body = JSON.parse(capturedBody);
    assert.equal(body.options.temperature, 0.7);
  });
});

// ============================================================================
// LOCAL PROVIDER -- RESPONSE PARSING
// ============================================================================

describe('LocalProvider -- Response Parsing', () => {
  it('should parse valid Ollama response', async () => {
    const mockFetch = createMockFetch({
      ok: true,
      json: createMockOllamaResponse('Linear regression is a statistical method.')
    });

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);
    const result = await provider.complete(TEST_REQUEST);

    assert.ok(isLLMResponse(result));
    if (isLLMResponse(result)) {
      assert.equal(result.content, 'Linear regression is a statistical method.');
      assert.equal(result.model, 'qwen3:8b');
      assert.equal(result.provider, 'local');
      assert.equal(result.finishReason, 'stop');
      assert.equal(result.usage.promptTokens, 100);
      assert.equal(result.usage.completionTokens, 50);
      assert.equal(result.usage.totalTokens, 150);
    }
  });

  it('should handle incomplete response', async () => {
    const mockFetch = createMockFetch({
      ok: true,
      json: createMockOllamaResponse('Partial response...', false)
    });

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);
    const result = await provider.complete(TEST_REQUEST);

    assert.ok(isLLMResponse(result));
    if (isLLMResponse(result)) {
      assert.equal(result.finishReason, 'length');
    }
  });

  it('should handle empty response content', async () => {
    const mockFetch = createMockFetch({
      ok: true,
      json: { model: 'qwen3:8b', message: { role: 'assistant', content: '' }, done: true }
    });

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);
    const result = await provider.complete(TEST_REQUEST);

    assert.ok(isLLMProviderError(result));
    if (isLLMProviderError(result)) {
      assert.equal(result.code, 'response_empty');
    }
  });
});

// ============================================================================
// LOCAL PROVIDER -- ERROR HANDLING
// ============================================================================

describe('LocalProvider -- Error Handling', () => {
  it('should handle HTTP errors', async () => {
    const mockFetch = createMockFetch({
      ok: false,
      status: 500,
      text: 'Internal Server Error'
    });

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);
    const result = await provider.complete(TEST_REQUEST);

    assert.ok(isLLMProviderError(result));
    if (isLLMProviderError(result)) {
      assert.equal(result.code, 'network_error');
      assert.ok(result.message.includes('500'));
    }
  });

  it('should handle connection refused', async () => {
    const mockFetch = async () => {
      throw new Error('connect ECONNREFUSED 127.0.0.1:11434');
    };

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);
    const result = await provider.complete(TEST_REQUEST);

    assert.ok(isLLMProviderError(result));
    if (isLLMProviderError(result)) {
      assert.equal(result.code, 'network_error');
      assert.ok(result.message.includes('not running'));
      assert.equal(result.retryable, true);
    }
  });

  it('should handle timeout', async () => {
    const mockFetch = async () => {
      const error = new Error('Aborted');
      error.name = 'AbortError';
      throw error;
    };

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);
    const result = await provider.complete(TEST_REQUEST);

    assert.ok(isLLMProviderError(result));
    if (isLLMProviderError(result)) {
      assert.equal(result.code, 'timeout');
      assert.equal(result.retryable, true);
    }
  });

  it('should handle unknown errors', async () => {
    const mockFetch = async () => {
      throw new Error('Something went wrong');
    };

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);
    const result = await provider.complete(TEST_REQUEST);

    assert.ok(isLLMProviderError(result));
    if (isLLMProviderError(result)) {
      assert.equal(result.code, 'network_error');
      assert.ok(result.message.includes('Something went wrong'));
    }
  });

  it('should never throw raw errors to caller', async () => {
    const mockFetch = async () => {
      throw new Error('Raw error');
    };

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);

    // Should not throw
    const result = await provider.complete(TEST_REQUEST);
    assert.ok(result);
    assert.ok(isLLMProviderError(result));
  });
});

// ============================================================================
// LOCAL PROVIDER -- PROVIDER METADATA
// ============================================================================

describe('LocalProvider -- Provider Metadata', () => {
  it('should include requestId in response', async () => {
    const mockFetch = createMockFetch({
      ok: true,
      json: createMockOllamaResponse('Response')
    });

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);
    const result = await provider.complete(TEST_REQUEST);

    assert.ok(isLLMResponse(result));
    if (isLLMResponse(result)) {
      assert.equal(result.metadata.requestId, 'test-001');
    }
  });

  it('should include latency in response', async () => {
    const mockFetch = createMockFetch({
      ok: true,
      json: createMockOllamaResponse('Response')
    });

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);
    const result = await provider.complete(TEST_REQUEST);

    assert.ok(isLLMResponse(result));
    if (isLLMResponse(result)) {
      assert.ok(result.metadata.latencyMs >= 0);
    }
  });

  it('should include timestamp in response', async () => {
    const mockFetch = createMockFetch({
      ok: true,
      json: createMockOllamaResponse('Response')
    });

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);
    const result = await provider.complete(TEST_REQUEST);

    assert.ok(isLLMResponse(result));
    if (isLLMResponse(result)) {
      assert.ok(result.metadata.timestamp);
    }
  });
});

// ============================================================================
// LOCAL PROVIDER -- ENVIRONMENT CONFIGURATION
// ============================================================================

describe('LocalProvider -- Environment Configuration', () => {
  it('should use NEURALVERSE_LOCAL_LLM_URL env var', () => {
    const original = process.env.NEURALVERSE_LOCAL_LLM_URL;
    process.env.NEURALVERSE_LOCAL_LLM_URL = 'http://localhost:11435';

    const provider = new LocalProvider({ provider: 'local' });
    assert.equal(provider.getEndpoint(), 'http://localhost:11435');

    if (original !== undefined) {
      process.env.NEURALVERSE_LOCAL_LLM_URL = original;
    } else {
      delete process.env.NEURALVERSE_LOCAL_LLM_URL;
    }
  });

  it('should use NEURALVERSE_LOCAL_LLM_MODEL env var', () => {
    const original = process.env.NEURALVERSE_LOCAL_LLM_MODEL;
    process.env.NEURALVERSE_LOCAL_LLM_MODEL = 'qwen2.5-coder:7b';

    const provider = new LocalProvider({ provider: 'local' });
    assert.equal(provider.getModel(), 'qwen2.5-coder:7b');

    if (original !== undefined) {
      process.env.NEURALVERSE_LOCAL_LLM_MODEL = original;
    } else {
      delete process.env.NEURALVERSE_LOCAL_LLM_MODEL;
    }
  });
});

// ============================================================================
// LOCAL PROVIDER -- RUNTIME RESTRICTIONS
// ============================================================================

describe('LocalProvider -- Runtime Restrictions', () => {
  it('should not use Math.random', async () => {
    const originalRandom = Math.random;
    let randomCalled = false;
    Math.random = () => { randomCalled = true; return 0.5; };

    const mockFetch = createMockFetch({
      ok: true,
      json: createMockOllamaResponse('Response')
    });

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);
    await provider.complete(TEST_REQUEST);

    Math.random = originalRandom;
    assert.equal(randomCalled, false, 'Math.random should not be called');
  });

  it('should not use Date.now for randomness', async () => {
    const mockFetch = createMockFetch({
      ok: true,
      json: createMockOllamaResponse('Response')
    });

    const provider = new LocalProvider(LOCAL_CONFIG, mockFetch);
    const result = await provider.complete(TEST_REQUEST);

    assert.ok(isLLMResponse(result));
  });
});
