/**
 * NeuralVerse Memory Schema
 * Validates and creates memory items with strict schema enforcement.
 * Self-contained IIFE. No eval, no Function, no external requests.
 */
(function () {
  'use strict';

  var VALID_TYPES = [
    'note',
    'bookmark',
    'highlight',
    'collection',
    'workspace',
    'laboratory',
    'review',
    'search',
    'custom'
  ];

  var REQUIRED_FIELDS = ['id', 'type', 'title', 'createdAt', 'updatedAt'];

  var _idCounter = 0;

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isIsoDate(str) {
    if (typeof str !== 'string') return false;
    var parsed = new Date(str);
    if (isNaN(parsed.getTime())) return false;
    return str === parsed.toISOString();
  }

  function generateId() {
    _idCounter += 1;
    var timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
    return 'mem_' + timestamp + '_' + String(_idCounter).padStart(4, '0');
  }

  function validate(item) {
    var errors = [];

    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      return { valid: false, errors: ['Item must be a non-null object.'] };
    }

    for (var i = 0; i < REQUIRED_FIELDS.length; i++) {
      var field = REQUIRED_FIELDS[i];
      if (!(field in item)) {
        errors.push('Missing required field: ' + field);
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors: errors };
    }

    if (typeof item.id !== 'string' || item.id.length === 0) {
      errors.push('Field "id" must be a non-empty string.');
    }

    if (typeof item.type !== 'string' || VALID_TYPES.indexOf(item.type) === -1) {
      errors.push('Field "type" must be one of: ' + VALID_TYPES.join(', '));
    }

    if (typeof item.title !== 'string' || item.title.length === 0) {
      errors.push('Field "title" must be a non-empty string.');
    }

    if ('summary' in item && typeof item.summary !== 'string') {
      errors.push('Field "summary" must be a string if provided.');
    }

    if ('content' in item && typeof item.content !== 'string') {
      errors.push('Field "content" must be a string if provided.');
    }

    if ('tags' in item) {
      if (!Array.isArray(item.tags)) {
        errors.push('Field "tags" must be an array if provided.');
      } else {
        for (var t = 0; t < item.tags.length; t++) {
          if (typeof item.tags[t] !== 'string') {
            errors.push('Each tag must be a string.');
            break;
          }
        }
      }
    }

    if ('relatedArtifacts' in item) {
      if (!Array.isArray(item.relatedArtifacts)) {
        errors.push('Field "relatedArtifacts" must be an array if provided.');
      } else {
        for (var a = 0; a < item.relatedArtifacts.length; a++) {
          if (typeof item.relatedArtifacts[a] !== 'string') {
            errors.push('Each relatedArtifact must be a string.');
            break;
          }
        }
      }
    }

    if ('relatedConcepts' in item) {
      if (!Array.isArray(item.relatedConcepts)) {
        errors.push('Field "relatedConcepts" must be an array if provided.');
      } else {
        for (var c = 0; c < item.relatedConcepts.length; c++) {
          if (typeof item.relatedConcepts[c] !== 'string') {
            errors.push('Each relatedConcept must be a string.');
            break;
          }
        }
      }
    }

    if (!isIsoDate(item.createdAt)) {
      errors.push('Field "createdAt" must be a valid ISO 8601 date string.');
    }

    if (!isIsoDate(item.updatedAt)) {
      errors.push('Field "updatedAt" must be a valid ISO 8601 date string.');
    }

    if ('pinned' in item && typeof item.pinned !== 'boolean') {
      errors.push('Field "pinned" must be a boolean if provided.');
    }

    if ('archived' in item && typeof item.archived !== 'boolean') {
      errors.push('Field "archived" must be a boolean if provided.');
    }

    if ('source' in item && typeof item.source !== 'string') {
      errors.push('Field "source" must be a string if provided.');
    }

    if ('version' in item && typeof item.version !== 'string') {
      errors.push('Field "version" must be a string if provided.');
    }

    return { valid: errors.length === 0, errors: errors };
  }

  function validateAll(items) {
    if (!Array.isArray(items)) {
      return { valid: false, errors: ['Input must be an array of items.'] };
    }

    var allErrors = [];
    var seenIds = {};

    for (var i = 0; i < items.length; i++) {
      var result = validate(items[i]);
      if (!result.valid) {
        for (var e = 0; e < result.errors.length; e++) {
          allErrors.push('Item at index ' + i + ': ' + result.errors[e]);
        }
      }

      if (items[i] && typeof items[i].id === 'string') {
        if (seenIds[items[i].id]) {
          allErrors.push('Duplicate id found: ' + items[i].id);
        }
        seenIds[items[i].id] = true;
      }
    }

    return { valid: allErrors.length === 0, errors: allErrors };
  }

  function create(partial) {
    var now = new Date().toISOString();
    var item = {
      id: (partial && partial.id) || generateId(),
      type: (partial && partial.type) || 'note',
      title: (partial && partial.title) || '',
      summary: (partial && partial.summary) || '',
      content: (partial && partial.content) || '',
      tags: (partial && Array.isArray(partial.tags)) ? partial.tags.slice() : [],
      relatedArtifacts: (partial && Array.isArray(partial.relatedArtifacts))
        ? partial.relatedArtifacts.slice()
        : [],
      relatedConcepts: (partial && Array.isArray(partial.relatedConcepts))
        ? partial.relatedConcepts.slice()
        : [],
      createdAt: (partial && partial.createdAt) || now,
      updatedAt: (partial && partial.updatedAt) || now,
      pinned: (partial && typeof partial.pinned === 'boolean') ? partial.pinned : false,
      archived: (partial && typeof partial.archived === 'boolean') ? partial.archived : false,
      source: (partial && partial.source) || 'manual',
      version: (partial && partial.version) || '1.0.0'
    };

    return item;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.MemorySchema = {
    validate: validate,
    validateAll: validateAll,
    VALID_TYPES: VALID_TYPES.slice(),
    REQUIRED_FIELDS: REQUIRED_FIELDS.slice(),
    create: create,
    escapeHtml: escapeHtml
  };
})();
