import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { compilePrompt } from './PromptCompiler.ts';
import type { PromptCompilationContext } from './PromptCompiler.ts';

describe('PromptCompiler -- Core', () => {
  it('should compile a basic prompt', () => {
    const context: PromptCompilationContext = {
      userQuery: 'Explain neural networks',
      mode: 'automatic',
      style: 'default',
      currentRoute: '#/learning',
      agentOutputs: [],
      guardrails: {
        forbiddenTopics: [],
        requiredDisclaimers: [],
        governanceLevel: 'standard'
      },
      developerMode: false,
      requestId: 'test-001'
    };

    const result = compilePrompt(context);

    assert.ok(result.messages.length > 0);
    assert.equal(result.model, 'mock-model');
    assert.equal(result.metadata.requestId, 'test-001');
    assert.equal(result.metadata.mode, 'automatic');
    assert.equal(result.metadata.style, 'default');
  });

  it('should include system instructions', () => {
    const context: PromptCompilationContext = {
      userQuery: 'Test',
      mode: 'teaching',
      style: 'simple',
      currentRoute: '#/learning',
      agentOutputs: [],
      guardrails: {
        forbiddenTopics: [],
        requiredDisclaimers: [],
        governanceLevel: 'standard'
      },
      developerMode: false,
      requestId: 'test-002'
    };

    const result = compilePrompt(context);
    const systemMessage = result.messages.find(m => m.role === 'system');

    assert.ok(systemMessage);
    assert.ok(systemMessage.content.includes('NeuralVerse AI'));
    assert.ok(systemMessage.content.includes('step-by-step'));
  });

  it('should include user message', () => {
    const context: PromptCompilationContext = {
      userQuery: 'What is backpropagation?',
      mode: 'automatic',
      style: 'default',
      currentRoute: '#/learning',
      agentOutputs: [],
      guardrails: {
        forbiddenTopics: [],
        requiredDisclaimers: [],
        governanceLevel: 'standard'
      },
      developerMode: false,
      requestId: 'test-003'
    };

    const result = compilePrompt(context);
    const userMessage = result.messages.find(m => m.role === 'user');

    assert.ok(userMessage);
    assert.equal(userMessage.content, 'What is backpropagation?');
  });
});

describe('PromptCompiler -- Modes', () => {
  const modes = ['automatic', 'teaching', 'research', 'practice', 'engineering', 'visual', 'knowledge', 'advanced'] as const;

  for (const mode of modes) {
    it(`should handle ${mode} mode`, () => {
      const context: PromptCompilationContext = {
        userQuery: 'Test',
        mode,
        style: 'default',
        currentRoute: '#/learning',
        agentOutputs: [],
        guardrails: {
          forbiddenTopics: [],
          requiredDisclaimers: [],
          governanceLevel: 'standard'
        },
        developerMode: false,
        requestId: `test-${mode}`
      };

      const result = compilePrompt(context);
      assert.equal(result.metadata.mode, mode);
      assert.ok(result.messages.length > 0);
    });
  }
});

describe('PromptCompiler -- Styles', () => {
  const styles = ['default', 'simple', 'detailed', 'mathematical', 'engineering', 'research', 'visual', 'socratic'] as const;

  for (const style of styles) {
    it(`should handle ${style} style`, () => {
      const context: PromptCompilationContext = {
        userQuery: 'Test',
        mode: 'automatic',
        style,
        currentRoute: '#/learning',
        agentOutputs: [],
        guardrails: {
          forbiddenTopics: [],
          requiredDisclaimers: [],
          governanceLevel: 'standard'
        },
        developerMode: false,
        requestId: `test-${style}`
      };

      const result = compilePrompt(context);
      assert.equal(result.metadata.style, style);
    });
  }
});

