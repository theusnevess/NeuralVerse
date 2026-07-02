import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateResponse, isValidResponse, getSanitizedContent } from './ResponseValidator.ts';
import type { LLMResponse, LLMProviderError } from '../llm-provider/LLMProvider.ts';

const mockResponse: LLMResponse = {
  content: 'This is a valid response with enough content to pass validation checks successfully.\n\nIt has multiple paragraphs for structure validation.',
  model: 'mock-model',
  provider: 'mock',
  usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
  metadata: {
    requestId: 'test-001',
    timestamp: new Date().toISOString(),
    latencyMs: 100
  },
  finishReason: 'stop'
};

const mockError: LLMProviderError = {
  code: 'network_error',
  message: 'Connection failed',
  provider: 'mock',
  retryable: true
};

describe('ResponseValidator -- Valid Response', () => {
  it('should validate a valid response', () => {
    const result = validateResponse(mockResponse);
    assert.equal(result.valid, true);
    assert.equal(result.code, 'response_valid');
  });

  it('should report valid response via convenience function', () => {
    assert.equal(isValidResponse(mockResponse), true);
  });
});

describe('ResponseValidator -- Provider Error', () => {
  it('should reject provider error', () => {
    const result = validateResponse(mockError);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'response_provider_error');
  });
});

describe('ResponseValidator -- Empty Response', () => {
  it('should reject empty content', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: ''
    };
    const result = validateResponse(response);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'response_empty');
  });

  it('should reject whitespace-only content', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: '   \n\t  '
    };
    const result = validateResponse(response);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'response_empty');
  });
});

describe('ResponseValidator -- Length Validation', () => {
  it('should reject too-short response', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: 'Short'
    };
    const result = validateResponse(response);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'response_too_short');
  });

  it('should reject too-long response', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: 'x'.repeat(10001)
    };
    const result = validateResponse(response);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'response_too_long');
  });

  it('should respect custom length config', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: 'Short but valid content with structure.\n\nSecond paragraph.'
    };
    const result = validateResponse(response, { minLength: 5, maxLength: 100, requireStructure: true });
    assert.equal(result.valid, true);
  });
});

describe('ResponseValidator -- Finish Reason', () => {
  it('should reject error finish reason', () => {
    const response: LLMResponse = {
      ...mockResponse,
      finishReason: 'error'
    };
    const result = validateResponse(response);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'response_finish_error');
  });
});

describe('ResponseValidator -- Content Filtering', () => {
  it('should detect forbidden patterns', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: 'I cannot help with that request. Here is some valid content.'
    };
    const result = validateResponse(response);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'response_contains_forbidden');
    assert.ok(result.sanitizedContent);
  });

  it('should sanitize forbidden patterns', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: 'I cannot help with that request.'
    };
    const result = validateResponse(response);
    assert.ok(result.sanitizedContent);
    assert.ok(!result.sanitizedContent?.includes('I cannot help with that'));
  });
});

describe('ResponseValidator -- Structure Validation', () => {
  it('should reject unstructured short response', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: 'Just a single line without structure.'
    };
    const result = validateResponse(response, { requireStructure: true });
    assert.equal(result.valid, false);
    assert.equal(result.code, 'response_missing_structure');
  });

  it('should accept response with paragraphs', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: 'First paragraph.\n\nSecond paragraph.'
    };
    const result = validateResponse(response);
    assert.equal(result.valid, true);
  });

  it('should accept response with lists', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: '- Item 1\n- Item 2\n- Item 3'
    };
    const result = validateResponse(response);
    assert.equal(result.valid, true);
  });

  it('should accept response with headers', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: '## Header\n\nContent here.'
    };
    const result = validateResponse(response);
    assert.equal(result.valid, true);
  });

  it('should skip structure check when disabled', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: 'Short'
    };
    const result = validateResponse(response, { requireStructure: false, minLength: 3 });
    assert.equal(result.valid, true);
  });
});

describe('ResponseValidator -- Sanitization', () => {
  it('should return original content when valid', () => {
    const content = 'This is a valid response with enough content.';
    const result = getSanitizedContent({ ...mockResponse, content });
    assert.equal(result, content);
  });

  it('should return empty string for provider error', () => {
    const result = getSanitizedContent(mockError);
    assert.equal(result, '');
  });
});

describe('ResponseValidator -- Metadata', () => {
  it('should include validation metadata', () => {
    const result = validateResponse(mockResponse);
    assert.ok(result.metadata);
    assert.equal(result.metadata.originalLength, mockResponse.content.length);
    assert.equal(result.metadata.validatorVersion, '1.0.0');
    assert.ok(result.metadata.checkedAt);
  });
});
