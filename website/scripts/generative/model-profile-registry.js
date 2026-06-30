/**
 * NV-1100-P11 — Model Profile Registry
 * Manages model profiles for different use cases.
 * Profiles define recommended models, memory requirements, and generation defaults.
 */
(function () {
  'use strict';

  var PROFILES = [
    {
      id: 'qwen-coder-local',
      label: 'Qwen Coder Local',
      recommendedModels: ['qwen3-coder-next', 'qwen3.5-coder', 'qwen3.5-9b-instruct'],
      purpose: 'coding-agentic',
      description: 'Code explanation, implementation prompts, agentic planning, structured JSON outputs',
      minMemoryGB: 16,
      preferredQuantization: 'Q4_K_M or better',
      contextWindow: 'runtime-detected',
      supportsStructuredOutput: true,
      supportsToolUse: 'runtime-dependent',
      riskLevel: 'medium',
      defaultGeneration: { temperature: 0.2, maxTokens: 900 }
    },
    {
      id: 'deepseek-r1-distill-local',
      label: 'DeepSeek R1 Distill Local',
      recommendedModels: ['deepseek-r1-distill-qwen-14b', 'deepseek-r1-distill-qwen-32b'],
      purpose: 'reasoning',
      description: 'Mathematical reasoning, conceptual reasoning, multi-step explanations, audit reasoning',
      minMemoryGB: 16,
      preferredQuantization: 'Q4_K_M or better',
      contextWindow: 'runtime-detected',
      supportsStructuredOutput: true,
      supportsToolUse: false,
      riskLevel: 'low',
      defaultGeneration: { temperature: 0.1, maxTokens: 1200 }
    },
    {
      id: 'gemma-instruct-local',
      label: 'Gemma Instruct Local',
      recommendedModels: ['gemma-3-12b-it', 'gemma-3-4b-it', 'gemma-4-it'],
      purpose: 'general',
      description: 'Summaries, basic clarification, rewriting, quick Q&A, concise explanations',
      minMemoryGB: 8,
      preferredQuantization: 'Q4_K_M or better',
      contextWindow: 'runtime-detected',
      supportsStructuredOutput: true,
      supportsToolUse: false,
      riskLevel: 'low',
      defaultGeneration: { temperature: 0.3, maxTokens: 600 }
    },
    {
      id: 'neuralverse-didactic-future',
      label: 'NeuralVerse Didactic (Future)',
      recommendedModels: ['neuralverse-didactic-local'],
      purpose: 'didactic',
      description: 'Future fine-tuned model for NeuralVerse tone and governance awareness',
      minMemoryGB: 16,
      preferredQuantization: 'Q4_K_M or better',
      contextWindow: 'runtime-detected',
      supportsStructuredOutput: true,
      supportsToolUse: 'runtime-dependent',
      riskLevel: 'low',
      defaultGeneration: { temperature: 0.2, maxTokens: 800 },
      isFuture: true
    },
    {
      id: 'custom-local-openai-compatible',
      label: 'Custom Local (OpenAI-Compatible)',
      recommendedModels: [],
      purpose: 'custom',
      description: 'Any local model served via OpenAI-compatible API (llama.cpp, LM Studio, etc.)',
      minMemoryGB: 4,
      preferredQuantization: 'any',
      contextWindow: 'runtime-detected',
      supportsStructuredOutput: 'runtime-dependent',
      supportsToolUse: 'runtime-dependent',
      riskLevel: 'medium',
      defaultGeneration: { temperature: 0.2, maxTokens: 800 }
    }
  ];

  var _profiles = {};
  PROFILES.forEach(function (p) { _profiles[p.id] = p; });

  function getAll() { return PROFILES.slice(); }
  function get(id) { return _profiles[id] || null; }
  function getByPurpose(purpose) {
    return PROFILES.filter(function (p) { return p.purpose === purpose; });
  }
  function getDefault() { return _profiles['gemma-instruct-local']; }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.ModelProfileRegistry = {
    getAll: getAll,
    get: get,
    getByPurpose: getByPurpose,
    getDefault: getDefault,
    PROFILES: PROFILES
  };
})();
