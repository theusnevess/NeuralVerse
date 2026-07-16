/**
 * NV-900-P9 — Explainability Engine (XAI)
 * Deterministic, scientifically rigorous explanation generation from algorithm state.
 * No LLM, no randomness, no external calls. All explanations derived from computed state.
 */

(function () {
  'use strict';

  var findingCounter = 0;
  var SEVERITY_ORDER = { 'Critical': 0, 'Significant': 1, 'Important': 2, 'Information': 3 };
  var CONFIDENCE_ORDER = { 'Very High': 0, 'High': 1, 'Moderate': 2, 'Low': 3 };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function createFinding(overrides) {
    findingCounter++;
    return {
      id: 'xai-' + findingCounter + '-' + Date.now(),
      title: overrides.title || '',
      observation: overrides.observation || '',
      cause: overrides.cause || '',
      implication: overrides.implication || '',
      nextObservation: overrides.nextObservation || '',
      confidence: overrides.confidence || 'Moderate',
      severity: overrides.severity || 'Information',
      category: overrides.category || 'Optimization',
      references: overrides.references || [],
      timestamp: new Date().toISOString(),
      stepIndex: overrides.stepIndex !== undefined ? overrides.stepIndex : 0,
      labId: overrides.labId || '',
      labSlug: overrides.labSlug || '',
      visualEvidence: overrides.visualEvidence || null
    };
  }

  function analyze(lab, params, stepIndex, history, prevInspectorState) {
    if (!lab || !lab.inspector) return [];

    var currentState = lab.inspector.computeState(
      params,
      stepIndex,
      history || []
    );

    var prevState = prevInspectorState || null;

    var registry = window.NeuralVerse.XAIRegistry;
    if (!registry) return [];

    var rules = registry.getRules(lab.slug);
    if (!rules || rules.length === 0) return [];

    var findings = [];

    for (var i = 0; i < rules.length; i++) {
      try {
        var result = rules[i](params, currentState, prevState, stepIndex, history || []);
        if (result) {
          if (Array.isArray(result)) {
            for (var j = 0; j < result.length; j++) {
              if (result[j]) {
                result[j].labId = lab.id;
                result[j].labSlug = lab.slug;
                result[j].stepIndex = stepIndex;
                findings.push(result[j]);
              }
            }
          } else {
            result.labId = lab.id;
            result.labSlug = lab.slug;
            result.stepIndex = stepIndex;
            findings.push(result);
          }
        }
      } catch (e) {
        if (window.NV_DEBUG) {
          console.warn('XAI rule error:', e);
        }
      }
    }

    findings.sort(function (a, b) {
      var sa = SEVERITY_ORDER[a.severity] !== undefined ? SEVERITY_ORDER[a.severity] : 99;
      var sb = SEVERITY_ORDER[b.severity] !== undefined ? SEVERITY_ORDER[b.severity] : 99;
      if (sa !== sb) return sa - sb;
      var ca = CONFIDENCE_ORDER[a.confidence] !== undefined ? CONFIDENCE_ORDER[a.confidence] : 99;
      var cb = CONFIDENCE_ORDER[b.confidence] !== undefined ? CONFIDENCE_ORDER[b.confidence] : 99;
      return ca - cb;
    });

    return findings;
  }

  function generateBatchFindings(lab, params, result) {
    if (!lab || !result) return [];

    var findings = [];

    var registry = window.NeuralVerse.XAIRegistry;
    if (!registry) return [];

    var rules = registry.getRules(lab.slug);
    if (!rules || rules.length === 0) return [];

    var mockState = result;
    if (lab.inspector && typeof lab.inspector.computeState === 'function') {
      try {
        mockState = lab.inspector.computeState(params, 0, []);
      } catch (e) {
        mockState = result;
      }
    }

    for (var i = 0; i < rules.length; i++) {
      try {
        var ruleResult = rules[i](params, mockState, null, 0, []);
        if (ruleResult) {
          if (Array.isArray(ruleResult)) {
            for (var j = 0; j < ruleResult.length; j++) {
              if (ruleResult[j]) {
                ruleResult[j].labId = lab.id;
                ruleResult[j].labSlug = lab.slug;
                ruleResult[j].stepIndex = 0;
                findings.push(ruleResult[j]);
              }
            }
          } else {
            ruleResult.labId = lab.id;
            ruleResult.labSlug = lab.slug;
            ruleResult.stepIndex = 0;
            findings.push(ruleResult);
          }
        }
      } catch (e) {
        if (window.NV_DEBUG) {
          console.warn('XAI batch rule error:', e);
        }
      }
    }

    findings.sort(function (a, b) {
      var sa = SEVERITY_ORDER[a.severity] !== undefined ? SEVERITY_ORDER[a.severity] : 99;
      var sb = SEVERITY_ORDER[b.severity] !== undefined ? SEVERITY_ORDER[b.severity] : 99;
      return sa - sb;
    });

    return findings;
  }

  function getCategoryLabel(category) {
    var labels = {
      'Optimization': 'Optimization',
      'Convergence': 'Convergence',
      'Geometry': 'Geometry',
      'Probability': 'Probability',
      'Representation': 'Representation',
      'Classification': 'Classification',
      'Clustering': 'Clustering',
      'Attention': 'Attention',
      'Similarity': 'Similarity',
      'Evaluation': 'Evaluation',
      'Statistical Structure': 'Statistical Structure',
      'Data Quality': 'Data Quality'
    };
    return labels[category] || category;
  }

  function getSeverityColor(severity) {
    var colors = {
      'Critical': 'var(--nv-xai-severity-critical)',
      'Significant': 'var(--nv-xai-severity-significant)',
      'Important': 'var(--nv-xai-severity-important)',
      'Information': 'var(--nv-xai-severity-info)'
    };
    return colors[severity] || 'var(--nv-xai-text-muted)';
  }

  function getConfidenceBadge(confidence) {
    var cls = 'nv-xai-confidence--low';
    if (confidence === 'Very High' || confidence === 'High') cls = 'nv-xai-confidence--high';
    else if (confidence === 'Moderate') cls = 'nv-xai-confidence--moderate';
    return '<span class="nv-xai-confidence-badge ' + cls + '">' + escapeHtml(confidence) + '</span>';
  }

  function getSeverityBadge(severity) {
    var cls = 'nv-xai-severity--info';
    if (severity === 'Critical') cls = 'nv-xai-severity--critical';
    else if (severity === 'Significant') cls = 'nv-xai-severity--significant';
    else if (severity === 'Important') cls = 'nv-xai-severity--important';
    return '<span class="nv-xai-severity-badge ' + cls + '">' + escapeHtml(severity) + '</span>';
  }

  function renderFinding(finding) {
    if (!finding) return '';

    var html = '<div class="nv-xai-finding nv-xai-finding--' + escapeHtml(finding.severity.toLowerCase()) + '" ';
    html += 'data-xai-finding-id="' + escapeHtml(finding.id) + '" ';
    html += 'role="article" aria-label="Scientific finding: ' + escapeHtml(finding.title) + '" aria-expanded="false" tabindex="0">';

    html += '<div class="nv-xai-finding-header">';
    html += '<h4 class="nv-xai-finding-title">' + escapeHtml(finding.title) + '</h4>';
    html += '<div class="nv-xai-finding-badges">';
    html += getSeverityBadge(finding.severity);
    html += getConfidenceBadge(finding.confidence);
    html += '<span class="nv-xai-category-badge">' + escapeHtml(getCategoryLabel(finding.category)) + '</span>';
    html += '</div>';
    html += '<span class="nv-xai-finding-expand" aria-hidden="true">\u25B6</span>';
    html += '</div>';

    html += '<div class="nv-xai-finding-layers">';

    html += '<div class="nv-xai-layer">';
    html += '<span class="nv-xai-layer-label">Observation</span>';
    html += '<p class="nv-xai-layer-content">' + escapeHtml(finding.observation) + '</p>';
    html += '</div>';

    html += '<div class="nv-xai-layer">';
    html += '<span class="nv-xai-layer-label">Cause</span>';
    html += '<p class="nv-xai-layer-content">' + escapeHtml(finding.cause) + '</p>';
    html += '</div>';

    html += '<div class="nv-xai-layer">';
    html += '<span class="nv-xai-layer-label">Scientific Meaning</span>';
    html += '<p class="nv-xai-layer-content">' + escapeHtml(finding.implication) + '</p>';
    html += '</div>';

    html += '<div class="nv-xai-layer">';
    html += '<span class="nv-xai-layer-label">Observe Next</span>';
    html += '<p class="nv-xai-layer-content">' + escapeHtml(finding.nextObservation) + '</p>';
    html += '</div>';

    html += '</div>';

    if (finding.references && finding.references.length > 0) {
      html += '<div class="nv-xai-finding-refs">';
      html += '<span class="nv-xai-finding-refs-label">References</span>';
      for (var r = 0; r < finding.references.length; r++) {
        html += '<span class="nv-xai-finding-ref">' + escapeHtml(finding.references[r]) + '</span>';
      }
      html += '</div>';
    }

    html += '</div>';

    return html;
  }

  function renderTimelineEntry(finding, index) {
    var html = '<div class="nv-xai-timeline-entry" data-xai-finding-id="' + escapeHtml(finding.id) + '" ';
    html += 'tabindex="0" role="listitem" aria-label="Finding ' + (index + 1) + ': ' + escapeHtml(finding.title) + '">';

    html += '<div class="nv-xai-timeline-marker">';
    html += '<span class="nv-xai-timeline-dot nv-xai-timeline-dot--' + escapeHtml(finding.severity.toLowerCase()) + '"></span>';
    html += '<span class="nv-xai-timeline-index">#' + (index + 1) + '</span>';
    html += '</div>';

    html += '<div class="nv-xai-timeline-body">';
    html += '<span class="nv-xai-timeline-title">' + escapeHtml(finding.title) + '</span>';
    html += '<span class="nv-xai-timeline-meta">' + escapeHtml(finding.severity) + ' · ' + escapeHtml(finding.confidence) + '</span>';
    var occurrence = finding.occurrence;
    html += '<span class="nv-xai-timeline-step">Step ' + ((occurrence ? occurrence.latestStep : finding.stepIndex) + 1) + (occurrence && occurrence.count > 1 ? ' · ' + occurrence.count + ' occurrences' : '') + '</span>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function getMetrics(findings) {
    var metrics = {
      total: findings.length,
      critical: 0,
      significant: 0,
      byCategory: {},
      bySeverity: {}
    };

    for (var i = 0; i < findings.length; i++) {
      var f = findings[i];
      if (f.severity === 'Critical') metrics.critical++;
      if (f.severity === 'Significant') metrics.significant++;

      metrics.bySeverity[f.severity] = (metrics.bySeverity[f.severity] || 0) + 1;
      metrics.byCategory[f.category] = (metrics.byCategory[f.category] || 0) + 1;
    }

    return metrics;
  }

  function resetCounter() {
    findingCounter = 0;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.XAIEngine = {
    analyze: analyze,
    generateBatchFindings: generateBatchFindings,
    renderFinding: renderFinding,
    renderTimelineEntry: renderTimelineEntry,
    getMetrics: getMetrics,
    getCategoryLabel: getCategoryLabel,
    getSeverityColor: getSeverityColor,
    getConfidenceBadge: getConfidenceBadge,
    getSeverityBadge: getSeverityBadge,
    createFinding: createFinding,
    resetCounter: resetCounter
  };

})();
