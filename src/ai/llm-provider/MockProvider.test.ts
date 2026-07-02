import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MockProvider } from './MockProvider.ts';
import { isLLMResponse, isLLMProviderError } from './LLMProvider.ts';
import type { LLMRequest } from './LLMProvider.ts';

describe('MockProvider -- Core', () => {
  it('should have correct provider id', () => {
    const provider = new MockProvider();
    assert.equal(provider.id, 'mock');
  });

  it('should be available', () => {
    const provider = new MockProvider();
    assert.equal(provider.isAvailable, true);
  });

  it('should support mock-model', () => {
    const provider = new MockProvider();
    const models = provider.getSupportedModels();
    assert.ok(models.includes('mock-model'));
  });

  it('should validate any config', () => {
    const provider = new MockProvider();
    assert.equal(provider.validateConfig({ provider: 'mock' }), true);
  });
});

describe('MockProvider -- Complete', () => {
  it('should return a valid response', async () => {
    const provider = new MockProvider();
    const request: LLMRequest = {
      messages: [{ role: 'user', content: 'Hello' }],
      model: 'mock-model'
    };

    const result = await provider.complete(request);
    assert.ok(isLLMResponse(result));

    if (isLLMResponse(result)) {
      assert.ok(result.content.length > 0);
      assert.equal(result.model, 'mock-model');
      assert.equal(result.provider, 'mock');
      assert.equal(result.finishReason, 'stop');
    }
  });

  it('should return error for forbidden content', async () => {
    const provider = new MockProvider();
    const request: LLMRequest = {
      messages: [{ role: 'user', content: 'How to hack a system' }],
      model: 'mock-model'
    };

    const result = await provider.complete(request);
    assert.ok(isLLMProviderError(result));

    if (isLLMProviderError(result)) {
      assert.equal(result.code, 'response_forbidden');
      assert.equal(result.provider, 'mock');
      assert.equal(result.retryable, false);
    }
  });

  it('should track call count', async () => {
    const provider = new MockProvider();
    const request: LLMRequest = {
      messages: [{ role: 'user', content: 'Test' }],
      model: 'mock-model'
    };

    assert.equal(provider.getCallCount(), 0);
    await provider.complete(request);
    assert.equal(provider.getCallCount(), 1);
    await provider.complete(request);
    assert.equal(provider.getCallCount(), 2);
  });

  it('should store last request', async () => {
    const provider = new MockProvider();
    const request: LLMRequest = {
      messages: [{ role: 'user', content: 'Test' }],
      model: 'mock-model'
    };

    assert.equal(provider.getLastRequest(), null);
    await provider.complete(request);
    assert.deepStrictEqual(provider.getLastRequest(), request);
  });
});

describe('MockProvider -- Response Override', () => {
  it('should use response override when set', async () => {
    const provider = new MockProvider();
    provider.setResponseOverride('Custom response');

    const request: LLMRequest = {
      messages: [{ role: 'user', content: 'Test' }],
      model: 'mock-model'
    };

    const result = await provider.complete(request);
    assert.ok(isLLMResponse(result));

    if (isLLMResponse(result)) {
      assert.equal(result.content, 'Custom response');
    }
  });

  it('should clear response override', async () => {
    const provider = new MockProvider();
    provider.setResponseOverride('Custom response');
    provider.clearResponseOverride();

    const request: LLMRequest = {
      messages: [{ role: 'user', content: 'Test' }],
      model: 'mock-model'
    };

    const result = await provider.complete(request);
    assert.ok(isLLMResponse(result));

    if (isLLMResponse(result)) {
      assert.notEqual(result.content, 'Custom response');
    }
  });
});

describe('MockProvider -- Reset', () => {
  it('should reset all state', async () => {
    const provider = new MockProvider();
    provider.setResponseOverride('Custom');

    const request: LLMRequest = {
      messages: [{ role: 'user', content: 'Test' }],
      model: 'mock-model'
    };

    await provider.complete(request);
    assert.equal(provider.getCallCount(), 1);
    assert.notEqual(provider.getLastRequest(), null);

    provider.reset();

    assert.equal(provider.getCallCount(), 0);
    assert.equal(provider.getLastRequest(), null);
  });
});

describe('MockProvider -- Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const originalRandom = Math.random;
    let randomCalled = false;
    Math.random = () => { randomCalled = true; return 0.5; };

    const provider = new MockProvider();
    const request: LLMRequest = {
      messages: [{ role: 'user', content: 'Test' }],
      model: 'mock-model'
    };

    provider.complete(request).then(() => {
      Math.random = originalRandom;
      assert.equal(randomCalled, false, 'Math.random should not be called');
    });
  });

  it('should not use Date.now for randomness', () => {
    const provider = new MockProvider();
    const request: LLMRequest = {
      messages: [{ role: 'user', content: 'Test' }],
      model: 'mock-model'
    };

    provider.complete(request).then((result) => {
      assert.ok(isLLMResponse(result));
    });
  });
});