describe('PromptCompiler -- Context', () => {
  it('should include lesson context when provided', () => {
    const context: PromptCompilationContext = {
      userQuery: 'Test',
      mode: 'automatic',
      style: 'default',
      currentRoute: '#/learning',
      currentLesson: {
        pathId: 'ml-path',
        pathTitle: 'Machine Learning',
        moduleId: 'dl-module',
        moduleTitle: 'Deep Learning',
        lessonId: 'nn-lesson',
        lessonTitle: 'Neural Networks',
        difficulty: 'intermediate',
        progress: '50%'
      },
      agentOutputs: [],
      guardrails: {
        forbiddenTopics: [],
        requiredDisclaimers: [],
        governanceLevel: 'standard'
      },
      developerMode: false,
      requestId: 'test-context'
    };

    const result = compilePrompt(context);
    const systemMessages = result.messages.filter(m => m.role === 'system');
    const contextMessage = systemMessages.find(m => m.content.includes('Machine Learning'));

    assert.ok(contextMessage, 'Should include lesson context');
  });

  it('should include agent outputs when provided', () => {
    const context: PromptCompilationContext = {
      userQuery: 'Test',
      mode: 'automatic',
      style: 'default',
      currentRoute: '#/learning',
      agentOutputs: [
        {
          agentId: 'didactic-architecture',
          agentName: 'Didactic Agent',
          output: 'Neural networks are computational models.',
          confidence: 'high'
        }
      ],
      guardrails: {
        forbiddenTopics: [],
        requiredDisclaimers: [],
        governanceLevel: 'standard'
      },
      developerMode: false,
      requestId: 'test-agents'
    };

    const result = compilePrompt(context);
    const systemMessages = result.messages.filter(m => m.role === 'system');
    const agentMessage = systemMessages.find(m => m.content.includes('Didactic Agent'));

    assert.ok(agentMessage, 'Should include agent outputs');
  });

  it('should include guardrails when provided', () => {
    const context: PromptCompilationContext = {
      userQuery: 'Test',
      mode: 'automatic',
      style: 'default',
      currentRoute: '#/learning',
      agentOutputs: [],
      guardrails: {
        forbiddenTopics: ['hacking'],
        requiredDisclaimers: ['Educational purposes only'],
        governanceLevel: 'strict'
      },
      developerMode: false,
      requestId: 'test-guardrails'
    };

    const result = compilePrompt(context);
    const systemMessages = result.messages.filter(m => m.role === 'system');
    const guardrailMessage = systemMessages.find(m => m.content.includes('hacking'));

    assert.ok(guardrailMessage, 'Should include guardrails');
  });
});

describe('PromptCompiler -- Developer Mode', () => {
  it('should include developer constraints when enabled', () => {
    const context: PromptCompilationContext = {
      userQuery: 'Test',
      mode: 'automatic',
      style: 'default',
      currentRoute: '#/learning',
      agentOutputs: [],
      guardrails: {
        forbiddenTopics: [],
        requiredDisclaimers: [],
        governanceLevel: 'standard'
      },
      developerMode: true,
      requestId: 'test-dev'
    };

    const result = compilePrompt(context);
    const systemMessages = result.messages.filter(m => m.role === 'system');
    const devMessage = systemMessages.find(m => m.content.includes('Developer Mode'));

    assert.ok(devMessage, 'Should include developer constraints');
    assert.ok(result.metadata.promptSections.includes('developer'));
  });
});

describe('PromptCompiler -- Determinism', () => {
  it('should produce identical output for same input', () => {
    const context: PromptCompilationContext = {
      userQuery: 'Test query',
      mode: 'teaching',
      style: 'simple',
      currentRoute: '#/learning',
      agentOutputs: [],
      guardrails: {
        forbiddenTopics: [],
        requiredDisclaimers: [],
        governanceLevel: 'standard'
      },
      developerMode: false,
      requestId: 'test-determinism'
    };

    const result1 = compilePrompt(context);
    const result2 = compilePrompt(context);

    // Messages should be identical (except timestamp in metadata)
    assert.equal(result1.messages.length, result2.messages.length);
    assert.equal(result1.messages[0].content, result2.messages[0].content);
    assert.equal(result1.messages[1].content, result2.messages[1].content);
    assert.equal(result1.model, result2.model);
  });
});
