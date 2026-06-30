/**
 * NV-1100-P7 — Laboratory Definition Schema
 * Canonical schema and validation for laboratory definitions.
 */

(function () {
  'use strict';

  const LAB_SCHEMA_VERSION = 1;

  const VALID_PARAMETER_TYPES = [
    'slider', 'integer', 'float', 'boolean',
    'select', 'enum', 'text', 'vector', 'matrix'
  ];

  const VALID_VISUALIZATION_TYPES = [
    'line-chart', 'scatter-plot', 'bar-chart',
    'matrix', 'confusion-matrix', 'heatmap',
    'table', 'svg-diagram', 'numeric-summary'
  ];

  const VALID_CANONICAL_STATUSES = ['Draft', 'Reviewed', 'Approved', 'draft', 'reviewed', 'approved'];

  function validateParameterSchema(param) {
    const errors = [];
    if (!param || typeof param !== 'object') {
      errors.push('Parameter must be an object');
      return errors;
    }
    if (!param.id && !param.name) {
      errors.push('Parameter must have an id or name');
    }
    if (!param.type || !VALID_PARAMETER_TYPES.includes(param.type)) {
      errors.push('Parameter type must be one of: ' + VALID_PARAMETER_TYPES.join(', '));
    }
    if (!param.label || typeof param.label !== 'string') {
      errors.push('Parameter must have a string label');
    }
    if (param.default === undefined || param.default === null) {
      errors.push('Parameter must have a default value');
    }
    if (param.type === 'slider' || param.type === 'integer' || param.type === 'float') {
      if (typeof param.min !== 'number' || typeof param.max !== 'number') {
        errors.push('Numeric parameters must have min and max');
      }
      if (typeof param.step !== 'number' || param.step <= 0) {
        errors.push('Numeric parameters must have a positive step');
      }
    }
    if (param.type === 'select' || param.type === 'enum') {
      if (!Array.isArray(param.options) || param.options.length === 0) {
        errors.push('Select/enum parameters must have non-empty options array');
      }
    }
    if (param.type === 'vector') {
      if (typeof param.size !== 'number' || param.size < 1 || param.size > 16) {
        errors.push('Vector parameters must have size between 1 and 16');
      }
    }
    if (param.type === 'matrix') {
      if (!Array.isArray(param.shape) || param.shape.length !== 2) {
        errors.push('Matrix parameters must have a shape array of length 2');
      }
    }
    return errors;
  }

  function validateLabDefinition(lab) {
    const errors = [];
    if (!lab || typeof lab !== 'object') {
      return ['Laboratory definition must be an object'];
    }
    if (!lab.id || typeof lab.id !== 'string') {
      errors.push('Lab must have a string id');
    }
    if (!lab.slug || typeof lab.slug !== 'string') {
      errors.push('Lab must have a string slug');
    }
    if (!lab.title || typeof lab.title !== 'string') {
      errors.push('Lab must have a string title');
    }
    if (!lab.summary || typeof lab.summary !== 'string') {
      errors.push('Lab must have a string summary');
    }
    if (!lab.category || typeof lab.category !== 'string') {
      errors.push('Lab must have a string category');
    }
    if (!Array.isArray(lab.parameterSchema)) {
      errors.push('Lab must have a parameterSchema array');
    } else {
      lab.parameterSchema.forEach(function (param, idx) {
        var paramErrors = validateParameterSchema(param);
        paramErrors.forEach(function (e) {
          errors.push('Parameter[' + idx + ']: ' + e);
        });
      });
    }
    if (lab.initialState === undefined) {
      errors.push('Lab must have an initialState');
    }
    if (typeof lab.execute !== 'function') {
      errors.push('Lab must have an execute() function');
    }
    if (!lab.visualization || typeof lab.visualization !== 'object') {
      errors.push('Lab must have a visualization config object');
    }
    if (lab.visualization) {
      if (!lab.visualization.type || !VALID_VISUALIZATION_TYPES.includes(lab.visualization.type)) {
        errors.push('Visualization type must be one of: ' + VALID_VISUALIZATION_TYPES.join(', '));
      }
    }
    if (!lab.canonicalStatus || !VALID_CANONICAL_STATUSES.includes(lab.canonicalStatus)) {
      errors.push('Lab must have a valid canonicalStatus');
    }
    if (!lab.version || typeof lab.version !== 'string') {
      errors.push('Lab must have a string version');
    }
    if (!Array.isArray(lab.artifactReferences)) {
      errors.push('Lab must have an artifactReferences array');
    }
    if (!Array.isArray(lab.conceptReferences)) {
      errors.push('Lab must have a conceptReferences array');
    }
    return errors;
  }

  function createLabDefinition(config) {
    var lab = {
      id: config.id,
      slug: config.slug,
      title: config.title,
      summary: config.summary || '',
      category: config.category || 'general',
      artifactReferences: config.artifactReferences || [],
      conceptReferences: config.conceptReferences || [],
      parameterSchema: config.parameterSchema || [],
      initialState: config.initialState || {},
      execute: config.execute,
      visualization: config.visualization || { type: 'numeric-summary' },
      canonicalStatus: config.canonicalStatus || 'Reviewed',
      version: config.version || '1.0.0',
      reviewedBy: config.reviewedBy || '',
      lastReviewed: config.lastReviewed || new Date().toISOString(),
      estimatedDuration: config.estimatedDuration || '5-10 minutes'
    };
    return lab;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.LabDefinition = {
    SCHEMA_VERSION: LAB_SCHEMA_VERSION,
    VALID_PARAMETER_TYPES: VALID_PARAMETER_TYPES,
    VALID_VISUALIZATION_TYPES: VALID_VISUALIZATION_TYPES,
    validate: validateLabDefinition,
    validateParameter: validateParameterSchema,
    create: createLabDefinition
  };

})();
