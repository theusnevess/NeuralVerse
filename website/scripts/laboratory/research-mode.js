/** NV-1600 — canonical in-memory Research Session authority. */
(function () {
  'use strict';
  var session = null;
  var activeRunId = null;
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function id(prefix) { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); }
  function touch() { if (session) session.updatedAt = new Date().toISOString(); }
  function save() { if (session) window.NeuralVerse.ResearchStorage.saveSession(session); }
  function currentRun() { return session && session.runs.find(function (run) { return run.runId === activeRunId; }); }
   function activate(lab) { session = window.NeuralVerse.ResearchStorage.createSession(lab); activeRunId = null; save(); return session; }
   function restore(record) {
     if (!record || !window.NeuralVerse.ResearchStorage.getSession(record.laboratoryId, record.id)) return null;
     session = clone(record);
     var activeRun = (session.runs || []).find(function (run) { return run.status === 'active'; });
     activeRunId = activeRun ? activeRun.runId : null;
     return session;
   }
  function exit() { save(); session = null; activeRunId = null; }
  function transition(state) {
    if (!session) return false;
    var allowed = { draft: ['active', 'discarded'], active: ['review', 'discarded'], review: ['active', 'completed'], completed: ['active'] };
    if (!allowed[session.state] || allowed[session.state].indexOf(state) < 0) return false;
    if (state === 'completed' && !canComplete()) return false;
    session.state = state; touch(); save(); return true;
  }
  function update(fields) { if (!session || session.state === 'completed') return; Object.keys(fields).forEach(function (key) { session[key] = clone(fields[key]); }); touch(); save(); }
  function beginRun(lab, snapshot) {
    if (!session || session.state === 'completed' || activeRunId) return null;
    var run = { runId: id('run'), sessionId: session.id, laboratoryId: lab.id, laboratoryContractVersion: lab.version || '1', status: 'active', startedAt: new Date().toISOString(), completedAt: null, configurationSnapshot: clone(snapshot), datasetReference: null, seed: null, terminalResult: null, measurements: [], evidenceIds: [], observationIds: [] };
    session.runs.push(run); activeRunId = run.runId; touch(); save(); return run;
  }
  function finishRun(status, terminalResult, measurements) {
    var run = currentRun(); if (!run) return null;
    run.status = status; run.completedAt = new Date().toISOString(); run.terminalResult = clone(terminalResult || {}); run.measurements = clone(measurements || []); activeRunId = null; touch(); save(); return run;
  }
  function captureEvidence(evidence) {
    var run = currentRun() || (session && session.runs[session.runs.length - 1]);
    if (!session || !run || !evidence || !evidence.sourceId) return null;
    if (session.capturedEvidence.some(function (item) { return item.sourceId === evidence.sourceId && item.runId === run.runId; })) return null;
    var item = Object.assign({ evidenceId: id('evidence'), laboratoryId: session.laboratoryId, runId: run.runId, capturedAt: new Date().toISOString(), learnerNote: '' }, clone(evidence));
    session.capturedEvidence.push(item); run.evidenceIds.push(item.evidenceId); touch(); save(); return item;
  }
  function addRecord(kind, text, evidenceIds, step) {
    var run = currentRun() || (session && session.runs[session.runs.length - 1]);
    if (!session || !run || !text || !text.trim()) return null;
    var record = { id: id(kind), type: kind, text: text.trim(), runId: run.runId, evidenceIds: clone(evidenceIds || []), step: step === undefined ? null : step, timestamp: new Date().toISOString() };
    session[kind + 's'].push(record); if (kind === 'observation') run.observationIds.push(record.id); touch(); save(); return record;
  }
  function compare(runIds, relevantKeys) {
    if (!session || !Array.isArray(runIds) || runIds.length !== 2) return null;
    var runs = session.runs.filter(function (run) { return runIds.indexOf(run.runId) >= 0 && run.status === 'completed'; });
    if (runs.length !== 2 || runs[0].laboratoryId !== runs[1].laboratoryId || runs[0].laboratoryContractVersion !== runs[1].laboratoryContractVersion) return null;
    var changed = [], controlled = []; Object.keys(runs[0].configurationSnapshot).forEach(function (key) { (runs[0].configurationSnapshot[key] === runs[1].configurationSnapshot[key] ? controlled : changed).push(key); });
    var classification = changed.length === 1 ? 'controlled' : changed.length ? 'partially-controlled' : 'exploratory';
    var comparison = { id: id('comparison'), runIds: runIds.slice(), changedParameters: changed, controlledParameters: controlled, relevantKeys: relevantKeys || [], classification: classification, note: '', createdAt: new Date().toISOString() };
    session.comparisons.push(comparison); touch(); save(); return comparison;
  }
  function canComplete() { return !!(session && session.researchQuestion.trim() && session.runs.some(function (run) { return run.status === 'completed'; }) && (session.capturedEvidence.length || session.observations.length) && session.limitations.length && (session.conclusion.trim() || (session.hypothesis.status === 'inconclusive' && session.hypothesis.rationale.trim()))); }
  function reproducibility() { if (!session) return null; return { laboratoryId: session.laboratoryId, laboratoryContractVersion: session.laboratoryContractVersion, researchSessionSchemaVersion: session.version, runIds: session.runs.map(function (run) { return run.runId; }), runs: session.runs.map(function (run) { return { runId: run.runId, configurationSnapshot: run.configurationSnapshot, datasetReference: run.datasetReference, seed: run.seed, startedAt: run.startedAt, completedAt: run.completedAt, terminalResult: run.terminalResult, measurements: run.measurements }; }), capturedEvidenceReferences: session.capturedEvidence.map(function (item) { return item.evidenceId; }), knownLimitations: session.limitations }; }
  function exportSession(format) {
    if (!session) return null; var record = clone(session); record.reproducibility = reproducibility();
    if (format === 'json') return JSON.stringify(record, null, 2);
    return '# ' + record.title + '\n\n## Laboratory\n' + record.laboratoryTitle + '\n\n## Research Question\n' + record.researchQuestion + '\n\n## Hypothesis\n' + record.hypothesis.statement + ' (' + record.hypothesis.status + ')\n\n## Variables\nIndependent: ' + record.variables.independent.join(', ') + '\nDependent: ' + record.variables.dependent.join(', ') + '\nControlled: ' + record.variables.controlled.join(', ') + '\n\n## Runs\n' + record.runs.map(function (run) { return '- ' + run.runId + ': ' + run.status + '\n'; }).join('') + '\n## Evidence\n' + record.capturedEvidence.map(function (item) { return '- ' + item.scientificSummary + '\n'; }).join('') + '\n## Observations\n' + record.observations.map(function (item) { return '- ' + item.text + '\n'; }).join('') + '\n## Interpretations\n' + record.interpretations.map(function (item) { return '- ' + item.text + '\n'; }).join('') + '\n## Limitations\n' + record.limitations.map(function (item) { return '- ' + item + '\n'; }).join('') + '\n## Conclusion\n' + record.conclusion + '\n\n## Reproducibility\n```json\n' + JSON.stringify(record.reproducibility, null, 2) + '\n```\n';
  }
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.ResearchMode = { activate: activate, restore: restore, exit: exit, isActive: function () { return !!session; }, getSession: function () { return session; }, update: update, transition: transition, beginRun: beginRun, finishRun: finishRun, getCurrentRun: currentRun, captureEvidence: captureEvidence, addObservation: function (text, evidenceIds, step) { return addRecord('observation', text, evidenceIds, step); }, addInterpretation: function (text, evidenceIds, step) { return addRecord('interpretation', text, evidenceIds, step); }, compare: compare, canComplete: canComplete, reproducibility: reproducibility, export: exportSession, save: save };
})();
