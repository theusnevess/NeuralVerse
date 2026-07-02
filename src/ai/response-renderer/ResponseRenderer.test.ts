import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderCopilotResponse } from './ResponseRenderer.ts';
import type { LLMResponse } from '../llm-provider/LLMProvider.ts';
import type { ResponseValidationResult } from '../response-validator/ResponseValidator.ts';

const mockResponse: LLMResponse = {
  content: 'This is a test response with **bold** and *italic* text.',
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

const validValidation: ResponseValidationResult = {
  valid: true,
  code: 'response_valid',
  message: 'Response is valid',
  metadata: {
    originalLength: 50,
    sanitizedLength: 50,
    checkedAt: new Date().toISOString(),
    validatorVersion: '1.0.0'
  }
};

const invalidValidation: ResponseValidationResult = {
  valid: false,
  code: 'response_empty',
  message: 'Response is empty',
  metadata: {
    originalLength: 0,
    sanitizedLength: 0,
    checkedAt: new Date().toISOString(),
    validatorVersion: '1.0.0'
  }
};

describe('ResponseRenderer -- Success', () => {
  it('should render a successful response', () => {
    const payload = renderCopilotResponse(mockResponse, validValidation, {
      mode: 'automatic',
      style: 'default',
      contributingAgents: [],
      promptSections: ['system', 'user']
    });

    assert.equal(payload.type, 'success');
    assert.equal(payload.content, mockResponse.content);
    assert.ok(payload.formattedContent.length > 0);
    assert.equal(payload.metadata.mode, 'automatic');
    assert.equal(payload.metadata.provider, 'mock');
  });

  it('should format markdown to HTML', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: '## Header\n\n- Item 1\n- Item 2'
    };

    const payload = renderCopilotResponse(response, validValidation, {
      mode: 'automatic',
      style: 'default',
      contributingAgents: [],
      promptSections: []
    });

    assert.ok(payload.formattedContent.includes('Header'));
    assert.ok(payload.formattedContent.includes('Item 1'));
  });

  it('should parse response sections', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: '## Section 1\n\nContent here.\n\n## Section 2\n\nMore content.'
    };

    const payload = renderCopilotResponse(response, validValidation, {
      mode: 'automatic',
      style: 'default',
      contributingAgents: [],
      promptSections: []
    });

    assert.ok(payload.sections);
    assert.ok(payload.sections!.length > 0);
  });
});

describe('ResponseRenderer -- Error', () => {
  it('should render an error response', () => {
    const payload = renderCopilotResponse(mockResponse, invalidValidation, {
      mode: 'automatic',
      style: 'default',
      contributingAgents: [],
      promptSections: []
    });

    assert.equal(payload.type, 'error');
    assert.equal(payload.content, 'Response is empty');
    assert.ok(payload.formattedContent.includes('nv-copilot-error'));
  });
});

describe('ResponseRenderer -- Metadata', () => {
  it('should include complete metadata', () => {
    const payload = renderCopilotResponse(mockResponse, validValidation, {
      mode: 'teaching',
      style: 'simple',
      contributingAgents: ['didactic-architecture', 'narrative'],
      promptSections: ['system', 'context', 'user']
    });

    assert.equal(payload.metadata.mode, 'teaching');
    assert.equal(payload.metadata.style, 'simple');
    assert.deepEqual(payload.metadata.contributingAgents, ['didactic-architecture', 'narrative']);
    assert.deepEqual(payload.metadata.promptSections, ['system', 'context', 'user']);
    assert.equal(payload.metadata.validationStatus, 'response_valid');
    assert.equal(payload.metadata.latencyMs, 100);
    assert.equal(payload.metadata.tokenUsage.total, 150);
  });
});

describe('ResponseRenderer -- Sanitization', () => {
  it('should use sanitized content when available', () => {
    const validation: ResponseValidationResult = {
      ...validValidation,
      sanitizedContent: 'Sanitized content here.'
    };

    const payload = renderCopilotResponse(mockResponse, validation, {
      mode: 'automatic',
      style: 'default',
      contributingAgents: [],
      promptSections: []
    });

    assert.equal(payload.content, 'Sanitized content here.');
  });
});

describe('ResponseRenderer -- Sections', () => {
  it('should parse headings into sections', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: '## First Section\n\nFirst content.\n\n## Second Section\n\nSecond content.'
    };

    const payload = renderCopilotResponse(response, validValidation, {
      mode: 'automatic',
      style: 'default',
      contributingAgents: [],
      promptSections: []
    });

    assert.ok(payload.sections);
    const headings = payload.sections!.filter(s => s.type === 'heading');
    assert.equal(headings.length, 2);
  });

  it('should parse lists into sections', () => {
    const response: LLMResponse = {
      ...mockResponse,
      content: '- Item 1\n- Item 2\n- Item 3'
    };

    const payload = renderCopilotResponse(response, validValidation, {
      mode: 'automatic',
      style: 'default',
      contributingAgents: [],
      promptSections: []
    });

    assert.ok(payload.sections);
    const lists = payload.sections!.filter(s => s.type === 'list');
    assert.ok(lists.length > 0);
  });
});
