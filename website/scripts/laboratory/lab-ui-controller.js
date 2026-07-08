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
      return root.querySelector('[data-lab-container]') || root.querySelector('.nv-lab-main') || root.querySelector('.nv-lab-viewer') || root;
    }

    function getParameterPanel() {
      return root.querySelector('[data-lab-parameters]');
    }

    function getVisualizationPanel() {
      return root.querySelector('[data-lab-visualization]') || root.querySelector('.nv-lab-ws-viz-canvas') || root.querySelector('.nv-lab-visualization-panel');
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

    var stepSession = null;
    var stepInterval = null;
    var stepSpeed = 1;

    function loadLab(lab) {
      if (!lab) return;

      currentLab = lab;
      var savedState = window.NeuralVerse.LabStateStorage.getState(lab.id);
      currentParams = window.NeuralVerse.ParameterEngine.sanitize(
        lab.parameterSchema,
        savedState ? savedState.params : lab.initialState
      );

      renderParameterControls(lab, currentParams);

      // Execute batch result for visualization
      executeCurrentLab();

      // Create step session if available
      if (lab.steps && lab.steps.length > 0) {
        stepSession = window.NeuralVerse.ExecutionEngine.createStepSession(lab, currentParams);
        wireExecutionControls();
        updateLiveState();
        updateMetricsFromStep();
      }

      window.NeuralVerse.LabStateStorage.addRecentLab(lab.id, lab.title, lab.slug);
    }

    function wireExecutionControls() {
      var container = getContainer();
      if (!container) return;

      // Control buttons
      container.querySelectorAll('[data-action]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var action = this.getAttribute('data-action');
          handleExecutionAction(action);
        });
      });

      // Speed buttons
      container.querySelectorAll('.nv-lab-ws-speed-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          stepSpeed = parseInt(this.getAttribute('data-speed')) || 1;
          container.querySelectorAll('.nv-lab-ws-speed-btn').forEach(function (b) { b.classList.remove('active'); });
          this.classList.add('active');
        });
      });

      // Timeline clicks
      container.querySelectorAll('.nv-lab-ws-tl-step').forEach(function (step) {
        step.addEventListener('click', function () {
          var idx = parseInt(this.getAttribute('data-step'));
          jumpToStep(idx);
        });
      });

      // Observation panel expand/collapse
      container.querySelectorAll('.nv-lab-obs-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var action = this.getAttribute('data-action');
          var panel = this.closest('.nv-lab-obs-panel');
          if (!panel) return;
          if (action === 'expand') {
            panel.classList.add('nv-lab-obs-panel--expanded');
          } else if (action === 'collapse') {
            panel.classList.remove('nv-lab-obs-panel--expanded');
          }
        });
      });
    }

    function handleExecutionAction(action) {
      if (!stepSession) return;

      switch (action) {
        case 'run':
          startAutoRun();
          updateControlStates('running');
          break;
        case 'step':
          stepForward();
          updateControlStates('paused');
          break;
        case 'pause':
          stopAutoRun();
          updateControlStates('paused');
          break;
        case 'reset-exec':
          stopAutoRun();
          window.NeuralVerse.ExecutionEngine.resetSession(stepSession);
          updateTimeline();
          updateLiveState();
          updateMetricsFromStep();
          updateControlStates('idle');
          renderCurrentViz();
          break;
      }
    }

    function startAutoRun() {
      stopAutoRun();
      var delay = Math.max(50, 500 / stepSpeed);
      stepInterval = setInterval(function () {
        if (!stepSession || stepSession.state === 'finished') {
          stopAutoRun();
          updateControlStates('finished');
          return;
        }
        stepForward();
      }, delay);
    }

    function stopAutoRun() {
      if (stepInterval) {
        clearInterval(stepInterval);
        stepInterval = null;
      }
    }

    var prevInspectorState = null;

    function stepForward() {
      if (!stepSession || stepSession.state === 'finished') return;
      window.NeuralVerse.ExecutionEngine.stepForward(stepSession);
      var snapshot = window.NeuralVerse.ExecutionEngine.getStepSnapshot(stepSession, stepSession.currentStep);
      if (snapshot) {
        updateTimeline();
        updateLiveState();
        updateMetrics(snapshot.metrics);
        addLogEntry(snapshot);
        updateInspector();
        renderAllObservations();
      }
      if (stepSession.state === 'finished') {
        stopAutoRun();
        updateControlStates('finished');
      }
    }

    function renderAllObservations() {
      if (!currentLab || !currentLab.observations) return;
      currentLab.observations.forEach(function (obs) {
        var body = root.querySelector('[data-obs-body="' + obs.id + '"]');
        if (body) {
          try {
            obs.render(body, currentParams, stepSession ? stepSession.currentStep : 0, stepSession ? stepSession.history : []);
          } catch (e) {
            body.innerHTML = '<span class="nv-lab-obs-error">Error rendering</span>';
          }
        }
      });
    }

    function updateInspector() {
      if (!currentLab || !currentLab.inspector) return;
      var inspector = currentLab.inspector;
      var container = getContainer();
      if (!container) return;

      var state = inspector.computeState(currentParams, stepSession ? stepSession.currentStep : 0, stepSession ? stepSession.history : []);

      // Update each card value
      inspector.sections.forEach(function (section) {
        section.cards.forEach(function (card) {
          var valueEl = container.querySelector('[data-inspector-value="' + card.key + '"]');
          var interpEl = container.querySelector('[data-inspector-interpretation="' + card.key + '"]');
          var cardEl = container.querySelector('[data-inspector-key="' + card.key + '"]');

          if (valueEl) {
            var newVal = state[card.key];
            var displayVal = newVal !== undefined ? String(newVal) : '—';
            if (typeof newVal === 'number') {
              displayVal = card.fixed ? String(newVal) : (Math.abs(newVal) < 0.001 && newVal !== 0 ? newVal.toExponential(2) : String(Math.round(newVal * 10000) / 10000));
            }
            var oldVal = valueEl.textContent;
            valueEl.textContent = displayVal;

            // Live highlight on change
            if (cardEl && oldVal !== displayVal && oldVal !== '—') {
              cardEl.classList.add('nv-lab-inspector-card--changed');
              setTimeout(function () {
                cardEl.classList.remove('nv-lab-inspector-card--changed');
              }, 600);
            }
          }

          if (interpEl && card.interpretation) {
            var interp = card.interpretation(state[card.key], state);
            interpEl.textContent = interp || '';
          }
        });
      });

      // Change feed
      if (inspector.changeDetector && prevInspectorState) {
        var changes = inspector.changeDetector(prevInspectorState, state);
        changes.forEach(function (change) {
          addChangeEntry(change);
        });
      }
      prevInspectorState = Object.assign({}, state);
    }

    function addChangeEntry(change) {
      var container = getContainer();
      if (!container) return;
      var entries = container.querySelector('[data-lab-change-entries]');
      if (!entries) return;
      var entry = document.createElement('div');
      entry.className = 'nv-lab-ws-change-entry';
      entry.innerHTML = '<span class="nv-lab-change-arrow" aria-hidden="true">↓</span> ' + escapeHtml(change.label);
      entries.appendChild(entry);
      entries.scrollTop = entries.scrollHeight;
      // Keep max 20 entries
      while (entries.children.length > 20) {
        entries.removeChild(entries.firstChild);
      }
    }

    function jumpToStep(idx) {
      if (!stepSession) return;
      stopAutoRun();
      prevInspectorState = null;
      window.NeuralVerse.ExecutionEngine.resetSession(stepSession);
      for (var i = 0; i <= idx; i++) {
        window.NeuralVerse.ExecutionEngine.stepForward(stepSession);
      }
      var snapshot = window.NeuralVerse.ExecutionEngine.getStepSnapshot(stepSession, stepSession.currentStep);
      if (snapshot) {
        updateTimeline();
        updateLiveState();
        updateMetrics(snapshot.metrics);
        updateInspector();
        renderAllObservations();
      }
      updateControlStates(stepSession.state === 'finished' ? 'finished' : 'paused');
    }

    function updateControlStates(state) {
      var container = getContainer();
      if (!container) return;
      var runBtn = container.querySelector('[data-action="run"]');
      var pauseBtn = container.querySelector('[data-action="pause"]');
      var stepBtn = container.querySelector('[data-action="step"]');
      if (runBtn) runBtn.disabled = state === 'running';
      if (pauseBtn) pauseBtn.disabled = state !== 'running';
      if (stepBtn) stepBtn.disabled = state === 'finished';
    }

    function updateTimeline() {
      var container = getContainer();
      if (!container || !stepSession) return;
      container.querySelectorAll('.nv-lab-ws-tl-step').forEach(function (el) {
        var idx = parseInt(el.getAttribute('data-step'));
        el.classList.remove('active', 'completed');
        if (idx === stepSession.currentStep) el.classList.add('active');
        else if (idx < stepSession.currentStep) el.classList.add('completed');
      });
    }

    function updateLiveState() {
      var container = getContainer();
      if (!container) return;
      var stepEl = container.querySelector('[data-live-step]');
      var statusEl = container.querySelector('[data-live-status]');
      if (stepSession) {
        if (stepEl) stepEl.textContent = (stepSession.currentStep + 1) + ' / ' + stepSession.totalSteps;
        if (statusEl) statusEl.textContent = stepSession.state === 'idle' ? 'Ready' : stepSession.state === 'finished' ? 'Complete' : stepSession.state === 'running' ? 'Running' : 'Paused';
      } else {
        if (stepEl) stepEl.textContent = 'N/A';
        if (statusEl) statusEl.textContent = 'No steps';
      }
    }

    function updateMetricsFromStep() {
      if (!stepSession || stepSession.currentStep < 0) {
        updateMetrics(null);
        return;
      }
      var snapshot = window.NeuralVerse.ExecutionEngine.getStepSnapshot(stepSession, stepSession.currentStep);
      if (snapshot) updateMetrics(snapshot.metrics);
    }

    function updateMetrics(metrics) {
      var container = getContainer();
      if (!container) return;
      var grid = container.querySelector('[data-lab-metrics-grid]');
      if (!grid) return;
      if (!metrics || Object.keys(metrics).length === 0) {
        grid.innerHTML = '<span style="font-size:0.75rem;color:var(--nv-lab-text-muted)">Run experiment to see metrics</span>';
        return;
      }
      var html = '';
      for (var key in metrics) {
        html += '<div class="nv-lab-ws-metric">';
        html += '<span class="nv-lab-ws-metric-label">' + escapeHtml(key) + '</span>';
        html += '<span class="nv-lab-ws-metric-value">' + escapeHtml(String(metrics[key])) + '</span>';
        html += '</div>';
      }
      grid.innerHTML = html;
    }

    function addLogEntry(snapshot) {
      var container = getContainer();
      if (!container) return;
      var log = container.querySelector('[data-lab-log]');
      if (!log) return;
      var entry = document.createElement('div');
      entry.className = 'nv-lab-ws-log-entry';
      entry.innerHTML = '<span class="log-step">[Step ' + (snapshot.stepIndex + 1) + ']</span> ' + escapeHtml(snapshot.label);
      log.appendChild(entry);
      log.scrollTop = log.scrollHeight;
    }

    function renderStepViz(vizData) {
      var vizPanel = root.querySelector('[data-lab-visualization]');
      if (!vizPanel || !vizData) return;

      var vizType = currentLab.visualization ? currentLab.visualization.type : 'numeric-summary';
      var config = currentLab.visualization || {};

      vizPanel.innerHTML = '';

      if (vizData.path && vizType === 'line-chart') {
        var pathYs = vizData.path.map(function (p) { return p.y; });
        window.NeuralVerse.VisualizationEngine.renderLineChart(vizPanel, pathYs, config);
      } else if (vizData.dataPoints && vizType === 'scatter-plot') {
        window.NeuralVerse.VisualizationEngine.renderScatterPlot(vizPanel, vizData.dataPoints, config);
      } else {
        window.NeuralVerse.VisualizationEngine.render(vizPanel, vizType, vizData, config);
      }
    }

    function renderCurrentViz() {
      executeCurrentLab();
    }

    function resetParameters() {
      if (!currentLab) return;
      stopAutoRun();
      prevInspectorState = null;
      currentParams = window.NeuralVerse.ParameterEngine.buildDefaults(currentLab.parameterSchema);
      renderParameterControls(currentLab, currentParams);
      executeCurrentLab();
      if (currentLab.steps && currentLab.steps.length > 0) {
        stepSession = window.NeuralVerse.ExecutionEngine.createStepSession(currentLab, currentParams);
        updateTimeline();
        updateLiveState();
        updateMetricsFromStep();
        updateInspector();
        renderAllObservations();
        updateControlStates('idle');
        var log = root.querySelector('[data-lab-log]');
        if (log) log.innerHTML = '';
        var changes = root.querySelector('[data-lab-change-entries]');
        if (changes) changes.innerHTML = '';
      }
    }

    var EXPERIMENT_FAMILIES = {
      'Model Behavior': {
        label: 'Model Behavior',
        description: 'How models learn from data',
        categories: ['machine-learning']
      },
      'Optimization': {
        label: 'Optimization',
        description: 'How models find better solutions',
        categories: ['optimization']
      },
      'Dimensionality': {
        label: 'Dimensionality Reduction',
        description: 'How high-dimensional data becomes interpretable',
        categories: ['dimensionality-reduction']
      },
      'Similarity': {
        label: 'Similarity & Embeddings',
        description: 'How representations capture meaning',
        categories: ['mathematics', 'natural-language-processing']
      },
      'Reasoning': {
        label: 'Probabilistic Reasoning',
        description: 'How evidence updates beliefs',
        categories: ['probability']
      },
      'Evaluation': {
        label: 'Evaluation',
        description: 'How model performance is measured',
        categories: ['evaluation']
      },
      'Attention': {
        label: 'Attention Mechanisms',
        description: 'How transformers focus on relevant information',
        categories: ['deep-learning']
      }
    };

    var PARAM_LABELS = {
      'slope': 'slope',
      'intercept': 'intercept',
      'noise': 'noise',
      'numPoints': 'data points',
      'weight': 'weight',
      'bias': 'bias',
      'threshold': 'threshold',
      'learningRate': 'learning rate',
      'initialX': 'initial point',
      'numIterations': 'iterations',
      'functionType': 'function',
      'numClusters': 'clusters',
      'spread': 'spread',
      'numPoints': 'data points',
      'variance1': 'variance x',
      'variance2': 'variance y',
      'rotation': 'rotation',
      'dimension': 'dimensions',
      'scale': 'scale',
      'vec1X': 'vec1 x',
      'vec1Y': 'vec1 y',
      'vec2X': 'vec2 x',
      'vec2Y': 'vec2 y',
      'priorProbability': 'prior',
      'sensitivity': 'sensitivity',
      'falsePositiveRate': 'FPR',
      'scenario': 'scenario',
      'numObservations': 'observations',
      'queryItem': 'query',
      'topK': 'top-k',
      'seqLength': 'sequence',
      'temperature': 'temperature',
      'headFocus': 'head'
    };

    function getManipulableVars(lab) {
      if (!lab.parameterSchema || lab.parameterSchema.length === 0) return [];
      return lab.parameterSchema.map(function (p) {
        var key = p.name || p.id;
        return PARAM_LABELS[key] || key;
      });
    }

    function getFamilyForLab(lab) {
      var cat = lab.category;
      for (var family in EXPERIMENT_FAMILIES) {
        var f = EXPERIMENT_FAMILIES[family];
        if (f.categories.indexOf(cat) !== -1) return f;
      }
      return null;
    }

    function renderLabIndex(container) {
      if (!container) return;
      var labs = window.NeuralVerse.LabRegistry.getAll();
      var recent = window.NeuralVerse.LabStateStorage.getRecentLabs();

      var html = '';

      // ── Command Center Header ──
      html += '<header class="nv-lab-command-header">';
      html += '<div class="nv-lab-command-title">';
      html += '<p class="nv-lab-command-eyebrow">Laboratory</p>';
      html += '<h1>Experiment Console</h1>';
      html += '</div>';
      html += '<div class="nv-lab-command-meta">';
      html += '<span class="nv-lab-command-stat">' + labs.length + ' experiments loaded</span>';
      html += '<span class="nv-lab-command-divider" aria-hidden="true"></span>';
      html += '<span class="nv-lab-command-stat">Deterministic</span>';
      html += '<span class="nv-lab-command-divider" aria-hidden="true"></span>';
      html += '<span class="nv-lab-command-stat">Local-first</span>';
      html += '</div>';
      html += '</header>';

      // ── Continue Experiment ──
      if (recent && recent.length > 0) {
        var lastLab = window.NeuralVerse.LabRegistry.get(recent[0].labId);
        if (lastLab) {
          html += '<section class="nv-lab-continue-section" aria-label="Continue Experiment">';
          html += '<div class="nv-lab-continue-card" tabindex="0" role="link" ';
          html += 'aria-label="Continue ' + escapeHtml(lastLab.title) + '" ';
          html += 'onclick="window.location.hash=\'#/laboratory/' + escapeHtml(lastLab.slug) + '\'" ';
          html += 'onkeydown="if(event.key===\'Enter\')window.location.hash=\'#/laboratory/' + escapeHtml(lastLab.slug) + '\'">';
          html += '<div class="nv-lab-continue-label">Continue Experiment</div>';
          html += '<div class="nv-lab-continue-body">';
          html += '<h3 class="nv-lab-continue-title">' + escapeHtml(lastLab.title) + '</h3>';
          html += '<p class="nv-lab-continue-summary">' + escapeHtml(lastLab.summary) + '</p>';
          html += '</div>';
          html += '<span class="nv-lab-continue-action" aria-hidden="true">Open &#8594;</span>';
          html += '</div>';
          html += '</section>';
        }
      }

      // ── Featured Experiment ──
      var featured = labs.find(function (l) { return l.slug === 'linear-regression'; }) || labs[0];
      if (featured) {
        var featuredVars = getManipulableVars(featured);
        html += '<section class="nv-lab-featured-section" aria-label="Featured Experiment">';
        html += '<div class="nv-lab-featured-card" tabindex="0" role="link" ';
        html += 'aria-label="Start experiment: ' + escapeHtml(featured.title) + '" ';
        html += 'onclick="window.location.hash=\'#/laboratory/' + escapeHtml(featured.slug) + '\'" ';
        html += 'onkeydown="if(event.key===\'Enter\')window.location.hash=\'#/laboratory/' + escapeHtml(featured.slug) + '\'">';
        html += '<div class="nv-lab-featured-badge">Featured Experiment</div>';
        html += '<div class="nv-lab-featured-body">';
        html += '<h2 class="nv-lab-featured-title">' + escapeHtml(featured.title) + '</h2>';
        html += '<p class="nv-lab-featured-summary">' + escapeHtml(featured.summary) + '</p>';
        if (featuredVars.length > 0) {
          html += '<div class="nv-lab-featured-vars">';
          html += '<span class="nv-lab-featured-vars-label">Manipulate</span>';
          html += '<span class="nv-lab-featured-vars-list">' + featuredVars.map(escapeHtml).join(' <span aria-hidden="true">&middot;</span> ') + '</span>';
          html += '</div>';
        }
        html += '<div class="nv-lab-featured-observe">';
        html += '<span class="nv-lab-featured-observe-label">Observe</span>';
        html += '<span class="nv-lab-featured-observe-text">' + escapeHtml(featured.visualization ? featured.visualization.title || 'output behavior' : 'output behavior') + '</span>';
        html += '</div>';
        html += '</div>';
        html += '<div class="nv-lab-featured-meta">';
        html += '<span class="nv-lab-featured-duration">' + escapeHtml(featured.estimatedDuration || '10 min') + '</span>';
        html += '<span class="nv-lab-featured-status">' + escapeHtml(featured.canonicalStatus || 'ready') + '</span>';
        html += '<span class="nv-lab-featured-action">Run Experiment &#8594;</span>';
        html += '</div>';
        html += '</div>';
        html += '</section>';
      }

      // ── Experiment Families ──
      var familyLabs = {};
      labs.forEach(function (lab) {
        var family = getFamilyForLab(lab);
        var key = family ? family.label : 'Other';
        if (!familyLabs[key]) familyLabs[key] = { family: family, labs: [] };
        familyLabs[key].labs.push(lab);
      });

      html += '<section class="nv-lab-families-section" aria-label="Experiment Families">';
      html += '<h2 class="nv-lab-families-heading">Experiment Families</h2>';
      html += '<div class="nv-lab-families-grid">';

      for (var familyName in familyLabs) {
        var entry = familyLabs[familyName];
        var family = entry.family;
        html += '<div class="nv-lab-family-group">';
        html += '<div class="nv-lab-family-header">';
        html += '<h3 class="nv-lab-family-title">' + escapeHtml(familyName) + '</h3>';
        html += '<span class="nv-lab-family-count">' + entry.labs.length + '</span>';
        html += '</div>';
        if (family) {
          html += '<p class="nv-lab-family-desc">' + escapeHtml(family.description) + '</p>';
        }
        html += '<div class="nv-lab-family-labs">';

        entry.labs.forEach(function (lab) {
          var vars = getManipulableVars(lab);
          html += '<a href="#/laboratory/' + escapeHtml(lab.slug) + '" ';
          html += 'class="nv-lab-experiment-card" ';
          html += 'aria-label="Run experiment: ' + escapeHtml(lab.title) + '">';
          html += '<div class="nv-lab-experiment-header">';
          html += '<h4 class="nv-lab-experiment-title">' + escapeHtml(lab.title) + '</h4>';
          html += '<span class="nv-lab-experiment-duration">' + escapeHtml(lab.estimatedDuration || '10 min') + '</span>';
          html += '</div>';
          if (vars.length > 0) {
            html += '<div class="nv-lab-experiment-manipulate">';
            html += '<span class="nv-lab-experiment-label">Manipulate</span>';
            html += '<span class="nv-lab-experiment-vars">' + vars.slice(0, 4).map(escapeHtml).join(' <span aria-hidden="true">&middot;</span> ') + '</span>';
            html += '</div>';
          }
          html += '<div class="nv-lab-experiment-observe">';
          html += '<span class="nv-lab-experiment-label">Observe</span>';
          html += '<span class="nv-lab-experiment-output">' + escapeHtml(lab.visualization ? lab.visualization.title || 'output' : 'output') + '</span>';
          html += '</div>';
          html += '<div class="nv-lab-experiment-footer">';
          html += '<span class="nv-lab-experiment-status">' + escapeHtml(lab.canonicalStatus || 'ready') + '</span>';
          html += '<span class="nv-lab-experiment-run">Run &#8594;</span>';
          html += '</div>';
          html += '</a>';
        });

        html += '</div></div>';
      }

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
      stopAutoRun();
      stepSession = null;
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
