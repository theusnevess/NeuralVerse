/**
 * NV-1100-P7 — Parameter Engine
 * Validates, normalizes, and manages laboratory parameters.
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

  function buildDefaultParameters(parameterSchema) {
    var params = {};
    if (!Array.isArray(parameterSchema)) return params;
    parameterSchema.forEach(function (schema) {
      var key = schema.id || schema.name;
      params[key] = schema.default;
    });
    return params;
  }

  function validateParameterValue(schema, value) {
    if (!schema) return { valid: false, error: 'Unknown parameter schema' };

    switch (schema.type) {
      case 'slider':
      case 'integer':
      case 'float': {
        var num = Number(value);
        if (isNaN(num)) return { valid: false, error: 'Value must be a number' };
        var clamped = clamp(num, schema.min, schema.max);
        var rounded = roundToStep(clamped, schema.step || 1);
        return { valid: true, value: rounded };
      }
      case 'boolean': {
        return { valid: true, value: !!value };
      }
      case 'select':
      case 'enum': {
        if (!schema.options || schema.options.indexOf(value) === -1) {
          return { valid: false, error: 'Value must be one of: ' + (schema.options || []).join(', ') };
        }
        return { valid: true, value: value };
      }
      case 'text': {
        var str = String(value || '');
        if (schema.maxLength && str.length > schema.maxLength) {
          str = str.substring(0, schema.maxLength);
        }
        if (schema.pattern) {
          try {
            var regex = new RegExp(schema.pattern);
            if (!regex.test(str)) {
              return { valid: false, error: 'Text does not match pattern: ' + schema.pattern };
            }
          } catch (e) {
            // Invalid regex in schema, skip validation
          }
        }
        return { valid: true, value: str };
      }
      case 'vector': {
        var size = schema.size || 2;
        if (!Array.isArray(value)) {
          value = new Array(size).fill(0);
        }
        var vec = value.slice(0, size);
        while (vec.length < size) vec.push(0);
        for (var i = 0; i < vec.length; i++) {
          vec[i] = Number(vec[i]) || 0;
        }
        return { valid: true, value: vec };
      }
      case 'matrix': {
        var shape = schema.shape || [2, 2];
        var rows = shape[0] || 2;
        var cols = shape[1] || 2;
        var mat = [];
        for (var r = 0; r < rows; r++) {
          var row = [];
          for (var c = 0; c < cols; c++) {
            if (Array.isArray(value) && Array.isArray(value[r])) {
              row.push(Number(value[r][c]) || 0);
            } else {
              row.push(0);
            }
          }
          mat.push(row);
        }
        return { valid: true, value: mat };
      }
      default:
        return { valid: false, error: 'Unknown parameter type: ' + schema.type };
    }
  }

  function validateAllParameters(parameterSchema, params) {
    var errors = [];
    var normalized = {};
    if (!Array.isArray(parameterSchema)) return { valid: true, params: {}, errors: [] };

    parameterSchema.forEach(function (schema) {
      var key = schema.id || schema.name;
      var value = params[key] !== undefined ? params[key] : schema.default;
      var result = validateParameterValue(schema, value);
      if (!result.valid) {
        errors.push(key + ': ' + result.error);
        normalized[key] = schema.default;
      } else {
        normalized[key] = result.value;
      }
    });

    return {
      valid: errors.length === 0,
      params: normalized,
      errors: errors
    };
  }

  function sanitizeParameters(parameterSchema, params) {
    return validateAllParameters(parameterSchema, params).params;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.ParameterEngine = {
    buildDefaults: buildDefaultParameters,
    validate: validateParameterValue,
    validateAll: validateAllParameters,
    sanitize: sanitizeParameters,
    clamp: clamp,
    roundToStep: roundToStep
  };

})();
