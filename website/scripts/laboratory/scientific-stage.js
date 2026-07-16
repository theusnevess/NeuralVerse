/**
 * NV-1200 — Scientific Stage adapter.
 * Normalizes laboratory-owned evidence for presentation without recalculating it.
 */
(function () {
  'use strict';

  function format(value) {
    if (value === undefined || value === null || value === '' || (typeof value === 'number' && !isFinite(value))) return '—';
    if (typeof value === 'number') return String(Math.round(value * 10000) / 10000);
    return String(value);
  }

  function evidenceFrom(items, contract) {
    var byKey = {};
    (items || []).forEach(function (item) { byKey[item.key || item.label] = item.value; });
    return (contract.evidence || []).map(function (item) {
      return { label: item.label, value: format(byKey[item.key]) };
    }).filter(function (item) { return item.value !== '—'; });
  }

  function stateEvidence(lab, params, stepIndex, phase, result) {
    if (phase === 'preparation' && typeof lab.getPreparationTelemetry === 'function') {
      return lab.getPreparationTelemetry(params);
    }
    if (phase === 'completed' && result && typeof lab.getCompletionSummary === 'function') {
      var scientificResult = result.success && result.result ? result.result : result;
      return lab.getCompletionSummary(scientificResult, params).map(function (item) {
        return { key: item.label, label: item.label, value: item.value };
      });
    }
    if (lab.inspector && typeof lab.inspector.computeState === 'function') {
      var state = lab.inspector.computeState(params, Math.max(0, stepIndex || 0), []);
      return Object.keys(state).map(function (key) { return { key: key, value: state[key] }; });
    }
    return [];
  }

  function buildViewModel(lab, params, stepIndex, phase, result) {
    var contract = lab.scientificStage || {};
    var evidence = evidenceFrom(stateEvidence(lab, params, stepIndex, phase, result), contract);
    var summary = contract.interpretation || contract.scientificQuestion || 'Scientific evidence is shown in the stage.';
    if (evidence.length) summary += ' Current evidence: ' + evidence.map(function (item) { return item.label + ' ' + item.value; }).join('; ') + '.';
    return {
      title: contract.title || lab.title || 'Scientific stage',
      question: contract.scientificQuestion || '',
      summary: summary,
      evidence: evidence,
      phase: phase || 'preparation'
    };
  }

  function decorate(container, viewModel) {
    if (!container || !viewModel) return;
    // Rendering a new snapshot replaces the prior accessible summary rather
    // than retaining one hidden node for every scientific step.
    container.querySelectorAll('[data-scientific-stage-summary]').forEach(function (existing) { existing.remove(); });
    var summaryId = 'scientific-stage-summary-' + Math.random().toString(36).slice(2);
    var summary = document.createElement('p');
    summary.className = 'nv-sr-only';
    summary.id = summaryId;
    summary.setAttribute('data-scientific-stage-summary', '');
    summary.textContent = viewModel.summary;
    container.appendChild(summary);

    container.querySelectorAll('svg').forEach(function (svg) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', viewModel.title + ': ' + viewModel.summary);
      svg.setAttribute('aria-describedby', summaryId);
      svg.setAttribute('focusable', 'false');
      if (!svg.querySelector('title')) {
        var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = viewModel.title;
        svg.insertBefore(title, svg.firstChild);
      }
    });
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.ScientificStage = { buildViewModel: buildViewModel, decorate: decorate };
})();
