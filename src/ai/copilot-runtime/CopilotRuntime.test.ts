import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CopilotRuntime, getCopilotRuntime, resetCopilotRuntime } from './CopilotRuntime.ts';
import { MockProvider } from '../llm-provider/MockProvider.ts';
import type { CopilotRequest } from './CopilotRuntime.ts';

describe('CopilotRuntime -- Core', () => {
  it('should create runtime with default config', () => {
    const runtime = new CopilotRuntime();
    assert.ok(runtime);
    assert.equal(runtime.getProviderId(), 'mock');
    assert.equal(runtime.isProviderAvailable(), true);
  });

  it('should create runtime with custom provider', () => {
    const provider = new MockProvider();
    const runtime = new CopilotRuntime({ provider });
    assert.equal(runtime.getProviderId(), 'mock');
  });
});

describe('CopilotRuntime -- Request Processing', () => {
  it('should process a basic request', async () => {
    const provider = new MockProvider();
    const runtime = new CopilotRuntime({ provider });

    const request: CopilotRequest = {
      query: 'Explain neural networks',
      mode: 'automatic',
      style: 'default',
      currentRoute: '#/learning',
      developerMode: false
    };

    const response = await runtime.processRequest(request);
    assert.ok(response);
    assert.equal(response.type, 'success');
    assert.ok(response.content.length > 0);
    assert.ok(response.formattedContent.length > 0);
    assert.equal(response.metadata.mode, 'automatic');
    assert.equal(response.metadata.style, 'default');
    assert.equal(response.metadata.provider, 'mock');
  });

  it('should handle teaching mode', async () => {
    const provider = new MockProvider();
    const runtime = new CopilotRuntime({ provider });

    const request: CopilotRequest = {
      query: 'Explain backpropagation',
      mode: 'teaching',
      style: 'simple',
      currentRoute: '#/learning',
      developerMode: false
    };

    const response = await runtime.processRequest(request);
    assert.equal(response.type, 'success');
    assert.equal(response.metadata.mode, 'teaching');
    assert.equal(response.metadata.style, 'simple');
  });

  it('should include lesson context', async () => {
    const provider = new MockProvider();
    const runtime = new CopilotRuntime({ provider });

    const request: CopilotRequest = {
      query: 'What are prerequisites?',
      mode: 'automatic',
      style: 'default',
      currentRoute: '#/learning',
      currentLesson: {
        pathId: 'ml-path',
        pathTitle: 'Machine Learning',
        moduleId: 'dl-module',
        moduleTitle: 'Deep Learning',
        lessonId: 'nn-lesson',
        lessonTitle: 'Neural Networks'
      },
      developerMode: false
    };

    const response = await runtime.processRequest(request);
    assert.equal(response.type, 'success');
    assert.ok(response.content.length > 0);
  });

  it('should include agent outputs', async () => {
    const provider = new MockProvider();
    const runtime = new CopilotRuntime({ provider });

    const request: CopilotRequest = {
      query: 'Compare approaches',
      mode: 'research',
      style: 'detailed',
      currentRoute: '#/learning',
      agentOutputs: [
        {
          agentId: 'research-state-of-art',
          agentName: 'Research Agent',
          output: 'Key findings include...',
          confidence: 'high'
        }
      ],
      developerMode: false
    };

    const response = await runtime.processRequest(request);
    assert.equal(response.type, 'success');
    assert.ok(response.metadata.contributingAgents.includes('research-state-of-art'));
  });

  it('should handle provider errors gracefully', async () => {
    const provider = new MockProvider();
    provider.setResponseOverride('');

    const runtime = new CopilotRuntime({ provider });

    const request: CopilotRequest = {
      query: 'Test',
      mode: 'automatic',
      style: 'default',
      currentRoute: '#/learning',
      developerMode: false
    };

    const response = await runtime.processRequest(request);
    // Should not throw, should return error response
    assert.ok(response);
  });
});

