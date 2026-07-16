/**
 * NV-1100-P7 — Execution Engine
 * Deterministic, sandboxed laboratory execution engine.
 * No eval(), no Function(), no external requests.
 * Supports both batch execution and step-by-step execution.
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

  // ── Step Execution Engine ──────────────────────────────

  function createStepSession(lab, params) {
    if (!lab) return null;

    var steps = lab.steps || [];
    var totalSteps = steps.length || 1;

    var validation = window.NeuralVerse.ParameterEngine.validateAll(lab.parameterSchema, params || {});
    if (!validation.valid) return null;

    return {
      labId: lab.id,
      lab: lab,
      // A session owns an independent normalized copy for its entire lifecycle.
      params: Object.freeze(Object.assign({}, validation.params)),
      steps: steps,
      totalSteps: totalSteps,
      currentStep: -1,
      history: [],
      state: 'idle',
      startTime: null,
      logs: [],
      error: null
    };
  }

  function getLifecycleState(session) {
    if (!session) return 'ready';
    if (session.state === 'finished') return 'completed';
    if (session.state === 'failed') return 'failed';
    if (session.state === 'paused') return 'paused';
    if (session.state === 'running') return 'running';
    return 'ready';
  }

  function startSession(session) {
    if (!session || (session.state !== 'idle' && session.state !== 'paused')) return false;
    session.state = 'running';
    session.error = null;
    return true;
  }

  function pauseSession(session) {
    if (!session || session.state !== 'running') return false;
    session.state = 'paused';
    return true;
  }

  function getProgress(session) {
    var total = session ? Math.max(1, session.totalSteps) : 1;
    var current = session ? Math.max(0, session.currentStep + 1) : 0;
    return { current: current, total: total, fraction: current / total };
  }

  function stepForward(session) {
    if (!session || session.state === 'finished') return session;

    var nextStep = session.currentStep + 1;
    if (nextStep >= session.totalSteps) {
      session.state = 'finished';
      return session;
    }

    session.currentStep = nextStep;
    session.state = 'running';
    if (!session.startTime) session.startTime = Date.now();

    var step = session.steps[nextStep];
    var snapshot;
    try {
      snapshot = computeStepSnapshot(session, nextStep, step);
    } catch (err) {
      session.state = 'failed';
      session.error = 'The experiment could not complete this step.';
      return session;
    }
    session.history.push(snapshot);

    session.logs.push({
      time: Date.now(),
      step: nextStep,
      label: step.label,
      message: step.log || step.label
    });

    if (nextStep >= session.totalSteps - 1) {
      session.state = 'finished';
    }

    return session;
  }

  function computeStepSnapshot(session, stepIndex, stepDef) {
    var lab = session.lab;
    var params = session.params;
    var total = session.totalSteps;

    var progress = total > 1 ? stepIndex / (total - 1) : 1;
    var elapsed = session.startTime ? (Date.now() - session.startTime) / 1000 : 0;

    var metrics = {};
    if (typeof stepDef.metrics === 'function') {
      metrics = stepDef.metrics(params, stepIndex, progress) || {};
    }

    var vizData = null;
    if (typeof stepDef.viz === 'function') {
      vizData = stepDef.viz(params, stepIndex, progress);
    }

    return {
      stepIndex: stepIndex,
      label: stepDef.label,
      progress: progress,
      elapsed: elapsed,
      metrics: metrics,
      viz: vizData,
      state: typeof stepDef.state === 'function' ? stepDef.state(params, stepIndex) : {}
    };
  }

  function getStepSnapshot(session, stepIndex) {
    if (!session || stepIndex < 0 || stepIndex >= session.history.length) return null;
    return session.history[stepIndex];
  }

  function resetSession(session) {
    if (!session) return session;
    session.currentStep = -1;
    session.state = 'idle';
    session.startTime = null;
    session.history = [];
    session.logs = [];
    session.error = null;
    return session;
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
    createStepSession: createStepSession,
    getLifecycleState: getLifecycleState,
    startSession: startSession,
    pauseSession: pauseSession,
    getProgress: getProgress,
    stepForward: stepForward,
    getStepSnapshot: getStepSnapshot,
    resetSession: resetSession,
    getStats: getStats,
    resetStats: resetStats
  };

})();
