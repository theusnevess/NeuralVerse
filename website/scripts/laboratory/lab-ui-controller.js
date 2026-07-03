/**
 * NV-1100-P7 — UI Controller
 * Manages laboratory UI: parameter controls, execution, visualization, and state.
 */

(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function createUIController(options) {
    var root = options.root || document;
    var currentLab = null;
    var currentParams = {};
    var currentResult = null;

    function getContainer() {
      return root.querySelector('[data-lab-container]') || root.querySelector('.nv-lab-main');
    }

    function getParameterPanel() {
      return root.querySelector('[data-lab-parameters]');
    }

    function getVisualizationPanel() {
      return root.querySelector('[data-lab-visualization]');
    }

    function getResultPanel() {
      return root.querySelector('[data-lab-results]');
    }

    function getTitleElement() {
      return root.querySelector('[data-lab-title]');
    }

    function getSummaryElement() {
      return root.querySelector('[data-lab-summary]');
    }

    function getMetadataElement() {
      return root.querySelector('[data-lab-metadata]');
    }

    function renderParameterControls(lab, params) {
      var panel = getParameterPanel();
      if (!panel) return;

      if (!lab || !lab.parameterSchema || lab.parameterSchema.length === 0) {
        panel.innerHTML = '<div class="nv-lab-empty-params"><p>No configurable parameters.</p></div>';
        return;
      }

      var html = '';
      lab.parameterSchema.forEach(function (schema) {
        var key = schema.id || schema.name;
        var value = params[key] !== undefined ? params[key] : schema.default;
        html += '<div class="nv-lab-param-group" data-param-id="' + escapeHtml(key) + '">';
        html += '<label class="nv-lab-param-label" for="lab-param-' + escapeHtml(key) + '">';
        html += escapeHtml(schema.label);
        if (schema.description) {
          html += '<span class="nv-lab-param-desc">' + escapeHtml(schema.description) + '</span>';
        }
        html += '</label>';

        switch (schema.type) {
          case 'slider':
          case 'integer':
          case 'float': {
            var step = schema.type === 'integer' ? 1 : (schema.step || 0.01);
            html += '<div class="nv-lab-slider-row">';
            html += '<input type="range" id="lab-param-' + escapeHtml(key) + '" ';
            html += 'class="nv-lab-slider" ';
            html += 'min="' + schema.min + '" max="' + schema.max + '" step="' + step + '" ';
            html += 'value="' + value + '" ';
            html += 'data-param-type="' + schema.type + '" ';
            html += 'aria-label="' + escapeHtml(schema.label) + '" ';
            html += 'aria-valuemin="' + schema.min + '" aria-valuemax="' + schema.max + '" aria-valuenow="' + value + '">';
            html += '<span class="nv-lab-slider-value">' + (typeof value === 'number' ? value : value) + '</span>';
            html += '</div>';
            break;
          }
          case 'boolean': {
            html += '<label class="nv-lab-toggle">';
            html += '<input type="checkbox" id="lab-param-' + escapeHtml(key) + '" ';
            html += (value ? 'checked ' : '');
            html += 'data-param-type="boolean" ';
            html += 'aria-label="' + escapeHtml(schema.label) + '">';
            html += '<span class="nv-lab-toggle-track"></span>';
            html += '</label>';
            break;
          }
          case 'select':
          case 'enum': {
            html += '<select id="lab-param-' + escapeHtml(key) + '" ';
            html += 'class="nv-lab-select" ';
            html += 'data-param-type="' + schema.type + '" ';
            html += 'aria-label="' + escapeHtml(schema.label) + '">';
            (schema.options || []).forEach(function (opt) {
              var selected = opt === value ? ' selected' : '';
              html += '<option value="' + escapeHtml(opt) + '"' + selected + '>' + escapeHtml(opt) + '</option>';
            });
            html += '</select>';
            break;
          }
          case 'text': {
            html += '<input type="text" id="lab-param-' + escapeHtml(key) + '" ';
            html += 'class="nv-lab-input" ';
            html += 'value="' + escapeHtml(value) + '" ';
            html += 'data-param-type="text" ';
            html += 'aria-label="' + escapeHtml(schema.label) + '">';
            break;
          }
          default:
            html += '<span class="nv-lab-param-unsupported">Unsupported parameter type: ' + escapeHtml(schema.type) + '</span>';
        }

        html += '</div>';
      });

      panel.innerHTML = html;
      bindParameterEvents(lab);
    }

    function bindParameterEvents(lab) {
      var panel = getParameterPanel();
      if (!panel) return;

      panel.querySelectorAll('input[type="range"]').forEach(function (slider) {
        slider.addEventListener('input', function () {
          var paramId = this.closest('[data-param-id]').getAttribute('data-param-id');
          var val = parseFloat(this.value);
          currentParams[paramId] = val;
          var display = this.parentElement.querySelector('.nv-lab-slider-value');
          if (display) display.textContent = val;
          this.setAttribute('aria-valuenow', val);
          debouncedExecute();
        });
      });

      panel.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
        cb.addEventListener('change', function () {
          var paramId = this.closest('[data-param-id]').getAttribute('data-param-id');
          currentParams[paramId] = this.checked;
          executeCurrentLab();
        });
      });

      panel.querySelectorAll('select').forEach(function (sel) {
        sel.addEventListener('change', function () {
          var paramId = this.closest('[data-param-id]').getAttribute('data-param-id');
          currentParams[paramId] = this.value;
          executeCurrentLab();
        });
      });

      panel.querySelectorAll('input[type="text"]').forEach(function (inp) {
        inp.addEventListener('change', function () {
          var paramId = this.closest('[data-param-id]').getAttribute('data-param-id');
          currentParams[paramId] = this.value;
          executeCurrentLab();
        });
      });
    }

    var executeDebounce = null;
    function debouncedExecute() {
      if (executeDebounce) clearTimeout(executeDebounce);
      executeDebounce = setTimeout(executeCurrentLab, 50);
    }

    function executeCurrentLab() {
      if (!currentLab) return;

      var execResult = window.NeuralVerse.ExecutionEngine.execute(currentLab, currentParams);
      currentResult = execResult;

      if (!execResult.success) {
        showExecutionError(execResult.error);
        return;
      }

      renderVisualization(execResult);
      renderResultMetadata(execResult.metadata);
      persistLabState();
    }

    function showExecutionError(error) {
      var vizPanel = getVisualizationPanel();
      if (vizPanel) {
        vizPanel.innerHTML = '<div class="nv-lab-error" role="alert">' +
          '<span class="nv-lab-error-icon" aria-hidden="true">&#x26A0;</span>' +
          '<p>' + escapeHtml(error) + '</p></div>';
      }
    }

    function renderVisualization(execResult) {
      var vizPanel = getVisualizationPanel();
      if (!vizPanel || !execResult.result) return;

      var viz = currentLab.visualization;
      var vizType = viz ? viz.type : 'numeric-summary';
      var config = viz || {};

      vizPanel.innerHTML = '';
      window.NeuralVerse.VisualizationEngine.render(vizPanel, vizType, execResult.result, config);
    }

    function renderResultMetadata(metadata) {
      var panel = getMetadataElement();
      if (!panel || !metadata) return;
      panel.innerHTML =
        '<span class="nv-lab-meta-item">Execution: ' + metadata.elapsedMs + 'ms</span>' +
        '<span class="nv-lab-meta-item">Parameters: ' + metadata.parameterCount + '</span>';
    }

    function persistLabState() {
      if (!currentLab) return;
      window.NeuralVerse.LabStateStorage.saveState(currentLab.id, {
        params: Object.assign({}, currentParams),
        lastExecuted: new Date().toISOString(),
        resultSummary: currentResult && currentResult.success ? 'success' : 'error'
      });
    }

    function loadLab(lab) {
      if (!lab) return;

      currentLab = lab;
      var savedState = window.NeuralVerse.LabStateStorage.getState(lab.id);
      currentParams = window.NeuralVerse.ParameterEngine.sanitize(
        lab.parameterSchema,
        savedState ? savedState.params : lab.initialState
      );

      if (getTitleElement()) getTitleElement().textContent = lab.title;
      if (getSummaryElement()) getSummaryElement().textContent = lab.summary;

      renderParameterControls(lab, currentParams);
      executeCurrentLab();

      window.NeuralVerse.LabStateStorage.addRecentLab(lab.id, lab.title, lab.slug);
    }

    function resetParameters() {
      if (!currentLab) return;
      currentParams = window.NeuralVerse.ParameterEngine.buildDefaults(currentLab.parameterSchema);
      renderParameterControls(currentLab, currentParams);
      executeCurrentLab();
    }

    function renderLabIndex(container) {
      if (!container) return;
      var labs = window.NeuralVerse.LabRegistry.getAll();
      var categories = window.NeuralVerse.LabRegistry.getCategories();
      var recent = window.NeuralVerse.LabStateStorage.getRecentLabs();

      var html = '';

      html += '<header class="nv-page-section__header nv-lab-index-header">';
      html += '<p class="nv-page-section__eyebrow">Laboratories</p>';
      html += '<h1>Interactive experiments.</h1>';
      html += '<p>Deterministic, local-first simulations — from linear regression to transformer attention. Pause, replay, and export at any point.</p>';
      html += '</header>';

      if (recent && recent.length > 0) {
        html += '<section class="nv-lab-recent-section" aria-label="Recent Laboratories">';
        html += '<h3 class="nv-lab-section-title">Recent Laboratories</h3>';
        html += '<div class="nv-lab-recent-grid">';
        recent.slice(0, 6).forEach(function (r) {
          var lab = window.NeuralVerse.LabRegistry.get(r.labId);
          html += '<a href="#/laboratory/' + escapeHtml(lab ? lab.slug : r.labId) + '" ';
          html += 'class="nv-lab-card nv-lab-card--recent" ';
          html += 'aria-label="Open ' + escapeHtml(r.title) + '">';
          html += '<h4 class="nv-lab-card-title">' + escapeHtml(r.title) + '</h4>';
          html += '<span class="nv-lab-card-time">Last opened: ' + formatTime(r.lastOpened) + '</span>';
          html += '</a>';
        });
        html += '</div></section>';
      }

      html += '<section class="nv-lab-all-section" aria-label="All Laboratories">';
      html += '<h3 class="nv-lab-section-title">All Laboratories</h3>';
      html += '<div class="nv-lab-grid">';
      labs.forEach(function (lab) {
        html += '<a href="#/laboratory/' + escapeHtml(lab.slug) + '" ';
        html += 'class="nv-lab-card" ';
        html += 'aria-label="Open ' + escapeHtml(lab.title) + '">';
        html += '<span class="nv-lab-card-category">' + escapeHtml(lab.category) + '</span>';
        html += '<h4 class="nv-lab-card-title">' + escapeHtml(lab.title) + '</h4>';
        html += '<p class="nv-lab-card-summary">' + escapeHtml(lab.summary) + '</p>';
        html += '<div class="nv-lab-card-meta">';
        html += '<span class="nv-lab-card-duration">' + escapeHtml(lab.estimatedDuration || '5-10 min') + '</span>';
        html += '<span class="nv-lab-card-status">' + escapeHtml(lab.canonicalStatus) + '</span>';
        html += '</div>';
        html += '</a>';
      });
      html += '</div></section>';

      container.innerHTML = html;
    }

    function formatTime(isoString) {
      if (!isoString) return 'Never';
      try {
        return new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short'
        }).format(new Date(isoString));
      } catch (e) {
        return isoString;
      }
    }

    function destroy() {
      if (executeDebounce) clearTimeout(executeDebounce);
      currentLab = null;
      currentParams = {};
      currentResult = null;
    }

    return {
      loadLab: loadLab,
      resetParameters: resetParameters,
      executeCurrentLab: executeCurrentLab,
      renderLabIndex: renderLabIndex,
      destroy: destroy,
      getCurrentLab: function () { return currentLab; },
      getCurrentParams: function () { return Object.assign({}, currentParams); },
      getCurrentResult: function () { return currentResult; }
    };
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createLabUIController = createUIController;

})();