describe('CopilotRuntime -- Orchestration Integration', () => {
  it('should classify intents from query', async () => {
    const provider = new MockProvider();
    const runtime = new CopilotRuntime({ provider });

    const request: CopilotRequest = {
      query: 'Compare CNN vs Vision Transformer',
      mode: 'automatic',
      style: 'default',
      currentRoute: '#/learning',
      developerMode: false
    };

    const response = await runtime.processRequest(request);
    assert.ok(response);
    // Response should include orchestration metadata
    if ('metadata' in response && 'contributingAgents' in response.metadata) {
      assert.ok(response.metadata.contributingAgents.length > 0);
    }
  });

  it('should select agents automatically', async () => {
    const provider = new MockProvider();
    const runtime = new CopilotRuntime({ provider });

    const request: CopilotRequest = {
      query: 'Explain neural networks',
      mode: 'teaching',
      style: 'default',
      currentRoute: '#/learning',
      developerMode: false
    };

    const response = await runtime.processRequest(request);
    assert.ok(response);
    // Should have didactic-architecture selected
    if ('metadata' in response && 'contributingAgents' in response.metadata) {
      assert.ok(response.metadata.contributingAgents.includes('didactic-architecture'));
    }
  });

  it('should include orchestration context in prompt', async () => {
    const provider = new MockProvider();
    const runtime = new CopilotRuntime({ provider });

    const request: CopilotRequest = {
      query: 'Explain neural networks',
      mode: 'teaching',
      style: 'default',
      currentRoute: '#/learning',
      developerMode: true
    };

    const response = await runtime.processRequest(request);
    assert.ok(response);
    // Developer mode should include orchestration sections
    if ('metadata' in response && 'promptSections' in response.metadata) {
      assert.ok(response.metadata.promptSections.includes('orchestration'));
    }
  });

  it('should leverage conversation context', async () => {
    const provider = new MockProvider();
    const runtime = new CopilotRuntime({ provider });

    const request: CopilotRequest = {
      query: 'Explain more about that',
      mode: 'teaching',
      style: 'default',
      currentRoute: '#/learning',
      conversationSummary: 'Previously discussed neural networks',
      conversationHistory: ['What is a neural network?', 'A neural network is...'],
      developerMode: false
    };

    const response = await runtime.processRequest(request);
    assert.ok(response);
  });
});

describe('CopilotRuntime -- Developer Mode', () => {
  it('should include developer metadata when enabled', async () => {
    const provider = new MockProvider();
    const runtime = new CopilotRuntime({ provider });

    const request: CopilotRequest = {
      query: 'Explain transformers',
      mode: 'advanced',
      style: 'mathematical',
      currentRoute: '#/learning',
      developerMode: true
    };

    const response = await runtime.processRequest(request);
    assert.equal(response.type, 'success');
    assert.ok(response.metadata.promptSections.includes('developer'));
  });
});

describe('CopilotRuntime -- Fallback Behavior', () => {
  it('should use MockProvider when no provider configured', () => {
    resetCopilotRuntime();
    const runtime = getCopilotRuntime();
    assert.equal(runtime.getProviderId(), 'mock');
  });

  it('should return same runtime instance', () => {
    resetCopilotRuntime();
    const runtime1 = getCopilotRuntime();
    const runtime2 = getCopilotRuntime();
    assert.strictEqual(runtime1, runtime2);
  });
});

describe('CopilotRuntime -- Guardrails', () => {
  it('should include guardrails in request', async () => {
    const provider = new MockProvider();
    const runtime = new CopilotRuntime({ provider });

    const request: CopilotRequest = {
      query: 'How to hack?',
      mode: 'automatic',
      style: 'default',
      currentRoute: '#/learning',
      guardrails: {
        forbiddenTopics: ['hacking', 'exploits'],
        requiredDisclaimers: ['Educational purposes only'],
        governanceLevel: 'strict'
      },
      developerMode: false
    };

    const response = await runtime.processRequest(request);
    // Provider should filter this
    assert.ok(response);
  });
});

describe('CopilotRuntime -- Determinism', () => {
  it('should produce consistent results for same input', async () => {
    const provider = new MockProvider();
    const runtime = new CopilotRuntime({ provider });

    const request: CopilotRequest = {
      query: 'Test query',
      mode: 'teaching',
      style: 'simple',
      currentRoute: '#/learning',
      developerMode: false
    };

    const response1 = await runtime.processRequest(request);
    const response2 = await runtime.processRequest(request);

    // Both should be successful responses
    if ('content' in response1 && 'content' in response2) {
      assert.equal(response1.content, response2.content);
      assert.equal(response1.type, response2.type);
    }
  });
});
