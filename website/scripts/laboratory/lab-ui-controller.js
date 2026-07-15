/**
 * NV-1100-P7 — UI Controller
 * Manages laboratory UI: parameter controls, execution, visualization, and state.
 */

(function () {
  'use strict';

    function escapeHtml(value) {
      return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDisplayValue(value) {
    if (value === undefined || value === null) return '—';
    if (typeof value === 'number') {
      if (!isFinite(value)) return '—';
      return Math.abs(value) < 0.001 && value !== 0 ? value.toExponential(2) : String(Math.round(value * 10000) / 10000);
    }
    if (Array.isArray(value)) {
      return '[' + value.map(function (item) { return formatDisplayValue(item); }).join(', ') + ']';
    }
    if (typeof value === 'object') {
      return Object.keys(value).map(function (key) {
        return key + ': ' + formatDisplayValue(value[key]);
      }).join(', ');
    }
    var text = String(value);
    if (text === 'undefined' || text === 'null' || text === 'NaN' || text === '[object Object]') return '—';
    return text;
  }

  function createUIController(options) {
    var root = options.root || document;
    var currentLab = null;
    var currentParams = {};
    var currentResult = null;
    var executionSnapshot = null;

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
        if (schema.unit) html += '<span class="nv-lab-param-unit">' + escapeHtml(schema.unit) + '</span>';
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
            html += '</div>';
            html += '<span class="nv-lab-slider-value">' + (typeof value === 'number' ? value : value) + '</span>';
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
      updateParameterMutability();
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

      var target = vizPanel.querySelector('[data-obs-body]') || vizPanel;
      target.innerHTML = '';
      window.NeuralVerse.VisualizationEngine.render(target, vizType, execResult.result, config);
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
    var executionControlsWired = false;
    var feedbackTimeouts = [];
    var researchDisclosureOperation = 0;
    var researchDisclosureCleanup = null;

    function scheduleFeedback(callback, delay) {
      var timeoutId = setTimeout(function () {
        feedbackTimeouts = feedbackTimeouts.filter(function (id) { return id !== timeoutId; });
        callback();
      }, delay);
      feedbackTimeouts.push(timeoutId);
      return timeoutId;
    }

    function cancelFeedback() {
      feedbackTimeouts.forEach(function (timeoutId) { clearTimeout(timeoutId); });
      feedbackTimeouts = [];
      root.querySelectorAll('.nv-lab-inspector-row--changed, .nv-xai-evidence-pulse').forEach(function (element) {
        element.classList.remove('nv-lab-inspector-row--changed', 'nv-xai-evidence-pulse');
      });
    }

    function loadLab(lab) {
      if (!lab) return;

      // Research sessions belong to one laboratory. Route changes must not
      // carry an active session into another laboratory's workspace.
      if (window.NeuralVerse.ResearchMode && window.NeuralVerse.ResearchMode.isActive()) {
        var activeSession = window.NeuralVerse.ResearchMode.getSession();
         if (activeSession && activeSession.laboratoryId !== lab.id) {
          window.NeuralVerse.ResearchMode.exit();
        }
      }

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
        wireV4DisclosureToggles();
        wireResearchMode();
        wireXAIPanel();
        // V4 disclosure delegation owns Inspector accordion and drawer state.
        resetXAIState();
        updateLiveState();
        updateMetricsFromStep();
        renderPreparationVisualization();
        updateInspector();
        updateV4Telemetry();
        setWorkspacePhase('preparation');
        updateExecutionPresentation();
      }

      window.NeuralVerse.LabStateStorage.addRecentLab(lab.id, lab.title, lab.slug);
    }

    function wireExecutionControls() {
      var container = getContainer();
      if (!container || executionControlsWired) return;
      executionControlsWired = true;

      // The viewer survives route changes while its console is rendered anew.
      // Delegate controls from that stable owner so a reset or route change
      // cannot leave a newly rendered control without its execution handler.
      container.addEventListener('click', function (event) {
        var target = event.target;
        if (!target || !target.closest) return;
        if (target.closest('[data-completion-repeat]')) {
          handleExecutionAction('reset-exec');
          handleExecutionAction('run');
          return;
        }
        var variation = target.closest('[data-completion-vary]');
        if (variation) {
          handleExecutionAction('reset-exec');
          var control = container.querySelector('#lab-param-' + variation.getAttribute('data-parameter'));
          if (control) control.focus();
          return;
        }
        if (target.closest('[data-completion-evidence]')) {
          showV4Panel('inspector');
          expandV4Disclosure('inspector');
          return;
        }
        var actionControl = target.closest('[data-action]');
        if (actionControl && container.contains(actionControl)) {
          handleExecutionAction(actionControl.getAttribute('data-action'));
          return;
        }
        var speedControl = target.closest('[data-lab-v4-speed-control] [data-speed]');
        if (speedControl && container.contains(speedControl)) setExecutionSpeed(speedControl);
      });

      container.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        var target = event.target;
        if (!target || !target.closest) return;
        var speedControl = target.closest('[data-lab-v4-speed-control] [data-speed]');
        if (!speedControl || !container.contains(speedControl)) return;
        event.preventDefault();
        var options = Array.prototype.slice.call(container.querySelectorAll('[data-lab-v4-speed-control] [data-speed]'));
        var next = options.indexOf(speedControl) + (event.key === 'ArrowRight' ? 1 : -1);
        options[(next + options.length) % options.length].focus();
        setExecutionSpeed(options[(next + options.length) % options.length]);
      });

      // A range input preserves deterministic step jumping without overlapping
      // targets when laboratories expose many timeline markers.
      container.addEventListener('input', function (event) {
        var target = event.target;
        if (target && target.matches && target.matches('[data-lab-v4-timeline-input]')) {
          jumpToStep(parseInt(target.value));
        }
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

    function setExecutionSpeed(speedControl) {
      var container = getContainer();
      if (!container || !speedControl) return;
      stepSpeed = parseInt(speedControl.getAttribute('data-speed')) || 1;
      container.querySelectorAll('[data-lab-v4-speed-control] [data-speed]').forEach(function (button) {
        var selected = button === speedControl;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-checked', selected ? 'true' : 'false');
      });
    }

    // ── Phase 12.4: V4 Disclosure Toggle Management ────────────────────────

    function wireV4DisclosureToggles() {
      var container = getContainer();
      if (!container) return;

      // Parameters now lives in the Experiment Rail while the other panels
      // remain in the Analysis Deck. Delegate from the stable Lab container
      // so one canonical writer owns both locations after route replacement.
      var workspace = container;
      if (workspace.getAttribute('data-disclosure-wired') === 'true') return;
      workspace.setAttribute('data-disclosure-wired', 'true');

      workspace.addEventListener('click', function (event) {
        var target = event.target;
        if (!target || !target.closest) return;

        // Check for reset parameters button
        var resetBtn = target.closest('[data-lab-reset]');
        if (resetBtn && workspace.contains(resetBtn)) {
          event.stopImmediatePropagation();
          event.stopPropagation();
          resetParameters();
          return;
        }

        // Check for disclosure toggle (click on header or its children)
        var toggleBtn = target.closest('[data-disclosure-toggle]');
        if (toggleBtn && workspace.contains(toggleBtn)) {
          event.stopImmediatePropagation();
          var panelName = toggleBtn.getAttribute('data-disclosure-toggle');
          toggleV4Disclosure(panelName);
          return;
        }

        // Check for inspector accordion triggers
        var accordionTrigger = target.closest('[data-accordion-trigger]');
        if (accordionTrigger && workspace.contains(accordionTrigger)) {
          event.stopImmediatePropagation();
          var targetId = accordionTrigger.getAttribute('data-accordion-trigger');
          var body = workspace.querySelector('#' + targetId);
          if (!body) return;
          var isExpanded = accordionTrigger.getAttribute('aria-expanded') === 'true';
          if (isExpanded) {
            accordionTrigger.setAttribute('aria-expanded', 'false');
            body.classList.remove('is-expanded');
            body.hidden = true;
            body.inert = true;
            body.style.maxHeight = '0';
          } else {
            // Close all other accordions (single-expand)
            workspace.querySelectorAll('[data-accordion-trigger]').forEach(function (other) {
              if (other !== accordionTrigger) {
                other.setAttribute('aria-expanded', 'false');
                var otherId = other.getAttribute('data-accordion-trigger');
                var otherBody = workspace.querySelector('#' + otherId);
                if (otherBody) {
                  otherBody.classList.remove('is-expanded');
                  otherBody.hidden = true;
                  otherBody.inert = true;
                  otherBody.style.maxHeight = '0';
                }
              }
            });
            accordionTrigger.setAttribute('aria-expanded', 'true');
            body.classList.add('is-expanded');
            body.hidden = false;
            body.inert = false;
            body.style.maxHeight = body.scrollHeight + 'px';
          }
          return;
        }

        // Check for inspector drawer triggers
        var drawerTrigger = target.closest('[data-drawer-trigger]');
        if (drawerTrigger && workspace.contains(drawerTrigger)) {
          event.stopImmediatePropagation();
          var drawerId = drawerTrigger.getAttribute('data-drawer-trigger');
          var drawerBody = workspace.querySelector('#' + drawerId);
          if (!drawerBody) return;
          var drawerExpanded = drawerTrigger.getAttribute('aria-expanded') === 'true';
          drawerTrigger.setAttribute('aria-expanded', drawerExpanded ? 'false' : 'true');
          if (drawerExpanded) {
            drawerBody.classList.remove('is-expanded');
            drawerBody.hidden = true;
            drawerBody.inert = true;
            drawerBody.style.maxHeight = '0';
          } else {
            drawerBody.classList.add('is-expanded');
            drawerBody.hidden = false;
            drawerBody.inert = false;
            drawerBody.style.maxHeight = drawerBody.scrollHeight + 'px';
          }
          return;
        }
      });

    }

    function toggleV4Disclosure(panelName) {
      var container = getContainer();
      if (!container) return;

      var selectorMap = {
        'parameters': '[data-lab-v4-parameters]',
        'inspector': '[data-lab-v4-inspector-details]',
        'findings': '[data-lab-v4-findings-history]',
        'log': '[data-lab-v4-scientific-log]',
        'research': '[data-lab-v4-research]'
      };

      var panel = container.querySelector(selectorMap[panelName]);
      if (!panel) return;

      var isExpanded = panel.getAttribute('data-disclosure-state') === 'expanded';
      var toggle = panel.querySelector('[data-disclosure-toggle]');
      var body = panel.querySelector('.nv-lab-v4-disclosure-panel__body');

      if (isExpanded) {
        if (body && document.activeElement && body.contains(document.activeElement) && toggle) toggle.focus();
        panel.setAttribute('data-disclosure-state', 'collapsed');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        if (body) {
          body.hidden = true;
          body.inert = true;
          body.style.maxHeight = '0px';
          body.style.opacity = '0';
        }
      } else {
        panel.setAttribute('data-disclosure-state', 'expanded');
        panel.removeAttribute('hidden');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
        if (body) {
          body.hidden = false;
          body.inert = false;
          body.style.maxHeight = body.scrollHeight + 'px';
          body.style.opacity = '1';
        }
      }
    }

    function expandV4Disclosure(panelName) {
      var container = getContainer();
      if (!container) return;
      var selectorMap = {
        'parameters': '[data-lab-v4-parameters]',
        'inspector': '[data-lab-v4-inspector-details]',
        'findings': '[data-lab-v4-findings-history]',
        'log': '[data-lab-v4-scientific-log]',
        'research': '[data-lab-v4-research]'
      };
      var panel = container.querySelector(selectorMap[panelName]);
      if (!panel) return;
      if (panel.getAttribute('data-disclosure-state') !== 'expanded') {
        toggleV4Disclosure(panelName);
      }
    }

    function collapseV4Disclosure(panelName) {
      var container = getContainer();
      if (!container) return;
      var selectorMap = {
        'parameters': '[data-lab-v4-parameters]',
        'inspector': '[data-lab-v4-inspector-details]',
        'findings': '[data-lab-v4-findings-history]',
        'log': '[data-lab-v4-scientific-log]',
        'research': '[data-lab-v4-research]'
      };
      var panel = container.querySelector(selectorMap[panelName]);
      if (!panel) return;
      if (panel.getAttribute('data-disclosure-state') === 'expanded') {
        toggleV4Disclosure(panelName);
      }
    }

    function showV4Panel(panelName) {
      var container = getContainer();
      if (!container) return;
      var selectorMap = {
        'parameters': '[data-lab-v4-parameters]',
        'inspector': '[data-lab-v4-inspector-details]',
        'findings': '[data-lab-v4-findings-history]',
        'log': '[data-lab-v4-scientific-log]',
        'research': '[data-lab-v4-research]'
      };
      var panel = container.querySelector(selectorMap[panelName]);
      if (!panel) return;
      panel.removeAttribute('hidden');
      panel.setAttribute('data-disclosure-state', 'expanded');
      var toggle = panel.querySelector('[data-disclosure-toggle]');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      var body = panel.querySelector('.nv-lab-v4-disclosure-panel__body');
      if (body) {
        body.hidden = false;
        body.inert = false;
      }
    }

    function hideV4Panel(panelName) {
      var container = getContainer();
      if (!container) return;
      var selectorMap = {
        'parameters': '[data-lab-v4-parameters]',
        'inspector': '[data-lab-v4-inspector-details]',
        'findings': '[data-lab-v4-findings-history]',
        'log': '[data-lab-v4-scientific-log]',
        'research': '[data-lab-v4-research]'
      };
      var panel = container.querySelector(selectorMap[panelName]);
      if (!panel) return;
      panel.setAttribute('data-disclosure-state', 'collapsed');
      if (panelName !== 'parameters') {
        panel.setAttribute('hidden', '');
      }
      var toggle = panel.querySelector('[data-disclosure-toggle]');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      var body = panel.querySelector('.nv-lab-v4-disclosure-panel__body');
      if (body) {
        body.hidden = true;
        body.inert = true;
      }
    }

    function handleExecutionAction(action) {
      if (!stepSession) return;

      switch (action) {
        case 'run':
          var validation = window.NeuralVerse.ParameterEngine.validateAll(currentLab.parameterSchema, currentParams);
          if (!validation.valid) {
            showExecutionError(validation.errors.join('; '));
            return;
          }
          executionSnapshot = Object.freeze(Object.assign({}, validation.params));
           stepSession = window.NeuralVerse.ExecutionEngine.createStepSession(currentLab, executionSnapshot);
            if (stepSession && window.NeuralVerse.ExecutionEngine.startSession(stepSession)) {
              stepSession.runId = 'execution_' + Date.now();
              currentResult = window.NeuralVerse.ExecutionEngine.execute(currentLab, executionSnapshot);
             if (window.NeuralVerse.ResearchMode.isActive()) window.NeuralVerse.ResearchMode.beginRun(currentLab, executionSnapshot);
             startAutoRun();
            updateExecutionPresentation();
            focusPrimaryCommand('pause');
          }
          break;
        case 'step':
          if (!executionSnapshot) {
            var stepValidation = window.NeuralVerse.ParameterEngine.validateAll(currentLab.parameterSchema, currentParams);
            if (!stepValidation.valid) { showExecutionError(stepValidation.errors.join('; ')); return; }
            executionSnapshot = Object.freeze(Object.assign({}, stepValidation.params));
            stepSession = window.NeuralVerse.ExecutionEngine.createStepSession(currentLab, executionSnapshot);
            stepSession.runId = 'execution_' + Date.now();
            currentResult = window.NeuralVerse.ExecutionEngine.execute(currentLab, executionSnapshot);
            if (window.NeuralVerse.ResearchMode.isActive()) window.NeuralVerse.ResearchMode.beginRun(currentLab, executionSnapshot);
          }
          stepForward();
          if (window.NeuralVerse.ExecutionEngine.getLifecycleState(stepSession) === 'running') {
            window.NeuralVerse.ExecutionEngine.pauseSession(stepSession);
          }
          updateExecutionPresentation();
          break;
        case 'pause':
          stopAutoRun();
          if (window.NeuralVerse.ExecutionEngine.pauseSession(stepSession)) {
            updateExecutionPresentation();
            focusPrimaryCommand('run');
          }
          break;
         case 'reset-exec':
            stopAutoRun();
            cancelFeedback();
            if (window.NeuralVerse.ResearchMode.isActive() && window.NeuralVerse.ResearchMode.getCurrentRun()) window.NeuralVerse.ResearchMode.finishRun('aborted', { reason: 'Execution reset' }, []);
             window.NeuralVerse.ExecutionEngine.resetSession(stepSession);
             executionSnapshot = null;
            resetXAIState();
            resetScientificLog();
           updateMetricsFromStep();
          updateExecutionPresentation();
          renderPreparationVisualization();
          resetWorkspaceDisclosure();
          focusPrimaryCommand('run');
          break;
      }
    }

    function startAutoRun() {
      stopAutoRun();
      var delay = Math.max(50, 500 / stepSpeed);
      stepInterval = setInterval(function () {
        var lifecycle = window.NeuralVerse.ExecutionEngine.getLifecycleState(stepSession);
        if (!stepSession || lifecycle === 'completed' || lifecycle === 'failed') {
          stopAutoRun();
          if (lifecycle === 'completed') {
            setWorkspacePhase('completed');
            renderCompletionSummary(currentResult);
          }
          updateExecutionPresentation();
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
    var xaiFindingsBuffer = [];
    var xaiEvidenceStore = null;
    var xaiTotalFindings = 0;
    var xaiCriticalFindings = 0;
    var xaiStepsWithFindings = 0;
    var logEntryCount = 0;

    function revealPanel(selector) {
      var container = getContainer();
      if (!container) return;

      // Handle v4 inspector panel
      if (selector === '[data-lab-inspector]') {
        showV4Panel('inspector');
        expandV4Disclosure('inspector');
        return;
      }

        // Handle v4 findings panel
        if (selector === '[data-xai-panel]') {
          showV4Panel('findings');
          collapseV4Disclosure('findings');
        var xaiPanel = container.querySelector(selector);
        if (xaiPanel) {
          xaiPanel.hidden = false;
          xaiPanel.style.display = '';
          void xaiPanel.offsetWidth;
          xaiPanel.classList.add('is-visible');
        }
        return;
      }

      var panel = container.querySelector(selector);
      if (!panel) return;
      panel.hidden = false;
      panel.style.display = '';
      void panel.offsetWidth;
      panel.classList.add('is-visible');
    }

    function revealLog() {
      var container = getContainer();
      if (!container) return;
      var panel = container.querySelector('[data-lab-v4-scientific-log]');
      if (!panel) return;
      panel.removeAttribute('hidden');
      panel.setAttribute('data-disclosure-state', 'collapsed');
      var toggle = panel.querySelector('[data-disclosure-toggle]');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    function getWorkspaceBody() {
      var container = getContainer();
      return container ? container.querySelector('.nv-lab-workspace-body') : null;
    }

    function getV4Root() {
      var body = getWorkspaceBody();
      if (!body) return null;
      return body.matches('[data-lab-v4-workspace]') ? body : body.querySelector('[data-lab-v4-workspace]');
    }

    function deriveExecutionState(lifecycle) {
      var map = { ready: 'preparation', running: 'running', paused: 'paused', completed: 'completed', failed: 'failed' };
      return map[lifecycle] || 'preparation';
    }

    function getExecutionLifecycle() {
      return window.NeuralVerse.ExecutionEngine.getLifecycleState(stepSession);
    }

    function applyWorkspaceExecutionState(executionState, lifecycle) {
      var v4Root = getV4Root();
      if (!v4Root) return;
      v4Root.setAttribute('data-execution-state', executionState);
      v4Root.setAttribute('data-execution-lifecycle', lifecycle || getExecutionLifecycle());
      var consoleEl = v4Root.querySelector('[data-lab-v4-execution-console]');
      if (consoleEl) {
        consoleEl.setAttribute('data-execution-state', executionState);
        consoleEl.setAttribute('data-execution-lifecycle', lifecycle || getExecutionLifecycle());
        consoleEl.setAttribute('aria-busy', executionState === 'running' ? 'true' : 'false');
      }
    }

    function applyWorkspaceResearchState(researchState) {
      var v4Root = getV4Root();
      if (!v4Root) return;
      v4Root.setAttribute('data-research-state', researchState);
      syncResearchPresentation(researchState === 'active');
    }

    function syncResearchPresentation(isActive) {
      var container = getContainer();
      if (!container) return;
      var panel = container.querySelector('[data-research-panel]');
      var body = container.querySelector('[data-research-session-body]');
      var status = container.querySelector('[data-research-status]');
      var toggles = container.querySelectorAll('[data-research-toggle], [data-research-activate]');

      if (panel) {
        panel.setAttribute('data-research-panel-state', isActive ? 'active' : 'inactive');
        panel.setAttribute('data-disclosure-state', isActive ? 'expanded' : 'collapsed');
      }
      if (body) setResearchDisclosure(body, isActive);
      if (status) status.textContent = isActive ? 'Active' : 'Inactive';
      toggles.forEach(function (toggle) {
        toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        toggle.setAttribute('aria-label', isActive ? 'Deactivate Research Session' : 'Activate Research Session');
        toggle.setAttribute('title', isActive ? 'Deactivate Research Session' : 'Activate Research Session');
        if (toggle.classList.contains('nv-lab-v4-research__activate')) {
          toggle.textContent = isActive ? 'Deactivate Research Session' : 'Activate Research Session';
        }
      });
    }

    function setResearchDisclosure(body, isOpen) {
      var operation = ++researchDisclosureOperation;
      var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (researchDisclosureCleanup) {
        body.removeEventListener('transitionend', researchDisclosureCleanup);
        researchDisclosureCleanup = null;
      }

      if (isOpen) {
        // Availability precedes measurement so motion never decides whether the
        // Research Session is exposed to keyboard or assistive technology.
        body.hidden = false;
        body.inert = false;
        body.removeAttribute('aria-hidden');
        body.style.maxHeight = '0px';
        body.style.opacity = '0';

        var open = function () {
          if (operation !== researchDisclosureOperation) return;
          body.style.maxHeight = body.scrollHeight + 'px';
          body.style.opacity = '1';
          if (reducedMotion) body.style.maxHeight = 'none';
        };
        if (reducedMotion) open();
        else requestAnimationFrame(open);
        return;
      }

      body.inert = true;
      body.setAttribute('aria-hidden', 'true');
      if (reducedMotion || body.hidden) {
        body.hidden = true;
        body.style.maxHeight = '';
        body.style.opacity = '';
        return;
      }

      body.style.maxHeight = body.scrollHeight + 'px';
      requestAnimationFrame(function () {
        if (operation !== researchDisclosureOperation) return;
        body.style.maxHeight = '0px';
        body.style.opacity = '0';
      });

      researchDisclosureCleanup = function finishClose(event) {
        if (event.target !== body || event.propertyName !== 'max-height' || operation !== researchDisclosureOperation) return;
        body.removeEventListener('transitionend', finishClose);
        researchDisclosureCleanup = null;
        body.hidden = true;
        body.style.maxHeight = '';
        body.style.opacity = '';
      };
      body.addEventListener('transitionend', researchDisclosureCleanup);
    }

    function setWorkspacePhase(phase) {
      var body = getWorkspaceBody();
      if (!body) return;
      var v4Root = getV4Root();
      if (phase === 'research') {
        applyWorkspaceResearchState('active');
        return;
      }
      if (phase === 'completed') {
        body.setAttribute('data-workspace-phase', 'completed');
        applyWorkspaceExecutionState('completed', 'completed');
        return;
      }
      body.setAttribute('data-workspace-phase', phase);
      var lifecycle = phase === 'execution' ? 'running' : phase === 'interpretation' ? 'paused' : phase === 'preparation' ? 'ready' : getExecutionLifecycle();
      applyWorkspaceExecutionState(deriveExecutionState(lifecycle), lifecycle);
    }

    function collapseParameters() {
      collapseV4Disclosure('parameters');
    }

    function expandParameters() {
      expandV4Disclosure('parameters');
    }

    function resetWorkspaceDisclosure() {
      var container = getContainer();
      if (!container) return;
      expandParameters();
      setWorkspacePhase('preparation');
      if (window.NeuralVerse.ResearchMode && window.NeuralVerse.ResearchMode.isActive()) {
        applyWorkspaceResearchState('active');
      } else {
        applyWorkspaceResearchState('inactive');
      }

      hideV4Panel('inspector');

      var xaiPanel = container.querySelector('[data-xai-panel]');
      if (xaiPanel) {
        xaiPanel.hidden = true;
        xaiPanel.style.display = 'none';
        xaiPanel.classList.remove('is-visible');
      }

      hideV4Panel('findings');
      hideV4Panel('log');
      renderCompletionSummary(null);
    }

    function wireParameterDisclosure() {
      // Phase 12.4: Parameter disclosure is now handled by wireV4DisclosureToggles.
    }

    function wireHUDAccordions() {
      var container = getContainer();
      if (!container) return;

      // Level 2: Accordion toggles (single-expand behavior)
      var accordionTriggers = container.querySelectorAll('[data-accordion-trigger]');
      accordionTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', function () {
          var targetId = this.getAttribute('data-accordion-trigger');
          var body = container.querySelector('#' + targetId);
          if (!body) return;

          var isExpanded = this.getAttribute('aria-expanded') === 'true';

          if (isExpanded) {
            // Collapse this one
            this.setAttribute('aria-expanded', 'false');
            body.classList.remove('is-expanded');
            body.style.maxHeight = '0';
          } else {
            // Close all other accordions first (single-expand)
            accordionTriggers.forEach(function (other) {
              if (other !== trigger) {
                other.setAttribute('aria-expanded', 'false');
                var otherId = other.getAttribute('data-accordion-trigger');
                var otherBody = container.querySelector('#' + otherId);
                if (otherBody) {
                  otherBody.classList.remove('is-expanded');
                  otherBody.style.maxHeight = '0';
                }
              }
            });
            // Expand this one
            this.setAttribute('aria-expanded', 'true');
            body.classList.add('is-expanded');
            body.style.maxHeight = body.scrollHeight + 'px';
          }
        });
      });

      // Level 3: Drawer toggles (independent)
      var drawerTriggers = container.querySelectorAll('[data-drawer-trigger]');
      drawerTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', function () {
          var targetId = this.getAttribute('data-drawer-trigger');
          var body = container.querySelector('#' + targetId);
          if (!body) return;

          var isExpanded = this.getAttribute('aria-expanded') === 'true';
          this.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');

          if (isExpanded) {
            body.classList.remove('is-expanded');
            body.style.maxHeight = '0';
          } else {
            body.classList.add('is-expanded');
            body.style.maxHeight = body.scrollHeight + 'px';
          }
        });
      });
    }

    function wireCollapsibleLog() {
      // Phase 12.4: Log disclosure is now handled by wireV4DisclosureToggles.
    }

    function stepForward() {
      if (!stepSession || getExecutionLifecycle() === 'completed') return;
      window.NeuralVerse.ExecutionEngine.stepForward(stepSession);
      if (getExecutionLifecycle() === 'failed') {
         stopAutoRun();
         captureResearchRun('failed');
         updateExecutionPresentation();
        return;
      }
      var snapshot = window.NeuralVerse.ExecutionEngine.getStepSnapshot(stepSession, stepSession.currentStep);
      if (snapshot) {
        updateTimeline();
        updateLiveState();
        updateMetrics(snapshot.metrics);
        addLogEntry(snapshot);
        generateAndRenderFindings();
        updateInspector();
        renderAllObservations();
        if (getExecutionLifecycle() === 'completed') {
          setWorkspacePhase('completed');
        } else {
          setWorkspacePhase('execution');
        }
        updateV4Telemetry();
        collapseParameters();
        revealPanel('[data-lab-inspector]');
      }
      if (getExecutionLifecycle() === 'completed') {
         stopAutoRun();
         captureResearchRun('completed');
         updateExecutionPresentation();
        renderCompletionSummary(currentResult);
      }
    }

    function renderAllObservations() {
      if (!currentLab || !currentLab.observations) return;
      currentLab.observations.forEach(function (obs) {
        var body = root.querySelector('[data-obs-body="' + obs.id + '"]');
        if (body) {
          body.innerHTML = '';
          try {
            obs.render(body, currentParams, stepSession ? Math.max(0, stepSession.currentStep) : 0, stepSession ? stepSession.history : []);
          } catch (e) {
            body.innerHTML = '<span class="nv-lab-obs-error">Error rendering</span>';
          }
        }
      });
      renderScientificStageSemantics();
    }

    function renderScientificStageSemantics() {
      if (!currentLab || !window.NeuralVerse.ScientificStage) return;
      var primary = currentLab.observations && currentLab.observations[0];
      var body = primary && root.querySelector('[data-obs-body="' + primary.id + '"]');
      var stage = root.querySelector('[data-lab-v4-stage]');
      if (!body || !stage) return;
      var lifecycle = getExecutionLifecycle();
      var phase = !stepSession || stepSession.currentStep < 0 ? 'preparation' : lifecycle === 'completed' ? 'completed' : lifecycle === 'running' ? 'execution' : 'paused';
      var model = window.NeuralVerse.ScientificStage.buildViewModel(currentLab, currentParams, stepSession ? stepSession.currentStep : 0, phase, currentResult);
      stage.setAttribute('data-scientific-stage', '');
      stage.setAttribute('data-scientific-stage-state', model.phase);
      stage.setAttribute('aria-label', model.title + '. ' + model.question);
      window.NeuralVerse.ScientificStage.decorate(body, model);
    }

    function renderPreparationVisualization() {
      if (!currentLab) return;
      if (typeof currentLab.renderPreparation === 'function') {
        currentLab.observations.forEach(function (obs, index) {
          var body = root.querySelector('[data-obs-body="' + obs.id + '"]');
          if (body) {
            body.innerHTML = '';
            try {
              if (index === 0 && typeof currentLab.renderPreparation === 'function') {
                currentLab.renderPreparation(body, currentParams);
              } else {
                obs.render(body, currentParams, 0, []);
              }
            } catch (e) {
              body.innerHTML = '<span class="nv-lab-obs-error">Error rendering</span>';
            }
          }
        });
      } else {
        renderAllObservations();
      }
      renderScientificStageSemantics();
      renderCompletionSummary(null);
    }

    function renderCompletionSummary(result) {
      var container = getContainer();
      if (!container) return;
      var existing = container.querySelector('.nv-lab-v4-completion-summary');
      if (existing) existing.remove();
      if (!result) {
        var inactiveContinuations = container.querySelector('[data-lab-v4-continuations]');
        if (inactiveContinuations) { inactiveContinuations.hidden = true; inactiveContinuations.innerHTML = ''; }
        return;
      }
      if (!currentLab || !executionSnapshot || !window.NeuralVerse.CompletionNextExperiments) return;
      var evidence = xaiEvidenceStore ? xaiEvidenceStore.records.map(function (item) { return { id: item.id, label: item.title || item.observation || 'Scientific finding' }; }) : [];
      var model = window.NeuralVerse.CompletionNextExperiments.createCompletion(currentLab, stepSession && stepSession.runId, result, executionSnapshot, stepSession, evidence);
      if (!model) return;
      var el = document.createElement('div');
      el.innerHTML = window.NeuralVerse.CompletionNextExperiments.renderCompletion(model);
      el = el.firstChild;
      var continuations = container.querySelector('[data-lab-v4-continuations]');
      if (continuations && continuations.parentNode) {
        continuations.hidden = false;
        continuations.parentNode.insertBefore(el, continuations);
        continuations.innerHTML = window.NeuralVerse.CompletionNextExperiments.renderContinuations(window.NeuralVerse.CompletionNextExperiments.continuation(currentLab, model));
      }
    }

    function captureResearchRun(status) {
      if (!window.NeuralVerse.ResearchMode.isActive() || !window.NeuralVerse.ResearchMode.getCurrentRun()) return;
      var scientificResult = currentResult && currentResult.success ? currentResult.result : currentResult;
      var summary = currentLab && typeof currentLab.getCompletionSummary === 'function' ? currentLab.getCompletionSummary(scientificResult, executionSnapshot || currentParams) : [];
      var measurements = (summary || []).map(function (item) { return { label: item.label, value: item.value }; });
      window.NeuralVerse.ResearchMode.finishRun(status, scientificResult || { error: stepSession && stepSession.error }, measurements);
      renderResearchWorkspace();
    }

    function updateInspector() {
      if (!currentLab || !currentLab.inspector) return;
      var inspector = currentLab.inspector;
      var container = getContainer();
      if (!container) return;

      var state = inspector.computeState(currentParams, stepSession ? stepSession.currentStep : 0, stepSession ? stepSession.history : []);
      if (stepSession && getExecutionLifecycle() === 'completed') {
        Object.keys(state).forEach(function (key) {
          if (/^(running|ready|paused)$/i.test(String(state[key])) && /(status|state|phase)/i.test(key)) state[key] = 'Outcome Unavailable';
        });
      }

      // ── Level 1: Update HUD telemetry grid ──
      var hudMetrics = container.querySelector('[data-lab-hud-metrics]');
      if (hudMetrics) {
        var html = '';
        // The stage owns a compact live readout; detailed cards remain in disclosure.
        var primaryCards = [];
        if (inspector.sections && inspector.sections.length > 0) {
          var firstSection = inspector.sections[0];
          primaryCards = firstSection.cards.slice(0, 5);
        }
        primaryCards.forEach(function (card) {
          var newVal = state[card.key];
          var displayVal = formatDisplayValue(newVal);
          html += '<div class="nv-lab-hud-metric" data-hud-metric="' + escapeHtml(card.key) + '">';
          html += '<dt class="nv-lab-hud-metric-label">' + escapeHtml(card.label) + '</dt>';
          html += '<dd class="nv-lab-hud-metric-value" data-hud-metric-value="' + escapeHtml(card.key) + '">' + escapeHtml(displayVal) + '</dd>';
          html += '</div>';
        });
        hudMetrics.innerHTML = html;
      }

      // ── Level 2 & 3: Update all card values ──
      inspector.sections.forEach(function (section) {
        section.cards.forEach(function (card) {
          var valueEls = Array.prototype.slice.call(container.querySelectorAll('[data-inspector-value="' + card.key + '"], [data-inspector-alias-for="' + card.key + '"]'));
          var valueEl = valueEls[0];
          var interpEl = container.querySelector('[data-inspector-interpretation="' + card.key + '"]');
          var cardEl = container.querySelector('[data-inspector-key="' + card.key + '"]');

          if (valueEl) {
            var newVal = state[card.key];
            var displayVal = card.fixed && typeof newVal === 'number' && isFinite(newVal) ? String(newVal) : formatDisplayValue(newVal);
            var oldVal = valueEl.textContent;
            valueEls.forEach(function (el) { el.textContent = displayVal; });

            // Live highlight on change
            if (cardEl && oldVal !== displayVal && oldVal !== '—') {
              cardEl.classList.add('nv-lab-inspector-row--changed');
              scheduleFeedback(function () {
                cardEl.classList.remove('nv-lab-inspector-row--changed');
              }, 600);
            }
          }

          if (interpEl && card.interpretation) {
            var interp = card.interpretation(state[card.key], state);
            interpEl.textContent = formatDisplayValue(interp);
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

    function updateV4Telemetry() {
      if (!currentLab || !currentLab.inspector) return;
      var container = getContainer();
      if (!container) return;
      var metrics = container.querySelector('[data-lab-v4-telemetry] [data-lab-hud-metrics]');
      if (!metrics) return;

      var v4Root = getV4Root();
      var isPreparation = v4Root && v4Root.getAttribute('data-execution-state') === 'preparation';

      if (isPreparation && typeof currentLab.getPreparationTelemetry === 'function') {
        var prepTelemetry = currentLab.getPreparationTelemetry(currentParams);
        var html = '';
        prepTelemetry.forEach(function (item) {
          html += '<div class="nv-lab-hud-metric" data-hud-metric="' + escapeHtml(item.key) + '">';
          html += '<dt class="nv-lab-hud-metric-label">' + escapeHtml(item.label) + '</dt>';
          html += '<dd class="nv-lab-hud-metric-value" data-hud-metric-value="' + escapeHtml(item.key) + '">' + escapeHtml(formatDisplayValue(item.value)) + '</dd>';
          html += '</div>';
        });
        metrics.innerHTML = html;
        return;
      }

      var state = currentLab.inspector.computeState(
        currentParams,
        stepSession ? Math.max(0, stepSession.currentStep) : 0,
        stepSession ? stepSession.history : []
      );
      var isCompleted = v4Root && v4Root.getAttribute('data-execution-state') === 'completed';
      var firstSection = currentLab.inspector.sections && currentLab.inspector.sections[0];
      var cards = firstSection && firstSection.cards ? firstSection.cards.slice(0, 4) : [];
      var html = '<div class="nv-lab-hud-metric" data-hud-metric="step">';
      html += '<dt class="nv-lab-hud-metric-label">Step</dt>';
      html += '<dd class="nv-lab-hud-metric-value" data-hud-metric-value="step">' +
        (stepSession ? Math.max(0, stepSession.currentStep + 1) + ' / ' + stepSession.totalSteps : '0') + '</dd>';
      html += '</div>';
      cards.forEach(function (card) {
        var value = state[card.key];
        if (isCompleted && /(status|state|phase)/i.test(card.key) && /^(running|ready|paused)$/i.test(String(value))) {
          // These are registered terminal scientific labels, not execution
          // lifecycle substitutes. Other laboratories retain the neutral fallback.
          value = currentLab.id === 'lab-gradient-descent' ? 'Not Converged' : currentLab.id === 'lab-kmeans-clustering' ? 'Converged' : 'Outcome Unavailable';
        }
        html += '<div class="nv-lab-hud-metric" data-hud-metric="' + escapeHtml(card.key) + '">';
        html += '<dt class="nv-lab-hud-metric-label">' + escapeHtml(card.label) + '</dt>';
        html += '<dd class="nv-lab-hud-metric-value" data-hud-metric-value="' + escapeHtml(card.key) + '">' + escapeHtml(formatDisplayValue(value)) + '</dd>';
        html += '</div>';
      });
      metrics.innerHTML = html;
    }

    function addChangeEntry(change) {
      // Changes are logged to the terminal
      var container = getContainer();
      if (!container) return;
      var entries = container.querySelector('[data-lab-log-entries]');
      if (!entries) return;

      var entry = document.createElement('div');
      entry.className = 'nv-lab-log-entry';

      var now = new Date();
      var timestamp = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      entry.innerHTML = '<time class="nv-lab-log-entry__time">' + timestamp + '</time>' +
        '<span class="nv-lab-log-entry__type">State</span>' +
        '<span class="nv-lab-log-entry__message">' + escapeHtml(change.label) + '</span>';

      entries.appendChild(entry);
      entries.scrollTop = entries.scrollHeight;

      // Update log count
      logEntryCount++;
      var countEl = container.querySelector('[data-lab-log-count]');
      if (countEl) countEl.textContent = logEntryCount;
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
        updateV4Telemetry();
        renderAllObservations();
      }
      if (getExecutionLifecycle() === 'completed') {
        setWorkspacePhase('completed');
        updateExecutionPresentation();
        renderCompletionSummary(currentResult);
      } else {
        window.NeuralVerse.ExecutionEngine.pauseSession(stepSession);
        updateExecutionPresentation();
      }
    }

    function updateExecutionPresentation() {
      updateControlStates();
      updateTimeline();
      updateLiveState();
      updateV4Telemetry();
      syncScientificStageLifecycle();
      updateParameterMutability();
    }

    function updateParameterMutability() {
      var panel = getParameterPanel();
      if (!panel) return;
      var lifecycle = stepSession ? getExecutionLifecycle() : 'ready';
      var locked = lifecycle === 'running' || lifecycle === 'paused';
      panel.querySelectorAll('input, select, textarea').forEach(function (control) {
        control.disabled = locked;
        control.setAttribute('aria-disabled', locked ? 'true' : 'false');
      });
      panel.setAttribute('data-configuration-state', locked ? 'locked' : executionSnapshot ? 'completed-snapshot' : 'editable');
    }

    function syncScientificStageLifecycle() {
      var stage = root.querySelector('[data-lab-v4-stage]');
      if (!stage) return;
      var lifecycle = getExecutionLifecycle();
      var state = lifecycle === 'ready' ? 'preparation' : lifecycle === 'running' ? 'execution' : lifecycle;
      stage.setAttribute('data-scientific-stage-state', state);
    }

    function focusPrimaryCommand(action) {
      var container = getContainer();
      if (!container) return;
      var target = container.querySelector('[data-action="' + action + '"]');
      if (target) setTimeout(function () { target.focus(); }, 0);
    }

    function updateControlStates() {
      var container = getContainer();
      if (!container) return;
      var lifecycle = getExecutionLifecycle();
      var runBtn = container.querySelector('[data-action="run"]');
      var pauseBtn = container.querySelector('[data-action="pause"]');
      var stepBtn = container.querySelector('[data-action="step"]');
      var resetBtn = container.querySelector('[data-action="reset-exec"]');
      if (runBtn) runBtn.disabled = lifecycle === 'running' || lifecycle === 'completed' || lifecycle === 'failed';
      if (runBtn) {
        var resuming = lifecycle === 'paused';
        runBtn.textContent = resuming ? 'Resume' : 'Run';
        runBtn.setAttribute('aria-label', resuming ? 'Resume experiment' : 'Run experiment');
        runBtn.classList.toggle('nv-lab-v4-execution-console__control--primary', lifecycle === 'ready' || lifecycle === 'paused');
      }
      if (pauseBtn) {
        pauseBtn.disabled = lifecycle !== 'running';
        pauseBtn.classList.toggle('nv-lab-v4-execution-console__control--primary', lifecycle === 'running');
      }
      if (stepBtn) stepBtn.disabled = lifecycle === 'completed' || lifecycle === 'failed';
      if (resetBtn) {
        resetBtn.disabled = lifecycle === 'ready';
        resetBtn.classList.toggle('nv-lab-v4-execution-console__control--primary', lifecycle === 'completed' || lifecycle === 'failed');
      }
      applyWorkspaceExecutionState(deriveExecutionState(lifecycle), lifecycle);
    }

    function updateTimeline() {
      var container = getContainer();
      if (!container || !stepSession) return;
      var currentStep = Math.max(0, stepSession.currentStep);
      var progressState = window.NeuralVerse.ExecutionEngine.getProgress(stepSession);
      container.querySelectorAll('.nv-lab-v4-timeline__step').forEach(function (el) {
        var idx = parseInt(el.getAttribute('data-step'));
        el.classList.remove('is-current', 'is-completed');
        if (idx === currentStep) el.classList.add('is-current');
        else if (idx < currentStep) el.classList.add('is-completed');
      });
      var timelineInput = container.querySelector('[data-lab-v4-timeline-input]');
      if (timelineInput) {
        timelineInput.value = String(currentStep);
        timelineInput.setAttribute('aria-valuenow', String(currentStep));
        timelineInput.setAttribute('aria-valuetext', getExecutionLifecycle() === 'ready' ? 'Ready at step 0 of ' + stepSession.totalSteps : 'Step ' + progressState.current + ' of ' + progressState.total);
      }
      var progress = container.querySelector('[data-lab-v4-timeline-progress]');
      if (progress) progress.style.width = (progressState.fraction * 100) + '%';
    }

    function updateLiveState() {
      var container = getContainer();
      if (!container) return;
      var stepEl = container.querySelector('[data-live-step]');
      var headerStepEl = container.querySelector('[data-lab-current-step]');
      var statusEl = container.querySelector('[data-live-status]');
      var stageStepEl = container.querySelector('[data-lab-v4-telemetry] [data-hud-metric-value="step"]');
      if (stepSession) {
        var lifecycle = getExecutionLifecycle();
        var progressState = window.NeuralVerse.ExecutionEngine.getProgress(stepSession);
        var snapshot = window.NeuralVerse.ExecutionEngine.getStepSnapshot(stepSession, stepSession.currentStep);
        var messageEl = container.querySelector('[data-execution-message]');
        var label = snapshot && snapshot.label ? snapshot.label : 'Awaiting start';
        var messages = {
          ready: 'Run the experiment to begin execution.',
          running: 'Executing: ' + label + '.',
          paused: 'Paused after: ' + label + '. Resume to continue.',
          completed: 'Execution completed. Review the experiment outcome below.',
          failed: stepSession.error || 'The experiment could not complete. Reset to try again.'
        };
        if (stepEl) stepEl.textContent = progressState.current + ' / ' + progressState.total;
        if (headerStepEl) headerStepEl.textContent = progressState.current + ' / ' + progressState.total;
        if (statusEl) statusEl.textContent = lifecycle.charAt(0).toUpperCase() + lifecycle.slice(1);
        if (messageEl) messageEl.textContent = messages[lifecycle];
        if (stageStepEl) stageStepEl.textContent = progressState.current + ' / ' + progressState.total;
      } else {
        if (stepEl) stepEl.textContent = 'N/A';
        if (headerStepEl) headerStepEl.textContent = 'N/A';
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
      // Metrics are now inline in the inspector header
      var metricsEl = container.querySelector('[data-lab-inspector-metrics]');
      if (!metricsEl) return;
      if (!metrics || Object.keys(metrics).length === 0) {
        metricsEl.innerHTML = '';
        return;
      }
      var html = '';
      for (var key in metrics) {
        html += '<div class="nv-lab-ws-inspector-metric">';
        html += '<span class="nv-lab-ws-inspector-metric-label">' + escapeHtml(key) + '</span>';
        html += '<span class="nv-lab-ws-inspector-metric-value">' + escapeHtml(formatDisplayValue(metrics[key])) + '</span>';
        html += '</div>';
      }
      metricsEl.innerHTML = html;
    }

    function addLogEntry(snapshot) {
      var container = getContainer();
      if (!container) return;
      var entries = container.querySelector('[data-lab-log-entries]');
      if (!entries) return;

      revealLog();

      // Remove initial placeholder if present
      var placeholder = entries.querySelector('.nv-lab-log-entry--system');
      if (placeholder) placeholder.remove();

      var entry = document.createElement('div');
      entry.className = 'nv-lab-log-entry';

      var now = new Date();
      var timestamp = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      var logMessage = snapshot.label;
      if (snapshot.metrics && Object.keys(snapshot.metrics).length > 0) {
        var metricKeys = Object.keys(snapshot.metrics);
        var keyMetric = metricKeys.find(function(k) { return k !== 'Phase' && k !== 'Status'; });
        if (keyMetric && snapshot.metrics[keyMetric] !== undefined) {
          logMessage += ' — ' + keyMetric + ': ' + formatDisplayValue(snapshot.metrics[keyMetric]);
        }
      }

      entry.innerHTML = '<time class="nv-lab-log-entry__time">' + timestamp + '</time>' +
        '<span class="nv-lab-log-entry__type">Step ' + (snapshot.stepIndex + 1) + '</span>' +
        '<span class="nv-lab-log-entry__message">' + escapeHtml(logMessage) + '</span>';

      entries.appendChild(entry);
      entries.scrollTop = entries.scrollHeight;

      // Update log count
      logEntryCount++;
      var countEl = container.querySelector('[data-lab-log-count]');
      if (countEl) countEl.textContent = logEntryCount;
    }

    function resetScientificLog() {
      var container = getContainer();
      if (!container) return;
      var entries = container.querySelector('[data-lab-log-entries]');
      if (entries) entries.innerHTML = '';
      logEntryCount = 0;
      var countEl = container.querySelector('[data-lab-log-count]');
      if (countEl) countEl.textContent = '0';
      hideV4Panel('log');
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
      renderAllObservations();
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
        renderPreparationVisualization();
        updateControlStates();
        resetScientificLog();
        // Hide XAI panel on reset
        var xaiPanel = root.querySelector('[data-xai-panel]');
        if (xaiPanel) {
          xaiPanel.hidden = true;
          xaiPanel.style.display = 'none';
          xaiPanel.classList.remove('is-visible');
        }
        hideV4Panel('findings');
        resetXAIState();
        setWorkspacePhase('preparation');
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

    // ── Domain metadata for conceptual atlas ────────────────
    var DOMAIN_META = {
      'Model Behavior': {
        question: 'How does a model learn from data?',
        importance: 'Foundation of all supervised learning.',
        diagram: 'Data → Hypothesis → Fit → Predict',
        relatedConcepts: ['Linear Algebra', 'Statistics', 'Calculus'],
        usedIn: ['Medical diagnosis', 'Financial modeling', 'Forecasting'],
        labs: ['Linear Regression', 'K-Means Clustering']
      },
      'Optimization': {
        question: 'How do models find better solutions?',
        importance: 'The engine behind learning.',
        diagram: 'Initialize → Compute Gradient → Update → Converge',
        relatedConcepts: ['Calculus', 'Convex Analysis', 'Numerical Methods'],
        usedIn: ['Neural network training', 'Resource allocation', 'Auto-tuning'],
        labs: ['Gradient Descent']
      },
      'Dimensionality': {
        question: 'How does high-dimensional data become interpretable?',
        importance: 'Bridge the gap between data and human understanding.',
        diagram: 'High-D → Covariance → Eigen → Project',
        relatedConcepts: ['Linear Algebra', 'Statistics', 'Information Theory'],
        usedIn: ['Data visualization', 'Feature selection', 'Noise reduction'],
        labs: ['PCA Projection']
      },
      'Similarity': {
        question: 'How do representations capture meaning?',
        importance: 'From search engines to ChatGPT.',
        diagram: 'Embed → Vector → Compare → Retrieve',
        relatedConcepts: ['Vector Spaces', 'Information Retrieval', 'NLP'],
        usedIn: ['Semantic search', 'Recommendation systems', 'Code completion'],
        labs: ['Embedding Similarity', 'Cosine Similarity']
      },
      'Reasoning': {
        question: 'How does evidence update beliefs?',
        importance: 'Probabilistic foundations of scientific methodology.',
        diagram: 'Prior + Evidence → Likelihood → Posterior',
        relatedConcepts: ['Probability Theory', 'Decision Theory', 'Epistemology'],
        usedIn: ['Medical diagnostics', 'Spam detection', 'A/B testing'],
        labs: ['Bayes Rule']
      },
      'Evaluation': {
        question: 'How is model performance measured?',
        importance: 'Wrong metrics lead to wrong conclusions.',
        diagram: 'Predict → Threshold → Precision/Recall → F1',
        relatedConcepts: ['Statistics', 'Decision Theory', 'Information Theory'],
        usedIn: ['Model comparison', 'Quality assurance', 'Regulatory compliance'],
        labs: ['Precision vs Recall']
      },
      'Attention': {
        question: 'How do transformers focus on relevant information?',
        importance: 'The most impactful architecture in modern AI.',
        diagram: 'Tokens → Q/K/V → Score → Context',
        relatedConcepts: ['Linear Algebra', 'Deep Learning', 'NLP'],
        usedIn: ['Language models', 'Code generation', 'Multimodal AI'],
        labs: ['Transformer Attention']
      }
    };

    // ── Pathway metadata for learning journeys ──────────────
    var PATHWAY_META = {
      'gradient-descent→logistic-regression→precision-recall': {
        title: 'Classification Pipeline',
        description: 'From optimization to evaluation — a complete classifier understanding.',
        learningObjectives: ['Understand gradient mechanics', 'Observe decision boundaries', 'Master threshold trade-offs'],
        competencies: ['Optimization', 'Classification', 'Evaluation']
      },
      'linear-regression→logistic-regression': {
        title: 'Regression to Classification',
        description: 'See how linear architecture transforms from numbers to categories.',
        learningObjectives: ['Compare regression vs classification', 'Understand sigmoid activation', 'Master cross-entropy loss'],
        competencies: ['Linear Models', 'Activation Functions', 'Loss Functions']
      },
      'kmeans-clustering→embedding-similarity→cosine-similarity': {
        title: 'Representation Geometry',
        description: 'From raw clustering to understanding vector geometry.',
        learningObjectives: ['Discover cluster structure', 'Explore vector spaces', 'Understand angular similarity'],
        competencies: ['Clustering', 'Vector Spaces', 'Similarity Metrics']
      },
      'embedding-similarity→cosine-similarity→transformer-attention': {
        title: 'From Vectors to Attention',
        description: 'Follow the thread to the mechanism behind modern language models.',
        learningObjectives: ['Build semantic vectors', 'Compare direction vs magnitude', 'Score with Query-Key attention'],
        competencies: ['Embeddings', 'Geometry', 'Attention Mechanisms']
      },
      'linear-regression→pca-projection': {
        title: 'Data Understanding',
        description: 'Two lenses on the same data — prediction and structure.',
        learningObjectives: ['Fit predictive models', 'Reveal variance directions', 'Extract meaningful features'],
        competencies: ['Regression', 'Dimensionality Reduction', 'Feature Engineering']
      },
      'logistic-regression→bayes-rule': {
        title: 'Probabilistic Thinking',
        description: 'Connect discriminative classifiers to probabilistic reasoning.',
        learningObjectives: ['Model P(y|x)', 'Update prior with evidence', 'Understand base rates'],
        competencies: ['Classification', 'Bayesian Inference', 'Uncertainty']
      }
    };

    // ══════════════════════════════════════════════════════════════
    //  NV-900-M3 — DISCOVERY INDEX RENDERING
    // ══════════════════════════════════════════════════════════════

    function renderDiscoveryIndex(container) {
      if (!container) return;

      var labs = window.NeuralVerse.LabRegistry.getAll();

      function labBySlug(slug) {
        return window.NeuralVerse.LabRegistry.getBySlug(slug);
      }

      function labLink(lab) {
        return lab ? '#/laboratory/' + escapeHtml(lab.slug) : '#/laboratory';
      }

      function getExperiment(slug, fallbackIndex) {
        return labBySlug(slug) || labs[fallbackIndex] || null;
      }

      function formatConcept(concept) {
        return String(concept || '').split('-').map(function (part) {
          return part.charAt(0).toUpperCase() + part.slice(1);
        }).join(' ');
      }

      var experiments = [
        { slug: 'gradient-descent', key: 'descent', title: 'Gradient Descent', sentence: 'Loss optimization using gradients.', difficulty: 'Beginner', domain: 'Optimization' },
        { slug: 'linear-regression', key: 'linear', title: 'Linear Regression', sentence: 'Fit a line and inspect residual error.', difficulty: 'Beginner', domain: 'Models' },
        { slug: 'logistic-regression', key: 'logistic', title: 'Logistic Regression', sentence: 'Move a decision boundary through probability space.', difficulty: 'Intermediate', domain: 'Models' },
        { slug: 'kmeans-clustering', key: 'kmeans', title: 'K-Means', sentence: 'Centroids drift as assignments stabilize.', difficulty: 'Beginner', domain: 'Geometry' },
        { slug: 'pca-projection', key: 'pca', title: 'PCA Projection', sentence: 'Project variance onto a lower-dimensional axis.', difficulty: 'Intermediate', domain: 'Geometry' },
        { slug: 'bayes-rule', key: 'bayes', title: 'Bayesian Updating', sentence: 'Update posterior belief after evidence arrives.', difficulty: 'Intermediate', domain: 'Probability' },
        { slug: 'embedding-similarity', key: 'embedding', title: 'Embedding Similarity', sentence: 'Compare semantic neighbors in vector space.', difficulty: 'Intermediate', domain: 'Representation' },
        { slug: 'cosine-similarity', key: 'cosine', title: 'Cosine Similarity', sentence: 'Measure vector alignment by angle.', difficulty: 'Beginner', domain: 'Representation' },
        { slug: 'precision-recall', key: 'threshold', title: 'Precision and Recall', sentence: 'Move a threshold and inspect classifier tradeoffs.', difficulty: 'Intermediate', domain: 'Evaluation' },
        { slug: 'transformer-attention', key: 'attention', title: 'Transformer Attention', sentence: 'Inspect how tokens distribute attention weights.', difficulty: 'Advanced', domain: 'Attention' },
        { slug: 'kernel-observatory', key: 'kernel', title: 'Kernel Observatory', sentence: 'Observe, predict, and inspect 2D image convolution.', difficulty: 'Intermediate', domain: 'Computer Vision' }
      ].map(function (spec, index) {
        spec.lab = getExperiment(spec.slug, index);
        spec.concepts = spec.lab ? (spec.lab.conceptReferences || []).slice(0, 4).map(formatConcept) : [];
        return spec.lab ? spec : null;
      }).filter(Boolean);

      var groups = [
        { label: 'Optimization', domains: ['Optimization'] },
        { label: 'Models', domains: ['Models'] },
        { label: 'Representation', domains: ['Representation', 'Geometry'] },
        { label: 'Reasoning', domains: ['Probability'] },
        { label: 'Evaluation', domains: ['Evaluation'] },
        { label: 'Transformers', domains: ['Attention'] },
        { label: 'Computer Vision', domains: ['Computer Vision'] }
      ];

      function conceptPayload(concepts) {
        return concepts.join('|');
      }

      function prerequisiteFor(item) {
        if (item.difficulty === 'Advanced') return 'Vector calculus';
        if (item.domain === 'Probability') return 'Conditional probability';
        if (item.domain === 'Attention') return 'Sequence models';
        if (item.domain === 'Representation' || item.domain === 'Geometry') return 'Linear algebra';
        if (item.difficulty === 'Intermediate') return 'Model basics';
        return 'None';
      }

      function renderWorkspaceItem(item, active) {
        return '<button type="button" class="nv-lab-workspace-item' + (active ? ' is-active' : '') + '" data-lab-workspace-item data-title="' + escapeHtml(item.title) + '" data-domain="' + escapeHtml(item.domain) + '" data-key="' + escapeHtml(item.key) + '" data-sentence="' + escapeHtml(item.sentence) + '" data-difficulty="' + escapeHtml(item.difficulty) + '" data-duration="' + escapeHtml(item.lab.estimatedDuration || '10 minutes') + '" data-prerequisite="' + escapeHtml(prerequisiteFor(item)) + '" data-concepts="' + escapeHtml(conceptPayload(item.concepts)) + '" data-href="' + labLink(item.lab) + '" aria-pressed="' + (active ? 'true' : 'false') + '"><span>' + escapeHtml(item.title) + '</span><small>' + escapeHtml(item.difficulty) + '</small></button>';
      }

      var activeExperiment = experiments[0];
      var html = '';
      html += '<div class="nv-disco-reset nv-lab-museum" data-laboratory-experience-reset>';
      html += '<section class="nv-lab-museum-foyer nv-page-section__header" aria-labelledby="lab-museum-title">';
      html += '<h1 id="lab-museum-title">Scientific Laboratory</h1>';
      html += '<p>Deterministic AI experiments.</p>';
      html += '</section>';
      html += '<div class="nv-lab-workspace" aria-label="Scientific experiment workspace">';
      html += '<nav class="nv-lab-workspace-nav" aria-label="Experiment explorer">';
      groups.forEach(function (group) {
        var groupItems = experiments.filter(function (item) { return group.domains.indexOf(item.domain) !== -1; });
        if (!groupItems.length) return;
        html += '<section class="nv-lab-workspace-group">';
        html += '<button type="button" class="nv-lab-workspace-group__toggle" data-lab-group-toggle aria-expanded="true"><span>' + escapeHtml(group.label) + '</span><small>' + groupItems.length + '</small></button>';
        html += '<div class="nv-lab-workspace-group__items">';
        groupItems.forEach(function (item) { html += renderWorkspaceItem(item, item === activeExperiment); });
        html += '</div>';
        html += '</section>';
      });
      html += '</nav>';
      html += '<article class="nv-lab-featured" data-lab-featured aria-labelledby="lab-featured-title">';
      html += '<div class="nv-lab-featured__visual" data-lab-featured-visual aria-hidden="true">' + renderExhibitVisual(activeExperiment.key) + '</div>';
      html += '<div class="nv-lab-featured__content">';
      html += '<span class="nv-lab-featured__domain" data-lab-featured-domain>' + escapeHtml(activeExperiment.domain) + '</span>';
      html += '<h2 id="lab-featured-title" data-lab-featured-title>' + escapeHtml(activeExperiment.title) + '</h2>';
      html += '<p data-lab-featured-description>' + escapeHtml(activeExperiment.sentence) + '</p>';
      html += '<dl class="nv-lab-featured__meta"><div><dt>Difficulty</dt><dd data-lab-featured-difficulty>' + escapeHtml(activeExperiment.difficulty) + '</dd></div><div><dt>Duration</dt><dd data-lab-featured-duration>' + escapeHtml(activeExperiment.lab.estimatedDuration || '10 minutes') + '</dd></div><div><dt>Prerequisite</dt><dd data-lab-featured-prerequisite>' + escapeHtml(prerequisiteFor(activeExperiment)) + '</dd></div></dl>';
      html += '<div class="nv-lab-featured__concepts" data-lab-featured-concepts>';
      activeExperiment.concepts.forEach(function (concept) { html += '<span>' + escapeHtml(concept) + '</span>'; });
      html += '</div>';
      html += '<a class="nv-lab-featured__open" data-lab-featured-open href="' + labLink(activeExperiment.lab) + '">Open Laboratory</a>';
      html += '</div>';
      html += '</article>';
      html += '</div>';
      html += '</div>';
      container.innerHTML = html;
      wireLaboratoryWorkspace(container);
    }

    function wireLaboratoryWorkspace(container) {
      var items = container.querySelectorAll('[data-lab-workspace-item]');
      var visual = container.querySelector('[data-lab-featured-visual]');
      var domain = container.querySelector('[data-lab-featured-domain]');
      var title = container.querySelector('[data-lab-featured-title]');
      var description = container.querySelector('[data-lab-featured-description]');
      var difficulty = container.querySelector('[data-lab-featured-difficulty]');
      var duration = container.querySelector('[data-lab-featured-duration]');
      var prerequisite = container.querySelector('[data-lab-featured-prerequisite]');
      var concepts = container.querySelector('[data-lab-featured-concepts]');
      var open = container.querySelector('[data-lab-featured-open]');

      function selectItem(item) {
        items.forEach(function (candidate) {
          var active = candidate === item;
          candidate.classList.toggle('is-active', active);
          candidate.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        if (visual) visual.innerHTML = renderExhibitVisual(item.getAttribute('data-key') || 'descent');
        if (domain) domain.textContent = item.getAttribute('data-domain') || '';
        if (title) title.textContent = item.getAttribute('data-title') || '';
        if (description) description.textContent = item.getAttribute('data-sentence') || '';
        if (difficulty) difficulty.textContent = item.getAttribute('data-difficulty') || '';
        if (duration) duration.textContent = item.getAttribute('data-duration') || '';
        if (prerequisite) prerequisite.textContent = item.getAttribute('data-prerequisite') || 'None';
        if (open) open.setAttribute('href', item.getAttribute('data-href') || '#/laboratory');
        if (concepts) {
          concepts.innerHTML = '';
          (item.getAttribute('data-concepts') || '').split('|').filter(Boolean).forEach(function (concept) {
            var chip = document.createElement('span');
            chip.textContent = concept;
            concepts.appendChild(chip);
          });
        }
      }

      items.forEach(function (item) {
        item.addEventListener('click', function () { selectItem(item); });
        item.addEventListener('focus', function () { selectItem(item); });
      });

      container.querySelectorAll('[data-lab-group-toggle]').forEach(function (toggle) {
        toggle.addEventListener('click', function () {
          var expanded = toggle.getAttribute('aria-expanded') !== 'false';
          toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          var itemsEl = toggle.parentElement ? toggle.parentElement.querySelector('.nv-lab-workspace-group__items') : null;
          if (itemsEl) itemsEl.hidden = expanded;
        });
      });
    }

    function renderExhibitVisual(key) {
      if (key === 'attention') {
        return '<svg viewBox="0 0 320 160" role="presentation"><g class="museum-figure-frame"><path d="M38 28H282M38 132H282M38 28V132M282 28V132"/><path d="M38 80H282M99 132V126M160 132V126M221 132V126"/></g><g class="museum-attention-lines"><path d="M59 116C84 44 188 44 251 116"/><path d="M123 116C136 76 170 76 187 116"/><path d="M187 116C174 48 92 50 59 116"/></g><g class="museum-attention-tokens"><rect x="36" y="116" width="46" height="18"/><rect x="100" y="116" width="46" height="18"/><rect x="164" y="116" width="46" height="18"/><rect x="228" y="116" width="46" height="18"/></g><g class="museum-figure-labels"><text x="45" y="144">T01</text><text x="109" y="144">T02</text><text x="173" y="144">T03</text><text x="237" y="144">T04</text><text x="254" y="38">w .72</text><text x="132" y="24">w .31</text></g></svg>';
      }
      if (key === 'embedding') {
        return '<svg viewBox="0 0 320 160" role="presentation"><g class="museum-figure-frame"><path d="M46 126H274M46 126V34"/><path d="M84 126V121M122 126V121M160 126V121M198 126V121M236 126V121M46 96H52M46 66H52M46 36H52"/></g><g class="museum-embedding-cloud"><circle cx="78" cy="54" r="2.6"/><circle cx="108" cy="74" r="3.3"/><circle cx="134" cy="48" r="2.6"/><circle cx="174" cy="90" r="2.6"/><circle cx="210" cy="62" r="3.3"/><circle cx="238" cy="96" r="2.6"/><circle cx="140" cy="118" r="2.6"/></g><g class="museum-embedding-neighbors"><path d="M160 80L108 74M160 80L174 90M160 80L210 62"/><circle cx="160" cy="80" r="5"/></g><g class="museum-figure-labels"><text x="63" y="42">cluster A</text><text x="217" y="52">cluster B</text><text x="164" y="56">query</text><text x="88" y="104">k=3</text></g></svg>';
      }
      if (key === 'kmeans') {
        return '<svg viewBox="0 0 320 160" role="presentation"><g class="museum-figure-frame"><path d="M48 126H270M48 126V34"/><path d="M104 126V121M160 126V121M216 126V121M48 82H54"/></g><g class="museum-kmeans-points"><circle cx="72" cy="56" r="2.6"/><circle cx="92" cy="70" r="2.6"/><circle cx="112" cy="52" r="2.6"/><circle cx="202" cy="54" r="2.6"/><circle cx="224" cy="72" r="2.6"/><circle cx="210" cy="92" r="2.6"/><circle cx="134" cy="112" r="2.6"/><circle cx="158" cy="124" r="2.6"/><circle cx="184" cy="110" r="2.6"/></g><g class="museum-kmeans-centroids"><path d="M91 62h14M98 55v14M210 72h14M217 65v14M154 114h14M161 107v14"/></g><g class="museum-figure-labels"><text x="80" y="42">C1</text><text x="231" y="66">C2</text><text x="168" y="137">C3</text><text x="226" y="112">iter 08</text></g></svg>';
      }
      if (key === 'bayes') {
        return '<svg viewBox="0 0 320 160" role="presentation"><g class="museum-figure-frame"><path d="M58 132H264M58 132V34"/><path d="M58 102H64M58 72H64M58 42H64"/></g><g class="museum-bayes-bars"><rect x="78" y="88" width="32" height="44"/><rect x="144" y="64" width="32" height="68"/><rect x="210" y="42" width="32" height="90"/></g><g class="museum-bayes-flow"><path d="M110 102H144M176 86H210"/></g><g class="museum-figure-labels"><text x="72" y="146">prior</text><text x="135" y="146">evidence</text><text x="204" y="146">posterior</text><text x="214" y="36">0.74</text></g></svg>';
      }
      if (key === 'pca') {
        return '<svg viewBox="0 0 320 160" role="presentation"><g class="museum-figure-frame"><path d="M54 126H266M54 126V34"/><path d="M107 126V121M160 126V121M213 126V121M54 94H60M54 62H60"/></g><g class="museum-pca-frame"><ellipse cx="160" cy="80" rx="88" ry="29" transform="rotate(-22 160 80)"/></g><g class="museum-pca-cloud"><circle cx="96" cy="67" r="2.4"/><circle cx="121" cy="84" r="2.4"/><circle cx="148" cy="69" r="2.4"/><circle cx="174" cy="91" r="2.4"/><circle cx="204" cy="82" r="2.4"/><circle cx="229" cy="97" r="2.4"/></g><g class="museum-pca-axes"><path d="M78 112L244 48"/><path d="M134 39L188 121"/></g><g class="museum-figure-labels"><text x="270" y="38">PC1 74%</text><text x="194" y="150">PC2 18%</text><text x="10" y="24">variance plane</text></g></svg>';
      }
      if (key === 'cosine') {
        return '<svg viewBox="0 0 320 160" role="presentation"><g class="museum-figure-frame"><path d="M88 136H236M160 136V36"/><path d="M112 84H208M160 36V42M160 126V132M106 84H112M208 84H214"/></g><g class="museum-cosine-ring"><circle cx="160" cy="84" r="44"/><path d="M160 84L216 62M160 84L190 126"/><path d="M183 75A26 26 0 0 1 180 108"/><path d="M129 53L135 59M191 53L185 59M129 115L135 109M191 115L185 109"/></g><g class="museum-figure-labels"><text x="219" y="58">v1</text><text x="193" y="138">v2</text><text x="224" y="104">cos .62</text></g></svg>';
      }
      if (key === 'linear') {
        return '<svg viewBox="0 0 320 160" role="presentation"><g class="museum-figure-frame"><path d="M54 126H268M54 126V34"/><path d="M97 126V121M140 126V121M183 126V121M226 126V121M54 94H60M54 62H60"/></g><g class="museum-linear-points"><circle cx="70" cy="110" r="2.6"/><circle cx="104" cy="96" r="2.6"/><circle cx="136" cy="84" r="2.6"/><circle cx="172" cy="70" r="2.6"/><circle cx="212" cy="58" r="2.6"/><circle cx="246" cy="44" r="2.6"/></g><g class="museum-linear-line"><path d="M58 118L262 38"/></g><g class="museum-figure-labels"><text x="230" y="30">y=wx+b</text><text x="68" y="30">R2 .91</text></g></svg>';
      }
      if (key === 'logistic') {
        return '<svg viewBox="0 0 320 160" role="presentation"><g class="museum-figure-frame"><path d="M54 126H268M54 126V34"/><path d="M54 80H268M106 126V121M160 126V121M214 126V121"/></g><g class="museum-logistic-curve"><path d="M54 118C102 118 112 42 160 42C208 42 218 118 266 118"/></g><g class="museum-logistic-points"><circle cx="90" cy="112" r="2.6"/><circle cx="126" cy="84" r="2.6"/><circle cx="162" cy="46" r="2.6"/><circle cx="198" cy="82" r="2.6"/><circle cx="234" cy="112" r="2.6"/></g><g class="museum-figure-labels"><text x="24" y="76">p .50</text><text x="202" y="34">decision band</text></g></svg>';
      }
      if (key === 'threshold') {
        return '<svg viewBox="0 0 320 160" role="presentation"><g class="museum-figure-frame"><path d="M54 126H268M54 126V34"/><path d="M54 82H268M107 126V121M160 126V121M213 126V121"/></g><g class="museum-threshold-curve"><path d="M58 114C96 58 136 46 166 68C198 92 220 104 262 58"/><path d="M186 34V128"/></g><circle class="museum-threshold-point" cx="186" cy="82" r="3.4"/><g class="museum-figure-labels"><text x="191" y="31">tau .64</text><text x="72" y="46">precision</text><text x="232" y="124">recall</text></g></svg>';
      }
      return '<svg viewBox="0 0 320 160" role="presentation"><g class="museum-figure-frame"><path d="M46 128H272M46 128V32"/><path d="M91 128V123M136 128V123M181 128V123M226 128V123M46 96H52M46 64H52"/></g><g class="museum-descent-contours"><ellipse cx="160" cy="78" rx="104" ry="44"/><ellipse cx="160" cy="78" rx="70" ry="28"/><ellipse cx="160" cy="78" rx="34" ry="14"/></g><g class="museum-descent-trail"><path d="M78 116L112 96L148 80L182 70L214 66"/><circle cx="78" cy="116" r="2.6"/><circle cx="112" cy="96" r="2.6"/><circle cx="148" cy="80" r="2.6"/><circle cx="182" cy="70" r="2.6"/><circle cx="214" cy="66" r="3.4"/></g><g class="museum-figure-labels"><text x="58" y="24">loss surface</text><text x="270" y="50">iter 024</text><text x="270" y="62">J .143</text><text x="78" y="140">eta .03</text></g></svg>';
    }

    // ══════════════════════════════════════════════════════════════
    //  LEGACY INDEX RENDERING (kept for reference)
    // ══════════════════════════════════════════════════════════════

    function renderLabIndex(container) {
      // NV-900-M3: Delegate to discovery index
      renderDiscoveryIndex(container);
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

    // ── Research Mode ──────────────────────────────────────

    function wireResearchMode() {
      var container = getContainer();
      if (!container) return;

      var toggles = container.querySelectorAll('[data-research-toggle], [data-research-activate]');
      toggles.forEach(function (toggle) {
        toggle.addEventListener('click', function () {
          toggleResearchMode();
        });
      });

      var hypothesis = container.querySelector('[data-research-hypothesis]');
      if (hypothesis) {
        hypothesis.addEventListener('input', function () {
          if (window.NeuralVerse.ResearchMode.isActive()) {
            updateResearchFields();
          }
        });
      }

       var saveBtn = container.querySelector('[data-research-save-session]');
      if (saveBtn) {
        saveBtn.addEventListener('click', function () {
          if (window.NeuralVerse.ResearchMode.isActive()) {
            window.NeuralVerse.ResearchMode.save();
            updateResearchSessionInfo();
          }
        });
      }
      var restoreBtn = container.querySelector('[data-research-restore]');
      if (restoreBtn) restoreBtn.addEventListener('click', restoreLatestResearchSession);
      updateResearchRestoreAvailability();

      container.querySelectorAll('[data-research-title], [data-research-question], [data-research-rationale], [data-research-hypothesis-status], [data-research-variable], [data-research-limitations], [data-research-conclusion]').forEach(function (field) {
        field.addEventListener('change', updateResearchFields);
      });
      ['[data-research-begin]', '[data-research-review]', '[data-research-complete]'].forEach(function (selector) {
        var button = container.querySelector(selector);
        if (button) button.addEventListener('click', function () { updateResearchFields(); var next = selector.indexOf('begin') >= 0 ? 'active' : selector.indexOf('review') >= 0 ? 'review' : 'completed'; window.NeuralVerse.ResearchMode.transition(next); renderResearchWorkspace(); });
      });
      var findingButton = container.querySelector('[data-research-capture-finding]');
      if (findingButton) findingButton.addEventListener('click', captureCurrentFinding);
      var stageButton = container.querySelector('[data-research-capture-stage]');
      if (stageButton) stageButton.addEventListener('click', captureStageEvidence);
      var compareButton = container.querySelector('[data-research-compare]');
      if (compareButton) compareButton.addEventListener('click', compareSelectedRuns);
      var reopenButton = container.querySelector('[data-research-reopen]');
      if (reopenButton) reopenButton.addEventListener('click', function () { window.NeuralVerse.ResearchMode.transition('active'); renderResearchWorkspace(); });
      container.querySelectorAll('[data-research-export]').forEach(function (button) { button.addEventListener('click', function () { exportResearchSession(button.getAttribute('data-research-export')); }); });

      var noteAdd = container.querySelector('[data-research-note-add]');
      if (noteAdd) {
        noteAdd.addEventListener('click', function () {
          addResearchNote();
        });
      }

      var noteText = container.querySelector('[data-research-note-text]');
      if (noteText) {
        noteText.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            addResearchNote();
          }
        });
      }

      var conclusionAdd = container.querySelector('[data-research-conclusion-add]');
      if (conclusionAdd) {
        conclusionAdd.addEventListener('click', function () {
          addResearchConclusion();
        });
      }

      var conclusionText = container.querySelector('[data-research-conclusion-text]');
      if (conclusionText) {
        conclusionText.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') addResearchConclusion();
        });
      }
    }

    function toggleResearchMode() {
      var container = getContainer();
      if (!container || !currentLab) return;

      var toggles = container.querySelectorAll('[data-research-toggle], [data-research-activate]');
      var notes = container.querySelector('[data-research-notes]');
      var bookmarks = container.querySelector('[data-research-bookmarks]');
      var evidence = container.querySelector('[data-research-evidence]');
      var conclusions = container.querySelector('[data-research-conclusions]');

      if (window.NeuralVerse.ResearchMode.isActive()) {
        window.NeuralVerse.ResearchMode.exit();
        toggles.forEach(function (toggle) { toggle.classList.remove('active'); });
        if (notes) notes.style.display = 'none';
        if (bookmarks) bookmarks.style.display = 'none';
        if (evidence) evidence.style.display = 'none';
        if (conclusions) conclusions.style.display = 'none';
        applyWorkspaceResearchState('inactive');
      } else {
        var session = window.NeuralVerse.ResearchMode.activate(currentLab);
        if (session) {
          toggles.forEach(function (toggle) { toggle.classList.add('active'); });
          if (notes) notes.style.display = 'none';
          if (bookmarks) bookmarks.style.display = 'none';
          if (evidence) evidence.style.display = '';
          if (conclusions) conclusions.style.display = '';
          applyWorkspaceResearchState('active');
          updateResearchSessionInfo();
          renderResearchWorkspace();
        }
      }
    }

    function updateResearchRestoreAvailability() {
      var container = getContainer();
      if (!container || !currentLab) return;
      var restore = container.querySelector('[data-research-restore]');
      if (restore) restore.hidden = window.NeuralVerse.ResearchMode.isActive() || !window.NeuralVerse.ResearchStorage.getSessionsForLab(currentLab.id).length;
    }

    function restoreLatestResearchSession() {
      if (!currentLab || window.NeuralVerse.ResearchMode.isActive()) return;
      var sessions = window.NeuralVerse.ResearchStorage.getSessionsForLab(currentLab.id);
      var restored = sessions.length && window.NeuralVerse.ResearchMode.restore(sessions[0]);
      if (!restored) return;
      applyWorkspaceResearchState('active');
      renderResearchWorkspace();
      updateResearchRestoreAvailability();
    }

    function updateResearchSessionInfo() {
      var container = getContainer();
      if (!container) return;

      var session = window.NeuralVerse.ResearchMode.getSession();
      var nameEl = container.querySelector('[data-research-session-name]');
      var countEl = container.querySelector('[data-research-run-count]');
      var statusEl = container.querySelector('[data-research-status]');
      var hypothesisEl = container.querySelector('[data-research-hypothesis]');

       if (session) {
        if (nameEl) nameEl.textContent = session.title;
        if (countEl) countEl.textContent = session.runs.length + ' run(s)';
        if (statusEl) statusEl.textContent = session.state === 'draft' ? 'Draft - Research active' : session.state.charAt(0).toUpperCase() + session.state.slice(1);
        if (hypothesisEl) hypothesisEl.value = session.hypothesis.statement || '';
       } else {
         if (statusEl) statusEl.textContent = 'Inactive';
       }
       updateResearchRestoreAvailability();
    }

    function addResearchNote() {
      var container = getContainer();
      if (!container || !window.NeuralVerse.ResearchMode.isActive()) return;

      var typeEl = container.querySelector('[data-research-note-type]');
      var textEl = container.querySelector('[data-research-note-text]');
      if (!textEl || !textEl.value.trim()) return;

      var type = typeEl ? typeEl.value : 'observation';
      var text = textEl.value.trim();

      if (type === 'interpretation') window.NeuralVerse.ResearchMode.addInterpretation(text, [], stepSession ? stepSession.currentStep : 0);
      else window.NeuralVerse.ResearchMode.addObservation(text, [], stepSession ? stepSession.currentStep : 0);
      textEl.value = '';

      updateResearchNotes();
      updateResearchEvidenceTimeline();
    }

    function updateResearchNotes() {
      var container = getContainer();
      if (!container) return;

      var list = container.querySelector('[data-research-notes-list]');
      if (!list) return;

      var session = window.NeuralVerse.ResearchMode.getSession();
      if (!session) return;

      var html = '';
      var records = session.observations.concat(session.interpretations).sort(function (a, b) { return b.timestamp.localeCompare(a.timestamp); });
      for (var i = 0; i < records.length && i < 10; i++) {
        var note = records[i];
        html += '<div class="nv-lab-research-note">';
        html += '<span class="nv-lab-research-note-type">' + escapeHtml(note.type) + '</span>';
        html += '<div class="nv-lab-research-note-text">' + escapeHtml(note.text) + '</div>';
        html += '</div>';
      }
      list.innerHTML = html;
      var notesPanel = container.querySelector('[data-research-notes]');
      if (notesPanel) notesPanel.setAttribute('data-availability', records.length ? 'populated' : 'available');
    }

    function addBookmark() {
      if (!window.NeuralVerse.ResearchMode.isActive()) return;
      if (!stepSession) return;

      window.NeuralVerse.ResearchMode.addBookmark(
        stepSession.currentStep,
        'Step ' + (stepSession.currentStep + 1),
        null
      );
      updateResearchBookmarks();
    }

    function updateResearchBookmarks() {
      var container = getContainer();
      if (!container) return;

      var list = container.querySelector('[data-research-bookmarks-list]');
      if (!list) return;

      var session = window.NeuralVerse.ResearchMode.getSession();
      if (!session) return;

      var html = '';
      for (var i = 0; i < session.bookmarks.length; i++) {
        var bm = session.bookmarks[i];
        html += '<div class="nv-lab-research-bookmark" data-bookmark-step="' + bm.stepIndex + '">';
        html += '<span class="nv-lab-research-bookmark-step">Step ' + (bm.stepIndex + 1) + '</span>';
        html += '<span class="nv-lab-research-bookmark-label">' + escapeHtml(bm.label) + '</span>';
        html += '</div>';
      }
      list.innerHTML = html;
      var bookmarksPanel = container.querySelector('[data-research-bookmarks]');
      if (bookmarksPanel) {
        bookmarksPanel.style.display = session.bookmarks.length ? '' : 'none';
        bookmarksPanel.setAttribute('data-availability', session.bookmarks.length ? 'populated' : 'unavailable');
      }

      // Wire bookmark clicks
      list.querySelectorAll('.nv-lab-research-bookmark').forEach(function (el) {
        el.addEventListener('click', function () {
          var step = parseInt(this.getAttribute('data-bookmark-step'));
          if (!isNaN(step)) jumpToStep(step);
        });
      });
      updateResearchEvidenceTimeline();
    }

    function addResearchConclusion() {
      var container = getContainer();
      if (!container || !window.NeuralVerse.ResearchMode.isActive()) return;
      var textEl = container.querySelector('[data-research-conclusion-text]');
      if (!textEl || !textEl.value.trim()) return;

      window.NeuralVerse.ResearchMode.update({ conclusion: textEl.value.trim() });
      textEl.value = '';
      updateResearchConclusions();
      updateResearchEvidenceTimeline();
    }

    function updateResearchConclusions() {
      var container = getContainer();
      if (!container) return;
      var list = container.querySelector('[data-research-conclusions-list]');
      if (!list) return;
      var session = window.NeuralVerse.ResearchMode.getSession();
      if (!session) return;

      var html = '';
      if (session.conclusion) html += '<div class="nv-lab-research-conclusion"><span>Learner-authored conclusion</span><p>' + escapeHtml(session.conclusion) + '</p></div>';
      list.innerHTML = html;
      var conclusionsPanel = container.querySelector('[data-research-conclusions]');
      if (conclusionsPanel) {
        conclusionsPanel.style.display = session.conclusion ? '' : 'none';
        conclusionsPanel.setAttribute('data-availability', session.conclusion ? 'populated' : 'unavailable');
      }
    }

    function updateResearchEvidenceTimeline() {
      var container = getContainer();
      if (!container || !window.NeuralVerse.ResearchMode.isActive()) return;
      var list = container.querySelector('[data-research-evidence-list]');
      if (!list) return;

      var researchSession = window.NeuralVerse.ResearchMode.getSession();
      var timeline = researchSession ? researchSession.capturedEvidence : [];
      var html = '';
      for (var i = timeline.length - 1; i >= 0 && i >= timeline.length - 8; i--) {
        var item = timeline[i];
        html += '<div class="nv-lab-research-evidence-item">';
        html += '<span>' + escapeHtml(item.category || 'Evidence') + '</span>';
        html += '<p>' + escapeHtml(item.scientificSummary || '') + '</p>';
        html += '</div>';
      }
      list.innerHTML = html;
      var evidencePanel = container.querySelector('[data-research-evidence]');
      if (evidencePanel) {
        // Capture actions remain available before the first learner-selected item.
        evidencePanel.style.display = '';
        evidencePanel.setAttribute('data-availability', timeline.length ? 'populated' : 'unavailable');
      }
    }

    function updateResearchFields() {
      var container = getContainer();
      var session = window.NeuralVerse.ResearchMode.getSession();
      if (!container || !session) return;
      function value(selector) { var field = container.querySelector(selector); return field ? field.value : ''; }
      var variables = {};
      container.querySelectorAll('[data-research-variable]').forEach(function (field) {
        variables[field.getAttribute('data-research-variable')] = field.value.split(',').map(function (item) { return item.trim(); }).filter(Boolean);
      });
      window.NeuralVerse.ResearchMode.update({
        title: value('[data-research-title]') || 'Untitled investigation',
        researchQuestion: value('[data-research-question]'),
        hypothesis: { statement: value('[data-research-hypothesis]'), rationale: value('[data-research-rationale]'), status: value('[data-research-hypothesis-status]') || 'untested' },
        variables: variables,
        limitations: value('[data-research-limitations]').split('\n').map(function (item) { return item.trim(); }).filter(Boolean),
        conclusion: value('[data-research-conclusion]')
      });
    }

    function renderResearchWorkspace() {
      var container = getContainer(); var session = window.NeuralVerse.ResearchMode.getSession();
      if (!container || !session) return;
      function set(selector, value) { var field = container.querySelector(selector); if (field) field.value = value || ''; }
      set('[data-research-title]', session.title); set('[data-research-question]', session.researchQuestion); set('[data-research-hypothesis]', session.hypothesis.statement); set('[data-research-rationale]', session.hypothesis.rationale); set('[data-research-hypothesis-status]', session.hypothesis.status); set('[data-research-limitations]', session.limitations.join('\n')); set('[data-research-conclusion]', session.conclusion);
      container.querySelectorAll('[data-research-variable]').forEach(function (field) { field.value = (session.variables[field.getAttribute('data-research-variable')] || []).join(', '); });
      updateResearchSessionInfo(); updateResearchNotes(); updateResearchEvidenceTimeline(); updateResearchConclusions();
      var notesPanel = container.querySelector('[data-research-notes]');
      if (notesPanel) notesPanel.style.display = session.runs.length ? '' : 'none';
      var evidenceCount = container.querySelector('[data-research-evidence-count]'); if (evidenceCount) evidenceCount.textContent = session.capturedEvidence.length + ' evidence';
      var runs = container.querySelector('[data-research-runs]');
      if (runs) runs.innerHTML = session.runs.map(function (run, index) { return '<label class="nv-lab-research-run"><input type="checkbox" data-research-run-id="' + escapeHtml(run.runId) + '"' + (run.status === 'completed' ? '' : ' disabled') + '> Run ' + (index + 1) + ': ' + escapeHtml(run.status) + ' | ' + escapeHtml(Object.keys(run.configurationSnapshot).map(function (key) { return key + '=' + formatDisplayValue(run.configurationSnapshot[key]); }).join(', ')) + '</label>'; }).join('') || '<p>No runs captured yet.</p>';
      var comparisons = container.querySelector('[data-research-comparisons]');
      if (comparisons) comparisons.innerHTML = session.comparisons.map(function (item) { return '<p>' + escapeHtml(item.classification.replace('-', ' ')) + ': changed ' + escapeHtml(item.changedParameters.join(', ') || 'none') + '; controlled ' + escapeHtml(item.controlledParameters.join(', ') || 'none') + '.</p>'; }).join('');
      var reproducibility = container.querySelector('[data-research-reproducibility]');
      if (reproducibility) reproducibility.textContent = 'Schema v' + session.version + ' | ' + session.runs.length + ' run(s) | ' + session.capturedEvidence.length + ' captured evidence item(s) | browser-local persistence.';
      var completed = session.state === 'completed';
      container.querySelectorAll('[data-research-title], [data-research-question], [data-research-hypothesis], [data-research-rationale], [data-research-hypothesis-status], [data-research-variable], [data-research-limitations], [data-research-conclusion], [data-research-begin], [data-research-review], [data-research-complete], [data-research-compare], [data-research-capture-finding], [data-research-capture-stage]').forEach(function (element) { element.disabled = completed; });
       var reopen = container.querySelector('[data-research-reopen]'); if (reopen) reopen.hidden = !completed;
       updateResearchRestoreAvailability();
    }

    function captureCurrentFinding() {
      var finding = xaiFindingsBuffer.length ? xaiFindingsBuffer[xaiFindingsBuffer.length - 1] : null;
      if (!finding) return;
      window.NeuralVerse.ResearchMode.captureEvidence({ sourceId: 'finding:' + finding.id, category: finding.category || 'Finding', severity: finding.severity || 'Informational', scientificSummary: finding.observation || finding.title, measurements: [], provenance: { source: 'Scientific Inspector', sourceSteps: [finding.stepIndex] } });
      renderResearchWorkspace();
    }

    function captureStageEvidence() {
      if (!stepSession || stepSession.currentStep < 0) return;
      var snapshot = window.NeuralVerse.ExecutionEngine.getStepSnapshot(stepSession, stepSession.currentStep);
      var session = window.NeuralVerse.ResearchMode.getSession();
      var run = window.NeuralVerse.ResearchMode.getCurrentRun() || (session && session.runs[session.runs.length - 1]);
      if (!run) return;
      window.NeuralVerse.ResearchMode.captureEvidence({ sourceId: 'stage:' + run.runId + ':' + stepSession.currentStep, category: 'Stage evidence', severity: 'Informational', scientificSummary: snapshot ? snapshot.label : 'Scientific Stage state', measurements: snapshot ? snapshot.metrics : {}, provenance: { source: 'Scientific Stage', sourceSteps: [stepSession.currentStep] } });
      renderResearchWorkspace();
    }

    function compareSelectedRuns() {
      var container = getContainer(); if (!container) return;
      var ids = Array.prototype.slice.call(container.querySelectorAll('[data-research-run-id]:checked')).map(function (input) { return input.getAttribute('data-research-run-id'); });
      window.NeuralVerse.ResearchMode.compare(ids); renderResearchWorkspace();
    }

    function exportResearchSession(format) {
      var content = window.NeuralVerse.ResearchMode.export(format); if (!content) return;
      var blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' }); var url = URL.createObjectURL(blob); var link = document.createElement('a'); link.href = url; link.download = 'research-session.' + (format === 'json' ? 'json' : 'md'); link.click(); URL.revokeObjectURL(url);
    }

    // ── XAI Integration ──────────────────────────────────

    var xaiFindingsBuffer = [];
    var xaiTotalFindings = 0;
    var xaiCriticalFindings = 0;
    var xaiStepsWithFindings = 0;

    function wireXAIPanel() {
      // Phase 12.4: XAI history toggle is now handled by v4 disclosure toggles.
      // The findings history panel is toggled via [data-disclosure-toggle="findings"].
    }

    function generateAndRenderFindings() {
      if (!currentLab || !window.NeuralVerse.XAIEngine) return;
      try {
      if (!xaiEvidenceStore) xaiEvidenceStore = window.NeuralVerse.XAIEngine.createEvidenceStore(currentLab.id, 'run-' + Date.now());

      var findings = window.NeuralVerse.XAIEngine.analyze(
        currentLab,
        currentParams,
        stepSession ? stepSession.currentStep : 0,
        stepSession ? stepSession.history : [],
        prevInspectorState
      );

      if (findings.length === 0) return;

      xaiStepsWithFindings++;

      for (var i = 0; i < findings.length; i++) {
        var finding = findings[i];
        xaiEvidenceStore.add(finding);
        xaiFindingsBuffer = xaiEvidenceStore.records;
        xaiTotalFindings++;
        if (finding.severity === 'Critical') xaiCriticalFindings++;

        window.NeuralVerse.XAIHistory.addFinding(finding);

      }

      var topFinding = findings[0];
      revealPanel('[data-xai-panel]');
      renderLiveFinding(topFinding);
      renderXAIMetrics();
      renderFindingHistory();
      highlightVisualEvidence(topFinding);

      if (topFinding.severity === 'Critical' || topFinding.severity === 'Significant') {
        addXAIEventToLog(topFinding);
      }

      } catch (e) {
        // Evidence presentation must never interrupt the experiment lifecycle.
        if (window.NV_DEBUG) console.warn('Evidence rendering error:', e);
      }
    }

    function renderLiveFinding(finding) {
      var container = getContainer();
      if (!container) return;
      var livePanel = container.querySelector('[data-xai-live-finding]');
      if (!livePanel) return;

      livePanel.innerHTML = window.NeuralVerse.XAIEngine.renderFinding(finding);

      // Progressive disclosure: click to expand/collapse layers
      var findingEl = livePanel.querySelector('.nv-xai-finding');
      if (findingEl) {
        function toggleFinding(el) {
          var expanded = el.classList.toggle('is-expanded');
          el.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        }
        findingEl.addEventListener('click', function () {
          toggleFinding(this);
        });
        findingEl.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFinding(this);
          }
        });
      }
    }

    function renderFindingHistory() {
      var container = getContainer();
      if (!container) return;
      var timeline = container.querySelector('[data-lab-v4-findings-history] [data-xai-timeline]');
      if (!timeline) return;

      var findingCountEl = container.querySelector('[data-xai-finding-count]');
      if (findingCountEl) findingCountEl.textContent = xaiFindingsBuffer.length;

      var findings = xaiEvidenceStore ? xaiEvidenceStore.getGroups().slice(0, 20) : [];
      if (!findings.length) {
        timeline.innerHTML = '<div class="nv-xai-empty-state"><span class="nv-xai-empty-label">No scientific findings have been generated for this run.</span></div>';
        return;
      }

      var html = '';
      for (var i = findings.length - 1; i >= 0; i--) {
        html += window.NeuralVerse.XAIEngine.renderTimelineEntry(findings[i], i);
      }
      timeline.innerHTML = html;

      timeline.querySelectorAll('.nv-xai-timeline-entry').forEach(function (entry) {
        entry.addEventListener('click', function () {
          var findingId = this.getAttribute('data-xai-finding-id');
          var finding = findFindingById(findingId);
          if (finding) renderLiveFinding(finding);
        });
        entry.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
          }
        });
      });
    }

    function findFindingById(id) {
      return xaiEvidenceStore ? xaiEvidenceStore.getById(id) : null;
    }

    function renderXAIMetrics() {
      var container = getContainer();
      if (!container) return;

      var countEl = container.querySelector('[data-xai-metric-count]');
      var criticalEl = container.querySelector('[data-xai-metric-critical]');
      var coverageEl = container.querySelector('[data-xai-metric-coverage]');

      if (countEl) countEl.textContent = xaiTotalFindings;
      if (criticalEl) criticalEl.textContent = xaiCriticalFindings;
      if (coverageEl) {
        var totalSteps = stepSession ? stepSession.totalSteps : 1;
        var coverage = totalSteps > 0 ? Math.round((xaiStepsWithFindings / totalSteps) * 100) : 0;
        coverageEl.textContent = coverage + '%';
      }
    }

    function highlightVisualEvidence(finding) {
      if (!finding || !finding.visualEvidence) return;
      var container = getContainer();
      if (!container) return;

      var ve = finding.visualEvidence;
      var target = null;

      if (ve.type === 'inspector-card') {
        target = container.querySelector('[data-inspector-key="' + ve.target + '"]');
      } else if (ve.type === 'observation') {
        target = container.querySelector('[data-obs-id="' + ve.target + '"]');
      } else if (ve.type === 'metric') {
        target = container.querySelector('[data-lab-inspector-metrics]');
      }

      if (target) {
        target.classList.add('nv-xai-evidence-pulse');
          scheduleFeedback(function () {
            target.classList.remove('nv-xai-evidence-pulse');
          }, 1500);
      }
    }

    function addXAIEventToLog(finding) {
      var container = getContainer();
      if (!container) return;
      var entries = container.querySelector('[data-lab-log-entries]');
      if (!entries) return;

      revealLog();

      var entry = document.createElement('div');
      entry.className = 'nv-lab-ws-log-entry';

      var now = new Date();
      var timestamp = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      var severityIcon = finding.severity === 'Critical' ? '\u26A0' : '\u2139';
      entry.innerHTML = '<span class="log-time">[' + timestamp + ']</span> ' +
        '<span class="log-step" style="color:var(--nv-xai-accent)">[' + severityIcon + ' XAI]</span> ' +
        '<span class="log-msg">' + escapeHtml(finding.title) + '</span>';

      entries.appendChild(entry);
      entries.scrollTop = entries.scrollHeight;

      // Update log count
      logEntryCount++;
      var countEl = container.querySelector('[data-lab-log-count]');
      if (countEl) countEl.textContent = logEntryCount;
    }

    function resetXAIState() {
      xaiFindingsBuffer = [];
      if (xaiEvidenceStore) xaiEvidenceStore.reset();
      xaiEvidenceStore = null;
      xaiTotalFindings = 0;
      xaiCriticalFindings = 0;
      xaiStepsWithFindings = 0;

      var container = getContainer();
      if (!container) return;

      var livePanel = container.querySelector('[data-xai-live-finding]');
      if (livePanel) {
        livePanel.innerHTML = '<div class="nv-xai-empty-state"><span class="nv-xai-empty-label">Observations will appear during execution</span></div>';
      }

      var timeline = container.querySelector('[data-lab-v4-findings-history] [data-xai-timeline]');
      if (timeline) timeline.innerHTML = '';

      var xaiPanel = container.querySelector('[data-xai-panel]');
      if (xaiPanel) {
        xaiPanel.hidden = true;
        xaiPanel.style.display = 'none';
        xaiPanel.classList.remove('is-visible');
      }

      renderXAIMetrics();
    }

    function destroy() {
      if (executeDebounce) clearTimeout(executeDebounce);
      stopAutoRun();
      cancelFeedback();
      stepSession = null;
      currentLab = null;
      currentParams = {};
      currentResult = null;
      executionSnapshot = null;
      xaiFindingsBuffer = [];
      xaiTotalFindings = 0;
      xaiCriticalFindings = 0;
      xaiStepsWithFindings = 0;
      logEntryCount = 0;
    }

    return {
      loadLab: loadLab,
      resetParameters: resetParameters,
      executeCurrentLab: executeCurrentLab,
      renderLabIndex: renderLabIndex,
      renderDiscoveryIndex: renderDiscoveryIndex,
      destroy: destroy,
      getCurrentLab: function () { return currentLab; },
      getCurrentParams: function () { return Object.assign({}, currentParams); },
      getCurrentResult: function () { return currentResult; },
      addBookmark: addBookmark,
      updateResearchNotes: updateResearchNotes,
      updateResearchBookmarks: updateResearchBookmarks,
      generateAndRenderFindings: generateAndRenderFindings
    };
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createLabUIController = createUIController;

})();
