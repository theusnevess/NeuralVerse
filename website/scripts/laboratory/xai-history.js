/**
 * NV-900-P9 — XAI History
 * Persistence layer for scientific findings.
 * Stores findings in localStorage with FIFO eviction.
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'nv_xai_findings';
  var MAX_FINDINGS = 200;

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { findings: [], metrics: buildEmptyMetrics() };
      var parsed = JSON.parse(raw);
      if (!parsed.findings) parsed.findings = [];
      if (!parsed.metrics) parsed.metrics = buildEmptyMetrics();
      return parsed;
    } catch (e) {
      return { findings: [], metrics: buildEmptyMetrics() };
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      if (window.NV_DEBUG) console.warn('XAI history save failed:', e);
    }
  }

  function buildEmptyMetrics() {
    return {
      totalFindings: 0,
      criticalFindings: 0,
      convergenceEvents: 0,
      explanationCoverage: 0,
      byLab: {},
      byCategory: {}
    };
  }

  function recomputeMetrics(findings) {
    var metrics = buildEmptyMetrics();
    metrics.totalFindings = findings.length;

    for (var i = 0; i < findings.length; i++) {
      var f = findings[i];
      if (f.severity === 'Critical') metrics.criticalFindings++;
      if (f.category === 'Convergence') metrics.convergenceEvents++;
      metrics.byLab[f.labId] = (metrics.byLab[f.labId] || 0) + 1;
      metrics.byCategory[f.category] = (metrics.byCategory[f.category] || 0) + 1;
    }

    return metrics;
  }

  function addFinding(finding) {
    if (!finding) return;
    var data = load();
    data.findings.push(finding);

    if (data.findings.length > MAX_FINDINGS) {
      data.findings = data.findings.slice(data.findings.length - MAX_FINDINGS);
    }

    data.metrics = recomputeMetrics(data.findings);
    save(data);
  }

  function getFindings(labId, limit) {
    var data = load();
    var filtered = labId
      ? data.findings.filter(function (f) { return f.labId === labId; })
      : data.findings;

    if (limit && filtered.length > limit) {
      filtered = filtered.slice(filtered.length - limit);
    }

    return filtered;
  }

  function getAllFindings(limit) {
    return getFindings(null, limit);
  }

  function getFindingsByCategory(category) {
    var data = load();
    return data.findings.filter(function (f) { return f.category === category; });
  }

  function getFindingsBySeverity(severity) {
    var data = load();
    return data.findings.filter(function (f) { return f.severity === severity; });
  }

  function getFindingCount() {
    var data = load();
    return data.metrics;
  }

  function clearFindings(labId) {
    var data = load();
    if (labId) {
      data.findings = data.findings.filter(function (f) { return f.labId !== labId; });
    } else {
      data.findings = [];
    }
    data.metrics = recomputeMetrics(data.findings);
    save(data);
  }

  function exportFindings() {
    var data = load();
    return JSON.stringify(data, null, 2);
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.XAIHistory = {
    addFinding: addFinding,
    getFindings: getFindings,
    getAllFindings: getAllFindings,
    getFindingsByCategory: getFindingsByCategory,
    getFindingsBySeverity: getFindingsBySeverity,
    getFindingCount: getFindingCount,
    clearFindings: clearFindings,
    exportFindings: exportFindings
  };

})();
