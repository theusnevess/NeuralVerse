/**
 * NV-1100-P7 — Execution Engine
 * Deterministic, sandboxed laboratory execution engine.
 * No eval(), no Function(), no external requests.
 */

(function () {
  'use strict';

  var executionCount = 0;
  var lastExecutionTime = 0;

  function executeLab(lab, params) {
    if (!lab || typeof lab.execute !== 'function') {
      return {
        success: false,
        error: 'Invalid laboratory definition',
        result: null,
        metadata: buildMetadata(lab, params, 0)
      };
    }

    var validation = window.NeuralVerse.ParameterEngine.validateAll(
      lab.parameterSchema, params
    );

    if (!validation.valid) {
      return {
        success: false,
        error: 'Parameter validation failed: ' + validation.errors.join('; '),
        result: null,
        metadata: buildMetadata(lab, params, 0)
      };
    }

    var startTime = performance.now();
    var result;
    try {
      result = lab.execute(validation.params);
    } catch (err) {
      return {
        success: false,
        error: 'Execution error: ' + (err.message || String(err)),
        result: null,
        metadata: buildMetadata(lab, params, 0)
      };
    }
    var elapsed = performance.now() - startTime;

    executionCount++;
    lastExecutionTime = elapsed;

    return {
      success: true,
      error: null,
      result: result,
      metadata: buildMetadata(lab, params, elapsed)
    };
  }

  function buildMetadata(lab, params, elapsed) {
    return {
      labId: lab ? lab.id : null,
      labVersion: lab ? lab.version : null,
      executedAt: new Date().toISOString(),
      elapsedMs: Math.round(elapsed * 100) / 100,
      parameterCount: params ? Object.keys(params).length : 0,
      executionCount: executionCount
    };
  }

  function getStats() {
    return {
      executionCount: executionCount,
      lastExecutionTime: lastExecutionTime
    };
  }

  function resetStats() {
    executionCount = 0;
    lastExecutionTime = 0;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.ExecutionEngine = {
    execute: executeLab,
    getStats: getStats,
    resetStats: resetStats
  };

})();
