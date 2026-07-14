/**
 * NV-900-P8 — Research Mode Engine
 * Core engine for hypothesis-driven experimentation.
 */

(function () {
  'use strict';

  var currentSession = null;
  var isResearchMode = false;
  var currentRun = null;

  function enterResearchMode(lab) {
    if (!lab) return null;
    isResearchMode = true;
    currentSession = window.NeuralVerse.ResearchStorage.createSession(
      lab.id, lab.slug, lab.title, {}
    );
    currentSession.xaiFindings = [];
    return currentSession;
  }

  function exitResearchMode() {
    if (currentSession && currentSession.runs.length > 0) {
      saveCurrentSession();
    }
    isResearchMode = false;
    currentSession = null;
    currentRun = null;
  }

  function isActive() {
    return isResearchMode && currentSession !== null;
  }

  function getSession() {
    return currentSession;
  }

  function setHypothesis(text) {
    if (!currentSession) return;
    window.NeuralVerse.ResearchStorage.updateHypothesis(currentSession, text);
  }

  function getHypothesis() {
    return currentSession ? currentSession.hypothesis : '';
  }

  function startRun(params) {
    if (!currentSession) return null;
    currentRun = window.NeuralVerse.ResearchStorage.createRun(currentSession, params);
    currentSession.runs.push(currentRun);
    return currentRun;
  }

  function finishRun(result, metrics) {
    if (!currentRun) return;
    currentRun.result = result;
    currentRun.metrics = metrics || {};
    currentRun.timestamp = new Date().toISOString();
    currentRun = null;
  }

  function getCurrentRun() {
    return currentRun;
  }

  function addNote(text, type, stepIndex) {
    if (!currentSession) return;
    window.NeuralVerse.ResearchStorage.addNote(currentSession, {
      text: text,
      type: type || 'observation',
      stepIndex: stepIndex || 0
    });
  }

  function addXAINote(finding) {
    if (!currentSession || !finding) return;
    if (!currentSession.xaiFindings) currentSession.xaiFindings = [];
    currentSession.xaiFindings.push({
      id: finding.id,
      title: finding.title,
      observation: finding.observation,
      cause: finding.cause,
      implication: finding.implication,
      severity: finding.severity,
      confidence: finding.confidence,
      category: finding.category,
      stepIndex: finding.stepIndex,
      timestamp: finding.timestamp
    });
  }

  function addBookmark(stepIndex, label, state) {
    if (!currentSession) return;
    window.NeuralVerse.ResearchStorage.addBookmark(currentSession, {
      stepIndex: stepIndex,
      label: label,
      state: state
    });
  }

  function addConclusion(text, type, supported) {
    if (!currentSession) return;
    window.NeuralVerse.ResearchStorage.addConclusion(currentSession, {
      text: text,
      type: type || 'observation',
      supported: supported
    });
  }

  function updateName(name) {
    if (!currentSession) return;
    window.NeuralVerse.ResearchStorage.updateSessionName(currentSession, name);
  }

  function saveCurrentSession() {
    if (!currentSession) return;
    window.NeuralVerse.ResearchStorage.saveSession(
      currentSession.labId, currentSession
    );
  }

  function loadSession(labId, sessionId) {
    var session = window.NeuralVerse.ResearchStorage.getSession(labId, sessionId);
    if (session) {
      currentSession = session;
      isResearchMode = true;
    }
    return session;
  }

  function getRuns() {
    return currentSession ? currentSession.runs : [];
  }

  function getRunById(runId) {
    if (!currentSession) return null;
    for (var i = 0; i < currentSession.runs.length; i++) {
      if (currentSession.runs[i].id === runId) return currentSession.runs[i];
    }
    return null;
  }

  function getComparisonData(runIds) {
    if (!currentSession) return [];
    var runs = [];
    for (var i = 0; i < currentSession.runs.length; i++) {
      if (runIds.indexOf(currentSession.runs[i].id) >= 0) {
        runs.push(currentSession.runs[i]);
      }
    }
    return runs;
  }

  function generateConclusionDraft() {
    if (!currentSession || currentSession.runs.length === 0) return null;

    var draft = {
      objective: currentSession.hypothesis || 'Investigate algorithm behavior',
      hypothesis: currentSession.hypothesis,
      method: 'Controlled experiment with ' + currentSession.runs.length + ' run(s)',
      parameters: currentSession.runs[0] ? currentSession.runs[0].params : {},
      observations: currentSession.notes.filter(function (n) { return n.type === 'observation'; }),
      results: currentSession.runs.map(function (r) {
        return {
          params: r.params,
          metrics: r.metrics,
          converged: r.result ? r.result.converged : false
        };
      }),
      xaiFindings: currentSession.xaiFindings || [],
      conclusions: currentSession.conclusions
    };

    return draft;
  }

  function getEvidenceTimeline() {
    if (!currentSession) return [];

    var timeline = [];

    // Hypothesis
    if (currentSession.hypothesis) {
      timeline.push({
        type: 'hypothesis',
        label: 'Hypothesis',
        detail: currentSession.hypothesis,
        timestamp: currentSession.createdAt
      });
    }

    // Runs
    for (var i = 0; i < currentSession.runs.length; i++) {
      var run = currentSession.runs[i];
      timeline.push({
        type: 'run',
        label: 'Run ' + (i + 1),
        detail: 'Parameters: ' + Object.keys(run.params).join(', '),
        timestamp: run.timestamp
      });

      if (run.result && run.result.converged) {
        timeline.push({
          type: 'convergence',
          label: 'Convergence',
          detail: 'Experiment converged successfully',
          timestamp: run.timestamp
        });
      }
    }

    // Bookmarks
    for (var j = 0; j < currentSession.bookmarks.length; j++) {
      var bm = currentSession.bookmarks[j];
      timeline.push({
        type: 'bookmark',
        label: 'Bookmark',
        detail: bm.label,
        timestamp: bm.timestamp,
        stepIndex: bm.stepIndex
      });
    }

    // Notes
    for (var k = 0; k < currentSession.notes.length; k++) {
      var note = currentSession.notes[k];
      timeline.push({
        type: 'note',
        label: note.type.charAt(0).toUpperCase() + note.type.slice(1),
        detail: note.text,
        timestamp: note.timestamp
      });
    }

    // Conclusions
    for (var l = 0; l < currentSession.conclusions.length; l++) {
      var conc = currentSession.conclusions[l];
      timeline.push({
        type: 'conclusion',
        label: 'Conclusion',
        detail: conc.text,
        timestamp: conc.timestamp
      });
    }

    // XAI Findings
    if (currentSession.xaiFindings) {
      for (var m = 0; m < currentSession.xaiFindings.length; m++) {
        var xai = currentSession.xaiFindings[m];
        timeline.push({
          type: 'finding',
          label: 'Finding',
          detail: xai.title + ' (' + xai.severity + ', ' + xai.confidence + ')',
          timestamp: xai.timestamp,
          stepIndex: xai.stepIndex
        });
      }
    }

    timeline.sort(function (a, b) {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

    return timeline;
  }

  function getLabSessions(labId) {
    return window.NeuralVerse.ResearchStorage.getRecentSessions(labId, 10);
  }

  function getAllRecentSessions(count) {
    return window.NeuralVerse.ResearchStorage.getAllRecentSessions(count);
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.ResearchMode = {
    enter: enterResearchMode,
    exit: exitResearchMode,
    isActive: isActive,
    getSession: getSession,
    setHypothesis: setHypothesis,
    getHypothesis: getHypothesis,
    startRun: startRun,
    finishRun: finishRun,
    getCurrentRun: getCurrentRun,
    addNote: addNote,
    addXAINote: addXAINote,
    addBookmark: addBookmark,
    addConclusion: addConclusion,
    updateName: updateName,
    save: saveCurrentSession,
    loadSession: loadSession,
    getRuns: getRuns,
    getRunById: getRunById,
    getComparisonData: getComparisonData,
    generateConclusionDraft: generateConclusionDraft,
    getEvidenceTimeline: getEvidenceTimeline,
    getLabSessions: getLabSessions,
    getAllRecentSessions: getAllRecentSessions
  };

})();
