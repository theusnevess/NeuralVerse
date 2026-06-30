/**
 * NV-1100-P11 — Ollama Provider
 * Local Ollama API provider implementation.
 * Endpoint: http://localhost:11434
 */
(function () {
  'use strict';

  var DEFAULT_ENDPOINT = 'http://localhost:11434';

  function createOllamaProvider(config) {
    var base = window.NeuralVerse.GenerativeProvider.createBaseProvider({
      id: 'ollama',
      label: 'Ollama (Local)',
      endpoint: (config && config.endpoint) || DEFAULT_ENDPOINT,
      type: 'ollama',
      timeout: (config && config.timeout) || 30000
    });

    async function healthCheck() {
      try {
        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, 5000);
        var response = await fetch(base.endpoint + '/api/tags', {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          var data = await response.json();
          return { status: 'connected', models: (data.models || []).length, detail: data };
        }
        return { status: 'error', error: 'HTTP ' + response.status };
      } catch (e) {
        return { status: 'disconnected', error: e.message || 'Connection failed' };
      }
    }

    async function listModels() {
      try {
        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, 10000);
        var response = await fetch(base.endpoint + '/api/tags', {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) return [];
        var data = await response.json();
        return (data.models || []).map(function (m) {
          return {
            id: m.name || m.model,
            name: m.name || m.model,
            size: m.size || 0,
            parameterSize: m.parameter_size || '',
            quantization: m.quantization_level || '',
            family: m.family || '',
            provider: 'ollama'
          };
        });
      } catch (e) {
        return [];
      }
    }

    async function generate(request) {
      var genReq = window.NeuralVerse.GenerativeProvider.buildGenerationRequest(request);
      var body = {
        model: genReq.model,
        prompt: genReq.prompt,
        stream: false,
        options: {
          temperature: genReq.temperature,
          top_p: genReq.topP,
          num_predict: genReq.maxTokens
        }
      };
      if (genReq.system) {
        body.system = genReq.system;
      }
      if (genReq.seed !== null && genReq.seed !== undefined) {
        body.options.seed = genReq.seed;
      }

      try {
        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, base.timeout);
        if (genReq.abortSignal) {
          genReq.abortSignal.addEventListener('abort', function () { controller.abort(); });
        }
        var response = await fetch(base.endpoint + '/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          return { error: 'HTTP ' + response.status, text: '' };
        }
        var data = await response.json();
        return window.NeuralVerse.GenerativeProvider.createGenerationResult({
          text: data.response || '',
          model: data.model || genReq.model,
          provider: 'ollama',
          finishReason: data.done ? 'stop' : 'length',
          usage: {
            promptTokens: data.prompt_eval_count || 0,
            completionTokens: data.eval_count || 0
          }
        });
      } catch (e) {
        if (e.name === 'AbortError') {
          return { error: 'Generation aborted', text: '', aborted: true };
        }
        return { error: e.message || 'Generation failed', text: '' };
      }
    }

    return Object.assign({}, base, {
      healthCheck: healthCheck,
      listModels: listModels,
      generate: generate
    });
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createOllamaProvider = createOllamaProvider;
})();
