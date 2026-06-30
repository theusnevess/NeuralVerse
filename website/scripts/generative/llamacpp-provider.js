/**
 * NV-1100-P11 — llama.cpp / OpenAI-Compatible Local Provider
 * Supports llama.cpp server and any OpenAI-compatible local server.
 * Default endpoint: http://localhost:8080 (llama.cpp) or http://localhost:1234/v1 (LM Studio)
 */
(function () {
  'use strict';

  var DEFAULT_LLAMACPP_ENDPOINT = 'http://localhost:8080';
  var DEFAULT_OPENAI_COMPAT_ENDPOINT = 'http://localhost:1234/v1';

  function createLlamacppProvider(config) {
    var base = window.NeuralVerse.GenerativeProvider.createBaseProvider({
      id: 'llamacpp',
      label: 'llama.cpp (Local)',
      endpoint: (config && config.endpoint) || DEFAULT_LLAMACPP_ENDPOINT,
      type: 'llamacpp',
      timeout: (config && config.timeout) || 30000
    });

    async function healthCheck() {
      try {
        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, 5000);
        var response = await fetch(base.endpoint + '/v1/models', {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          var data = await response.json();
          return { status: 'connected', models: (data.data || []).length, detail: data };
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
        var response = await fetch(base.endpoint + '/v1/models', {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) return [];
        var data = await response.json();
        return (data.data || []).map(function (m) {
          return {
            id: m.id || m.model,
            name: m.id || m.model,
            ownedBy: m.owned_by || '',
            provider: 'llamacpp'
          };
        });
      } catch (e) {
        return [];
      }
    }

    async function generate(request) {
      var genReq = window.NeuralVerse.GenerativeProvider.buildGenerationRequest(request);
      var messages = [];
      if (genReq.system) {
        messages.push({ role: 'system', content: genReq.system });
      }
      messages.push({ role: 'user', content: genReq.prompt });

      var body = {
        model: genReq.model,
        messages: messages,
        temperature: genReq.temperature,
        top_p: genReq.topP,
        max_tokens: genReq.maxTokens,
        stream: false
      };
      if (genReq.seed !== null && genReq.seed !== undefined) {
        body.seed = genReq.seed;
      }

      try {
        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, base.timeout);
        if (genReq.abortSignal) {
          genReq.abortSignal.addEventListener('abort', function () { controller.abort(); });
        }
        var response = await fetch(base.endpoint + '/v1/chat/completions', {
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
        var choice = (data.choices || [])[0] || {};
        return window.NeuralVerse.GenerativeProvider.createGenerationResult({
          text: (choice.message && choice.message.content) || '',
          model: data.model || genReq.model,
          provider: 'llamacpp',
          finishReason: choice.finish_reason || 'stop',
          usage: {
            promptTokens: (data.usage && data.usage.prompt_tokens) || 0,
            completionTokens: (data.usage && data.usage.completion_tokens) || 0
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

  function createOpenAICompatibleLocalProvider(config) {
    var base = window.NeuralVerse.GenerativeProvider.createBaseProvider({
      id: 'openai-local',
      label: 'OpenAI-Compatible Local',
      endpoint: (config && config.endpoint) || DEFAULT_OPENAI_COMPAT_ENDPOINT,
      type: 'openai-compatible',
      timeout: (config && config.timeout) || 30000
    });

    async function healthCheck() {
      try {
        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, 5000);
        var response = await fetch(base.endpoint + '/models', {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          var data = await response.json();
          return { status: 'connected', models: (data.data || []).length, detail: data };
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
        var response = await fetch(base.endpoint + '/models', {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) return [];
        var data = await response.json();
        return (data.data || []).map(function (m) {
          return {
            id: m.id || '',
            name: m.id || '',
            ownedBy: m.owned_by || '',
            provider: 'openai-local'
          };
        });
      } catch (e) {
        return [];
      }
    }

    async function generate(request) {
      var genReq = window.NeuralVerse.GenerativeProvider.buildGenerationRequest(request);
      var messages = [];
      if (genReq.system) {
        messages.push({ role: 'system', content: genReq.system });
      }
      messages.push({ role: 'user', content: genReq.prompt });

      var body = {
        model: genReq.model,
        messages: messages,
        temperature: genReq.temperature,
        top_p: genReq.topP,
        max_tokens: genReq.maxTokens,
        stream: false
      };
      if (genReq.seed !== null && genReq.seed !== undefined) {
        body.seed = genReq.seed;
      }

      try {
        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, base.timeout);
        if (genReq.abortSignal) {
          genReq.abortSignal.addEventListener('abort', function () { controller.abort(); });
        }
        var response = await fetch(base.endpoint + '/chat/completions', {
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
        var choice = (data.choices || [])[0] || {};
        return window.NeuralVerse.GenerativeProvider.createGenerationResult({
          text: (choice.message && choice.message.content) || '',
          model: data.model || genReq.model,
          provider: 'openai-local',
          finishReason: choice.finish_reason || 'stop',
          usage: {
            promptTokens: (data.usage && data.usage.prompt_tokens) || 0,
            completionTokens: (data.usage && data.usage.completion_tokens) || 0
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
  window.NeuralVerse.createLlamacppProvider = createLlamacppProvider;
  window.NeuralVerse.createOpenAICompatibleLocalProvider = createOpenAICompatibleLocalProvider;
})();
