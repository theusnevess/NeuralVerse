/**
 * NV-1100-P11 — Generative Provider Abstraction
 * Canonical provider interface for local LLM providers.
 * All providers implement this interface.
 *
 * Philosophy:
 * - Local-only by default
 * - No cloud endpoints
 * - No telemetry
 * - Explicit timeout and abort
 * - Non-canonical output
 */
(function () {
  'use strict';

  var LOCALHOST_PATTERN = /^(localhost|127\.0\.0\.1|::1|0\.0\.0\.0)(:\d+)?(\/.*)?$/;

  function isLocalEndpoint(url) {
    if (typeof url !== 'string') return false;
    try {
      var parsed = new URL(url);
      return LOCALHOST_PATTERN.test(parsed.host + parsed.pathname);
    } catch (e) {
      return LOCALHOST_PATTERN.test(url);
    }
  }

  function validateEndpoint(url) {
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'Endpoint URL is required' };
    }
    if (!isLocalEndpoint(url)) {
      return { valid: false, error: 'Only local model endpoints are allowed in this phase.' };
    }
    return { valid: true };
  }

  function createBaseProvider(config) {
    return {
      id: config.id || 'unknown',
      label: config.label || 'Unknown Provider',
      endpoint: config.endpoint || '',
      type: config.type || 'unknown',
      timeout: typeof config.timeout === 'number' ? config.timeout : 30000
    };
  }

  function buildGenerationRequest(options) {
    return {
      model: options.model || '',
      prompt: options.prompt || '',
      system: options.system || '',
      temperature: typeof options.temperature === 'number' ? options.temperature : 0.2,
      topP: typeof options.topP === 'number' ? options.topP : 0.9,
      maxTokens: typeof options.maxTokens === 'number' ? options.maxTokens : 800,
      seed: options.seed !== undefined ? options.seed : null,
      stream: typeof options.stream === 'boolean' ? options.stream : false,
      abortSignal: options.abortSignal || null
    };
  }

  function createGenerationResult(response) {
    return {
      text: response.text || '',
      model: response.model || '',
      provider: response.provider || '',
      finishReason: response.finishReason || 'stop',
      usage: response.usage || { promptTokens: 0, completionTokens: 0 },
      timestamp: new Date().toISOString(),
      canonical: false,
      source: 'local_generated'
    };
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.GenerativeProvider = {
    isLocalEndpoint: isLocalEndpoint,
    validateEndpoint: validateEndpoint,
    createBaseProvider: createBaseProvider,
    buildGenerationRequest: buildGenerationRequest,
    createGenerationResult: createGenerationResult,
    LOCALHOST_PATTERN: LOCALHOST_PATTERN
  };
})();
