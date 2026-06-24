/**
 * NV-1100-P1 — Validation Service
 * Validates backup files before import.
 */

(function () {
  'use strict';

  const SCHEMA_VERSION = 1;
  const SUPPORTED_SCHEMA_VERSIONS = [1];

  function validateBackup(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
      return { valid: false, errors: ['Backup file is empty or not a valid object.'] };
    }

    if (data.schemaVersion === undefined || data.schemaVersion === null) {
      errors.push('Missing schemaVersion field.');
    } else if (typeof data.schemaVersion !== 'number') {
      errors.push('schemaVersion must be a number.');
    } else if (!SUPPORTED_SCHEMA_VERSIONS.includes(data.schemaVersion)) {
      errors.push('Unsupported schema version: ' + data.schemaVersion + '. This backup was created by a different version of NeuralVerse.');
    }

    if (data.exportedAt === undefined || data.exportedAt === null) {
      errors.push('Missing exportedAt timestamp.');
    } else if (typeof data.exportedAt !== 'string') {
      errors.push('exportedAt must be a string.');
    } else {
      const ts = new Date(data.exportedAt);
      if (isNaN(ts.getTime())) {
        errors.push('exportedAt is not a valid date.');
      }
    }

    if (data.personalization !== undefined && typeof data.personalization !== 'object') {
      errors.push('personalization field must be an object.');
    }
    if (data.study !== undefined && typeof data.study !== 'object') {
      errors.push('study field must be an object.');
    }
    if (data.notes !== undefined && typeof data.notes !== 'object') {
      errors.push('notes field must be an object.');
    }
    if (data.highlights !== undefined && !Array.isArray(data.highlights)) {
      errors.push('highlights field must be an array.');
    }
    if (data.collections !== undefined && !Array.isArray(data.collections)) {
      errors.push('collections field must be an array.');
    }
    if (data.preferences !== undefined && typeof data.preferences !== 'object') {
      errors.push('preferences field must be an object.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  function validateFileContent(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return { valid: false, errors: ['No file content provided.'], data: null };
    }

    const trimmed = rawText.trim();
    if (trimmed.length === 0) {
      return { valid: false, errors: ['File is empty.'], data: null };
    }

    if (trimmed.length > 10 * 1024 * 1024) {
      return { valid: false, errors: ['File exceeds maximum size of 10 MB.'], data: null };
    }

    let data;
    try {
      data = JSON.parse(trimmed);
    } catch (e) {
      return { valid: false, errors: ['Invalid JSON syntax. The file could not be parsed.'], data: null };
    }

    return { valid: true, errors: [], data };
  }

  const ValidationService = {
    SCHEMA_VERSION,
    SUPPORTED_SCHEMA_VERSIONS,
    validateBackup,
    validateFileContent
  };

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.ValidationService = ValidationService;

})();
