/**
 * NV-1100-P11 — Generative UI
 * Renders the optional generative assist panel and controls.
 */
(function () {
  'use strict';

  var DISCLAIMER = 'Generated locally by optional model. Review before relying on this content.';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderGenerativePanel(mount, options) {
    if (!mount) return;
    var ctrl = window.NeuralVerse.GenerativeController;
    if (!ctrl) return;

    var settings = ctrl.getSettings();
    var isGenerating = ctrl.isGenerating();

    var privacyLevels = window.NeuralVerse.ContextPackBuilder.getPrivacyLevels();
    var modes = window.NeuralVerse.PromptContracts.getModes();
    var profiles = window.NeuralVerse.ModelProfileRegistry.getAll();

    var html = '<div class="nv-gen-panel">';
    html += '<div class="nv-gen-panel__header">';
    html += '<h3 class="nv-gen-panel__title">Local Generative Assist</h3>';
    html += '<span class="nv-badge ' + (settings.enabled ? 'nv-badge--success' : 'nv-badge--muted') + '">';
    html += settings.enabled ? 'Enabled' : 'Disabled';
    html += '</span>';
    html += '</div>';

    if (!settings.enabled) {
      html += '<div class="nv-gen-panel__disabled">';
      html += '<p class="nv-gen-panel__info">Generative layer is disabled. Enable it in <a href="#/settings">Settings</a> to use local model assistance.</p>';
      html += '</div>';
    } else {
      html += '<div class="nv-gen-panel__controls">';

      html += '<div class="nv-gen-field">';
      html += '<label class="nv-gen-label" for="gen-mode">Generation Mode</label>';
      html += '<select id="gen-mode" class="nv-gen-select">';
      modes.forEach(function (m) {
        html += '<option value="' + m.id + '">' + escapeHtml(m.label) + '</option>';
      });
      html += '</select>';
      html += '</div>';

      html += '<div class="nv-gen-field">';
      html += '<label class="nv-gen-label" for="gen-privacy">Privacy Level</label>';
      html += '<select id="gen-privacy" class="nv-gen-select">';
      privacyLevels.forEach(function (pl) {
        var selected = pl.id === settings.privacyLevel ? ' selected' : '';
        html += '<option value="' + pl.id + '"' + selected + '>' + escapeHtml(pl.label) + '</option>';
      });
      html += '</select>';
      html += '</div>';

      html += '<div class="nv-gen-field">';
      html += '<label class="nv-gen-label" for="gen-query">Your Question</label>';
      html += '<textarea id="gen-query" class="nv-gen-textarea" rows="3" placeholder="Ask about the current concept or artifact..."></textarea>';
      html += '</div>';

      html += '<div class="nv-gen-actions">';
      if (isGenerating) {
        html += '<button class="nv-gen-btn nv-gen-btn--stop" data-gen-action="stop">Stop</button>';
      } else {
        html += '<button class="nv-gen-btn nv-gen-btn--primary" data-gen-action="generate">Generate</button>';
      }
      html += '</div>';

      html += '</div>';

      html += '<div id="gen-result" class="nv-gen-result"></div>';
    }

    html += '</div>';
    mount.innerHTML = html;
  }

  function renderGenerationResult(mount, result) {
    if (!mount || !result) return;

    if (result.error && !result.text) {
      mount.innerHTML = '<div class="nv-gen-result__error"><p>' + escapeHtml(result.error) + '</p></div>';
      return;
    }

    if (result.guardrails && result.guardrails.blocked) {
      var blockReasons = result.guardrails.blocks.map(function (b) { return escapeHtml(b.reason); }).join(', ');
      mount.innerHTML = '<div class="nv-gen-result__blocked"><p><strong>Generation blocked by guardrails:</strong> ' + blockReasons + '</p></div>';
      return;
    }

    var html = '<div class="nv-gen-result__content">';
    html += '<div class="nv-gen-result__header">';
    html += '<span class="nv-gen-result__badge">' + escapeHtml(result.outputClass.icon) + ' ' + escapeHtml(result.outputClass.label) + '</span>';
    html += '<span class="nv-gen-result__meta">Model: ' + escapeHtml(result.model || 'unknown') + '</span>';
    html += '</div>';
    html += '<div class="nv-gen-result__text">' + escapeHtml(result.text).replace(/\n/g, '<br>') + '</div>';
    html += '<div class="nv-gen-result__disclaimer"><em>' + DISCLAIMER + '</em></div>';
    html += '<div class="nv-gen-result__actions">';
    html += '<button class="nv-gen-btn nv-gen-btn--secondary" data-gen-action="copy">Copy</button>';
    html += '<button class="nv-gen-btn nv-gen-btn--secondary" data-gen-action="save-memory">Save as Memory</button>';
    html += '<button class="nv-gen-btn nv-gen-btn--secondary" data-gen-action="discard">Discard</button>';
    html += '</div>';
    html += '</div>';
    mount.innerHTML = html;
  }

  function renderStatusBar(mount, status) {
    if (!mount) return;
    var html = '<div class="nv-gen-status">';
    html += '<span class="nv-gen-status__indicator nv-gen-status__indicator--' + escapeHtml(status.status) + '"></span>';
    html += '<span class="nv-gen-status__text">' + escapeHtml(status.text || status.status) + '</span>';
    html += '</div>';
    mount.innerHTML = html;
  }

  function renderAuditLogSummary(mount) {
    if (!mount) return;
    var log = window.NeuralVerse.GenerationAuditLog;
    if (!log) return;
    var count = log.getCount();
    var recent = log.getRecent(5);

    var html = '<div class="nv-gen-audit">';
    html += '<h4>Generation Audit Log</h4>';
    html += '<p class="nv-gen-audit__count">' + count + ' total entries</p>';
    if (recent.length > 0) {
      html += '<div class="nv-gen-audit__recent">';
      recent.forEach(function (entry) {
        html += '<div class="nv-gen-audit__entry">';
        html += '<span class="nv-gen-audit__time">' + escapeHtml(new Date(entry.timestamp).toLocaleString()) + '</span>';
        html += '<span class="nv-gen-audit__mode">' + escapeHtml(entry.mode) + '</span>';
        html += '<span class="nv-gen-audit__class">' + escapeHtml(entry.outputClass) + '</span>';
        if (entry.blocked) html += '<span class="nv-gen-audit__blocked">BLOCKED</span>';
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    mount.innerHTML = html;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.GenerativeUI = {
    renderGenerativePanel: renderGenerativePanel,
    renderGenerationResult: renderGenerationResult,
    renderStatusBar: renderStatusBar,
    renderAuditLogSummary: renderAuditLogSummary,
    DISCLAIMER: DISCLAIMER
  };
})();
