/**
 * NV-1100-P9B — Parameter Schema
 * Schema validation and parameter building for visualization parameters.
 */
(function () {
  'use strict';

  var VALID_TYPES = ['number', 'integer', 'boolean', 'enum'];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function validateSchema(param) {
    var errors = [];

    if (!param || typeof param !== 'object') {
      return ['Parameter must be an object'];
    }

    if (!param.id || typeof param.id !== 'string') {
      errors.push('Parameter must have a string id');
    }

    if (!param.label || typeof param.label !== 'string') {
      errors.push('Parameter must have a string label');
    }

    if (!param.type || VALID_TYPES.indexOf(param.type) === -1) {
      errors.push('Parameter type must be one of: ' + VALID_TYPES.join(', '));
    }

    if (param.type === 'number' || param.type === 'integer') {
      if (typeof param.min !== 'number') {
        errors.push('Numeric parameter must have min');
      }
      if (typeof param.max !== 'number') {
        errors.push('Numeric parameter must have max');
      }
      if (typeof param.step !== 'number' || param.step <= 0) {
        errors.push('Numeric parameter must have positive step');
      }
      if (typeof param.defaultValue !== 'number' || isNaN(param.defaultValue)) {
        errors.push('Numeric parameter must have a numeric defaultValue');
      }
    }

    if (param.type === 'boolean') {
      if (typeof param.defaultValue !== 'boolean') {
        errors.push('Boolean parameter must have boolean defaultValue');
      }
    }

    if (param.type === 'enum') {
      if (!Array.isArray(param.options) || param.options.length === 0) {
        errors.push('Enum parameter must have non-empty options array');
      }
      if (param.options && param.options.indexOf(param.defaultValue) === -1) {
        errors.push('Enum defaultValue must be in options array');
      }
    }

    return errors;
  }

  function validateAllSchemas(parameterSchema) {
    var errors = [];
    if (!Array.isArray(parameterSchema)) {
      return { valid: false, errors: ['parameterSchema must be an array'] };
    }

    for (var i = 0; i < parameterSchema.length; i++) {
      var paramErrors = validateSchema(parameterSchema[i]);
      for (var e = 0; e < paramErrors.length; e++) {
        errors.push('Parameter[' + i + '] (' + (parameterSchema[i].id || 'unknown') + '): ' + paramErrors[e]);
      }
    }

    return { valid: errors.length === 0, errors: errors };
  }

  function buildDefaultParameters(parameterSchema) {
    var params = {};
    if (!Array.isArray(parameterSchema)) return params;

    for (var i = 0; i < parameterSchema.length; i++) {
      var param = parameterSchema[i];
      params[param.id] = param.defaultValue;
    }

    return params;
  }

  function cloneParameters(params) {
    var clone = {};
    var keys = Object.keys(params);
    for (var i = 0; i < keys.length; i++) {
      clone[keys[i]] = params[keys[i]];
    }
    return clone;
  }

  function serializeParameters(params) {
    return JSON.stringify(params);
  }

  function deserializeParameters(json) {
    if (typeof json !== 'string') return null;
    try {
      var parsed = JSON.parse(json);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function parametersEqual(a, b) {
    if (!a || !b) return false;
    var keysA = Object.keys(a);
    var keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    for (var i = 0; i < keysA.length; i++) {
      var key = keysA[i];
      if (a[key] !== b[key]) return false;
    }
    return true;
  }

  function escapeHtmlForAttribute(value) {
    return escapeHtml(value);
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.ParameterSchema = {
    VALID_TYPES: VALID_TYPES,
    validate: validateSchema,
    validateAll: validateAllSchemas,
    buildDefaults: buildDefaultParameters,
    clone: cloneParameters,
    serialize: serializeParameters,
    deserialize: deserializeParameters,
    equal: parametersEqual
  };
})();
