/**
 * NV-1100-P9B — Parameter Engine
 * Deterministic parameter validation, clamping, and normalization.
 * No hidden randomness, no Date-based computation, no random API.
 */
(function () {
  'use strict';

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function roundToStep(value, step) {
    if (step <= 0) return value;
    return Math.round(value / step) * step;
  }

  function isFiniteNumber(value) {
    return typeof value === 'number' && isFinite(value) && !isNaN(value);
  }

  function validateType(value, expectedType) {
    switch (expectedType) {
      case 'number':
        return isFiniteNumber(value);
      case 'integer':
        return isFiniteNumber(value) && Math.floor(value) === value;
      case 'boolean':
        return typeof value === 'boolean';
      case 'enum':
        return typeof value === 'string';
      default:
        return false;
    }
  }

  function validateParameterValue(schema, value) {
    if (!schema || typeof schema !== 'object') {
      return { valid: false, error: 'Unknown parameter schema' };
    }

    if (value === undefined || value === null) {
      return { valid: true, value: schema.defaultValue };
    }

    switch (schema.type) {
      case 'number': {
        var num = Number(value);
        if (!isFiniteNumber(num)) {
          return { valid: false, error: 'Value must be a finite number' };
        }
        var clamped = clamp(num, schema.min, schema.max);
        var rounded = roundToStep(clamped, schema.step || 0.01);
        return { valid: true, value: rounded };
      }

      case 'integer': {
        var intVal = Number(value);
        if (!isFiniteNumber(intVal)) {
          return { valid: false, error: 'Value must be a finite integer' };
        }
        var roundedInt = Math.round(intVal);
        var clampedInt = clamp(roundedInt, schema.min, schema.max);
        return { valid: true, value: clampedInt };
      }

      case 'boolean': {
        if (typeof value === 'string') {
          if (value === 'true' || value === '1') return { valid: true, value: true };
          if (value === 'false' || value === '0') return { valid: true, value: false };
          return { valid: false, error: 'Invalid boolean string' };
        }
        return { valid: true, value: !!value };
      }

      case 'enum': {
        if (!schema.options || !Array.isArray(schema.options)) {
          return { valid: false, error: 'Enum has no options defined' };
        }
        if (schema.options.indexOf(value) === -1) {
          return { valid: false, error: 'Value must be one of: ' + schema.options.join(', ') };
        }
        return { valid: true, value: value };
      }

      default:
        return { valid: false, error: 'Unknown parameter type: ' + schema.type };
    }
  }

  function validateAllParameters(parameterSchema, params) {
    var errors = [];
    var normalized = {};

    if (!Array.isArray(parameterSchema)) {
      return { valid: true, params: {}, errors: [] };
    }

    for (var i = 0; i < parameterSchema.length; i++) {
      var schema = parameterSchema[i];
      var key = schema.id;
      var value = params && params[key] !== undefined ? params[key] : schema.defaultValue;

      var result = validateParameterValue(schema, value);

      if (!result.valid) {
        errors.push(key + ': ' + result.error);
        normalized[key] = schema.defaultValue;
      } else {
        normalized[key] = result.value;
      }
    }

    return {
      valid: errors.length === 0,
      params: normalized,
      errors: errors
    };
  }

  function sanitizeParameters(parameterSchema, params) {
    return validateAllParameters(parameterSchema, params).params;
  }

  function rejectPrototypePollution(obj) {
    if (!obj || typeof obj !== 'object') return true;
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return false;
      }
    }
    return true;
  }

  function buildDefaults(definition) {
    if (!definition) return {};
    var schema = definition.parameterSchema;
    var defaults = {};

    if (definition.defaultParameters && typeof definition.defaultParameters === 'object') {
      var defKeys = Object.keys(definition.defaultParameters);
      for (var i = 0; i < defKeys.length; i++) {
        defaults[defKeys[i]] = definition.defaultParameters[defKeys[i]];
      }
      return defaults;
    }

    if (Array.isArray(schema)) {
      for (var j = 0; j < schema.length; j++) {
        defaults[schema[j].id] = schema[j].defaultValue;
      }
    }

    return defaults;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.VizParameterEngine = {
    clamp: clamp,
    roundToStep: roundToStep,
    isFiniteNumber: isFiniteNumber,
    validateType: validateType,
    validate: validateParameterValue,
    validateAll: validateAllParameters,
    sanitize: sanitizeParameters,
    rejectPrototypePollution: rejectPrototypePollution,
    buildDefaults: buildDefaults
  };
})();
