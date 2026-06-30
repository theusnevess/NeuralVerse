/**
 * NV-1100-P11 — Generative Controller
 * Orchestrates the generative layer: providers, models, generation, guardrails, audit.
 */
(function () {
  'use strict';

  var SETTINGS_KEY = 'nv_generative_settings';

  var _settings = {
    enabled: false,
    provider: 'ollama',
    endpoint: 'http://localhost:11434',
    selectedModel: '',
    profileId: 'gemma-instruct-local',
    privacyLevel: 'current_artifact_only',
    maxTokens: 800,
    temperature: 0.2,
    allowStreaming: false,
    includeMemoryContext: false,
    includeReviewContext: false
  };

  var _activeProvider = null;
  var _abortController = null;
  var _currentResult = null;
  var _isGenerating = false;

  function _loadSettings() {
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        Object.keys(saved).forEach(function (k) {
          if (_settings.hasOwnProperty(k)) _settings[k] = saved[k];
        });
      }
    } catch (e) { /* ignore */ }
  }

  function _saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(_settings));
    } catch (e) { /* ignore */ }
  }

  function init() {
    _loadSettings();
    if (_settings.enabled && _settings.endpoint) {
      _connectProvider();
    }
  }

  function getSettings() {
    return Object.assign({}, _settings);
  }

  function updateSettings(updates) {
    Object.keys(updates).forEach(function (k) {
      if (_settings.hasOwnProperty(k)) _settings[k] = updates[k];
    });
    _saveSettings();
    if (updates.endpoint || updates.provider) {
      _connectProvider();
    }
    window.dispatchEvent(new CustomEvent('nv:generative_settings_updated', { detail: getSettings() }));
  }

  function isEnabled() { return _settings.enabled; }

  function _connectProvider() {
    var validation = window.NeuralVerse.GenerativeProvider.validateEndpoint(_settings.endpoint);
    if (!validation.valid) {
      _activeProvider = null;
      return { status: 'error', error: validation.error };
    }

    switch (_settings.provider) {
      case 'ollama':
        _activeProvider = window.NeuralVerse.createOllamaProvider({ endpoint: _settings.endpoint });
        break;
      case 'llamacpp':
        _activeProvider = window.NeuralVerse.createLlamacppProvider({ endpoint: _settings.endpoint });
        break;
      case 'openai-local':
        _activeProvider = window.NeuralVerse.createOpenAICompatibleLocalProvider({ endpoint: _settings.endpoint });
        break;
      default:
        _activeProvider = null;
        return { status: 'error', error: 'Unknown provider: ' + _settings.provider };
    }
    return { status: 'connected' };
  }

  async function healthCheck() {
    if (!_activeProvider) {
      var result = _connectProvider();
      if (result.status === 'error') return { status: 'disconnected', error: result.error };
    }
    if (!_activeProvider) return { status: 'disconnected', error: 'No provider configured' };
    return _activeProvider.healthCheck();
  }

  async function listModels() {
    if (!_activeProvider) {
      var result = _connectProvider();
      if (result.status === 'error') return [];
    }
    if (!_activeProvider) return [];
    return _activeProvider.listModels();
  }

  async function generate(mode, contextSources, userQuery) {
    if (!_settings.enabled) return { error: 'Generative layer is disabled', text: '' };
    if (!_activeProvider) {
      var conn = _connectProvider();
      if (conn.status === 'error') return { error: conn.error, text: '' };
    }
    if (!_activeProvider) return { error: 'No provider available', text: '' };

    _isGenerating = true;
    _abortController = new AbortController();

    try {
      var contextPack = window.NeuralVerse.ContextPackBuilder.buildContextPack(contextSources, _settings.privacyLevel);
      var prompt = window.NeuralVerse.PromptContracts.buildPrompt(mode, contextPack, userQuery);

      var request = {
        model: _settings.selectedModel,
        prompt: prompt,
        temperature: _settings.temperature,
        maxTokens: _settings.maxTokens,
        abortSignal: _abortController.signal
      };

      var result = await _activeProvider.generate(request);

      if (result.aborted) {
        _isGenerating = false;
        return { error: 'Generation aborted', text: '', aborted: true };
      }

      if (result.error) {
        _isGenerating = false;
        return result;
      }

      var guardrails = window.NeuralVerse.GenerativeGuardrails.checkGuardrails(result.text);
      var outputClass = window.NeuralVerse.OutputClassifier.classify(mode, result.text);

      window.NeuralVerse.GenerationAuditLog.log({
        provider: _settings.provider,
        model: _settings.selectedModel,
        mode: mode,
        contextPackTypes: contextPack.map(function (p) { return p.type; }),
        privacyLevel: _settings.privacyLevel,
        outputClass: outputClass.id,
        blocked: guardrails.blocked,
        blockedReasons: guardrails.blocks.map(function (b) { return b.reason; }),
        warningCount: guardrails.warnings.length
      });

      _isGenerating = false;
      _currentResult = {
        text: guardrails.blocked ? '' : result.text,
        model: result.model,
        provider: result.provider,
        outputClass: outputClass,
        guardrails: guardrails,
        canonical: false,
        source: 'local_generated'
      };

      return _currentResult;
    } catch (e) {
      _isGenerating = false;
      return { error: e.message || 'Generation failed', text: '' };
    }
  }

  function abort() {
    if (_abortController) {
      _abortController.abort();
      _abortController = null;
    }
    _isGenerating = false;
  }

  function isGenerating() { return _isGenerating; }
  function getCurrentResult() { return _currentResult; }
  function getActiveProvider() { return _activeProvider; }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.GenerativeController = {
    init: init,
    getSettings: getSettings,
    updateSettings: updateSettings,
    isEnabled: isEnabled,
    healthCheck: healthCheck,
    listModels: listModels,
    generate: generate,
    abort: abort,
    isGenerating: isGenerating,
    getCurrentResult: getCurrentResult,
    getActiveProvider: getActiveProvider,
    SETTINGS_KEY: SETTINGS_KEY
  };
})();
