/** NV-1700 — normalized completion and continuation authorities. */
(function () {
  'use strict';

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function key(schema) { return schema.id || schema.name; }
  function display(value) { return Array.isArray(value) ? value.join(', ') : String(value); }
  function outcomeFrom(lab, summary) {
    var outcome = summary.find(function (item) { return /converg|outcome|result|status|projection|similarity|posterior|trade-off|attention/i.test(item.label); });
    if (!outcome) return { label: 'Scientific Outcome', sourceLabel: null, value: 'Outcome Unavailable', status: 'neutral' };
    var value = String(outcome.value);
    if (/^(ready|running|paused|reset)$/i.test(value)) value = 'Outcome Unavailable';
    if (lab.slug === 'gradient-descent' && outcome.label === 'Converged') value = value === 'Yes' ? 'Converged' : 'Not Converged';
    if (lab.slug === 'precision-recall' && outcome.label === 'Status' && value === 'Complete') value = 'Trade-off Evaluated';
    return { label: 'Scientific Outcome', sourceLabel: outcome.label, value: value, status: /not converg/i.test(value) ? 'neutral' : 'reported' };
  }

  function createCompletion(lab, runId, result, snapshot, session, evidenceReferences) {
    if (!lab || !result || !snapshot) return null;
    var scientificResult = result.success && result.result ? result.result : result;
    var summary = typeof lab.getCompletionSummary === 'function' ? lab.getCompletionSummary(scientificResult, snapshot) || [] : [];
    var outcome = outcomeFrom(lab, summary);
    var measurements = summary.filter(function (item) { return item.label !== outcome.sourceLabel; }).map(function (item) {
      return { label: item.label, value: display(item.value), unit: item.unit || null, precision: item.precision || null, source: 'laboratory completion contract' };
    });
    var configuration = (lab.parameterSchema || []).map(function (schema) {
      var name = key(schema);
      return { label: schema.label, value: display(snapshot[name]), unit: schema.unit || null, source: 'immutable execution snapshot' };
    });
    return Object.freeze({
      laboratoryId: lab.id, runId: runId, executionState: 'completed', completedAt: new Date().toISOString(),
      stepCount: session ? session.totalSteps : null, duration: null, scientificOutcome: outcome,
      measurements: measurements, configurationSnapshot: clone(snapshot), configurationSummary: configuration,
      evidenceReferences: clone(evidenceReferences || []), limitations: outcome.value === 'Not Converged' ? ['The run completed without convergence.'] : [],
      researchSessionReference: window.NeuralVerse.ResearchMode && window.NeuralVerse.ResearchMode.isActive() ? window.NeuralVerse.ResearchMode.getSession().id : null
    });
  }

  function continuation(lab, model) {
    var candidates = [], schema = lab.parameterSchema || [];
    var variable = schema.find(function (item) { return ['slider', 'integer', 'float'].indexOf(item.type) >= 0; });
    if (variable) candidates.push({ family: 'vary', title: 'Vary ' + variable.label, rationale: (model.scientificOutcome.value === 'Not Converged' ? 'Repeat with a lower ' : 'Change one factor: ') + variable.label + ' while preserving the other configuration values.', state: 'recommended', parameter: key(variable), target: null });
    candidates.push({ family: 'repeat', title: 'Repeat Experiment', rationale: 'Run the current valid configuration again as a new execution.', state: 'available', target: null });
    var relationships = window.NeuralVerse.LabEcosystem ? window.NeuralVerse.LabEcosystem.getNextExperiments(lab.slug) : [];
    relationships.forEach(function (item) {
      if (item.target === lab.slug) return;
      var target = window.NeuralVerse.LabRegistry.getBySlug(item.target);
      if (!target) return;
      var family = item.type === 'prerequisite' ? 'review' : item.type === 'comparison' ? 'compare' : item.type === 'application' ? 'curriculum' : 'deepen';
      candidates.push({ family: family, title: target.title, rationale: item.reason, state: item.type === 'prerequisite' ? 'review suggested' : 'recommended', target: item.target, relationship: item.type });
    });
    return candidates.slice(0, 3);
  }

  function renderCompletion(model) {
    if (!model) return '';
    var measurements = model.measurements.map(function (item) { return '<li><span>' + item.label + '</span><strong>' + item.value + (item.unit ? ' ' + item.unit : '') + '</strong></li>'; }).join('');
    var configuration = model.configurationSummary.map(function (item) { return '<li><span>' + item.label + '</span><strong>' + item.value + (item.unit ? ' ' + item.unit : '') + '</strong></li>'; }).join('');
    var limitations = model.limitations.length ? '<p class="nv-lab-v4-completion-summary__limitation">' + model.limitations[0] + '</p>' : '';
    return '<section class="nv-lab-v4-completion-summary" data-lab-v4-completion-summary data-lab-v4-completion-deck data-completion-run-id="' + model.runId + '" aria-labelledby="completion-heading">' +
      '<header><h3 id="completion-heading">Experiment Outcome</h3><p>Execution completed' + (model.stepCount ? ' after ' + model.stepCount + ' steps.' : '.') + '</p></header>' +
      '<div class="nv-lab-v4-completion-summary__outcome"><span>Scientific Outcome</span><strong>' + model.scientificOutcome.label + ': ' + model.scientificOutcome.value + '</strong></div>' +
      '<section><h4>Final Measurements</h4><ul>' + measurements + '</ul></section><section><h4>Configuration Reference</h4><ul>' + configuration + '</ul></section>' +
      (model.evidenceReferences.length ? '<button type="button" data-completion-evidence>Inspect supporting evidence</button>' : '') + limitations +
      (model.researchSessionReference ? '<p data-completion-research-status>Captured in Research Session</p>' : '') + '<button type="button" data-completion-repeat>Repeat Experiment</button></section>';
  }

  function renderContinuations(candidates) {
    if (!candidates.length) return '';
    var cards = candidates.map(function (item) {
      var action = item.target ? '<a href="#/laboratory/' + item.target + '" data-continuation-target="' + item.target + '">Open ' + item.title + '</a>' : '<button type="button" data-completion-' + item.family + (item.parameter ? ' data-parameter="' + item.parameter + '"' : '') + '">' + item.title + '</button>';
      return '<article class="nv-lab-continuation-card" data-continuation-family="' + item.family + '"><span>' + item.family + ' · ' + item.state + '</span><h4>' + item.title + '</h4><p>' + item.rationale + '</p>' + action + '</article>';
    }).join('');
    return '<div class="nv-lab-continuations" data-lab-continuations><h3>Next Experiments</h3><section><h4>Continue the Investigation</h4>' + cards + '</section></div>';
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.CompletionNextExperiments = { createCompletion: createCompletion, continuation: continuation, renderCompletion: renderCompletion, renderContinuations: renderContinuations };
})();
