/**
 * NV-1100-P9B — Visualization Controller
 * Page-level controller managing routing, parameter changes, and rendering.
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

  // Safe math utilities — canonical location for controller
  function safe(v) {
    if (typeof v !== 'number' || !isFinite(v)) return 0;
    return v;
  }

  function safeDiv(a, b) {
    if (!b || !isFinite(b)) return 0;
    var r = a / b;
    return isFinite(r) ? r : 0;
  }

  function createVisualizationController(options) {
    var root = options && options.root ? options.root : document;
    var currentDefinition = null;
    var currentParams = {};
    var previousParams = null;
    var currentModel = null;

    function getRegistry() {
      return window.NeuralVerse && window.NeuralVerse.ParametricRegistry
        ? window.NeuralVerse.ParametricRegistry
        : null;
    }

    function getEngine() {
      return window.NeuralVerse && window.NeuralVerse.VizEngine
        ? window.NeuralVerse.VizEngine
        : null;
    }

    function getRenderer() {
      return window.NeuralVerse && window.NeuralVerse.VizRenderer
        ? window.NeuralVerse.VizRenderer
        : null;
    }

    function getStorage() {
      return window.NeuralVerse && window.NeuralVerse.VizStateStorage
        ? window.NeuralVerse.VizStateStorage
        : null;
    }

    function getParameterEngine() {
      return window.NeuralVerse && window.NeuralVerse.VizParameterEngine
        ? window.NeuralVerse.VizParameterEngine
        : null;
    }

    function getUI() {
      return window.NeuralVerse && window.NeuralVerse.VizUI
        ? window.NeuralVerse.VizUI
        : null;
    }

    function loadVisualization(slug) {
      var registry = getRegistry();
      if (!registry) return;

      var definition = registry.getBySlug(slug);
      if (!definition) {
        renderNotFound();
        return;
      }

      currentDefinition = definition;

      var storage = getStorage();
      var pe = getParameterEngine();

      // Load saved params or defaults
      var savedPresets = storage ? storage.getPresets(definition.id) : [];
      var defaults = pe ? pe.buildDefaults(definition) : {};
      currentParams = Object.assign({}, defaults);

      // Render the visualization detail view
      renderDetail();

      // Track recent
      if (storage) {
        storage.addRecent(definition.id, definition.title, currentParams);
      }

      window.dispatchEvent(new CustomEvent('nv:viz_loaded', { detail: { vizId: definition.id } }));
    }

    function renderList() {
      var registry = getRegistry();
      var ui = getUI();
      var workspace = root.querySelector('#nv-workspace-content-body') || root.querySelector('.nv-workspace__surface');
      if (!workspace || !registry || !ui) return;

      var definitions = registry.getAll();
      var categories = registry.getCategories();

      var html = '<div class="nv-pviz-page">';
      html += '<header class="nv-pviz-page-header">';
      html += '<h1 class="nv-pviz-page-title">Parametric Visualizations</h1>';
      html += '<p class="nv-pviz-page-subtitle">Deterministic, interactive mathematical and scientific visualizations — manipulate parameters and observe changes immediately.</p>';
      html += '</header>';

      html += ui.renderCategoryFilter(categories);
      html += ui.renderVisualizationList(definitions);

      html += '</div>';
      workspace.innerHTML = html;

      bindCategoryFilter();
    }

    function renderDetail() {
      var registry = getRegistry();
      var engine = getEngine();
      var renderer = getRenderer();
      var storage = getStorage();
      var ui = getUI();
      var pe = getParameterEngine();

      var workspace = root.querySelector('#nv-workspace-content-body') || root.querySelector('.nv-workspace__surface');
      if (!workspace || !currentDefinition || !ui) return;

      // Compute render model
      if (engine) {
        currentModel = engine.computeRenderModel(currentDefinition, currentParams);
      }

      var isFavorite = storage ? storage.isFavorite(currentDefinition.id) : false;

      var html = '<div class="nv-pviz-page nv-pviz-detail-page">';
      html += ui.renderBreadcrumb(currentDefinition.id, currentDefinition.title);
      html += ui.renderVisualizationHeader(currentDefinition, isFavorite);

      html += '<div class="nv-pviz-layout">';
      html += '<div class="nv-pviz-canvas-area">';
      html += '<div class="nv-pviz-canvas" data-viz-canvas></div>';
      html += '</div>';

      html += '<div class="nv-pviz-sidebar">';
      html += '<div class="nv-pviz-controls">';
      html += ui.renderParameterControls(currentDefinition.parameterSchema, currentParams, currentDefinition.id);
      html += '</div>';

      // Current State interpretation panel
      html += '<div class="nv-pviz-interpretation" data-interpretation>';
      html += '<h4 class="nv-pviz-interpretation-title">Current State</h4>';
      html += '<div class="nv-pviz-interpretation-content"></div>';
      html += '</div>';

      // Guided experiment
      html += ui.renderExperiments(currentDefinition.id);

      // Comparison presets
      html += ui.renderComparisonPresets(currentDefinition.id);

      // Presets section
      html += '<div class="nv-pviz-presets" data-presets-section>';
      html += '<h4 class="nv-pviz-presets-title">Presets</h4>';
      html += '<div class="nv-pviz-presets-list" data-presets-list></div>';
      html += '<div class="nv-pviz-preset-save">';
      html += '<input type="text" class="nv-pviz-input" id="nv-pviz-preset-name" placeholder="Preset name..." aria-label="Preset name">';
      html += '<button class="nv-pviz-btn nv-pviz-btn-sm" data-action="save-preset">Save</button>';
      html += '</div>';
      html += '</div>';

      // Concept links
      if (currentDefinition.concepts && currentDefinition.concepts.length > 0) {
        html += '<div class="nv-pviz-concepts">';
        html += '<h4 class="nv-pviz-concepts-title">Related Concepts</h4>';
        html += '<div class="nv-pviz-concept-tags">';
        for (var ci = 0; ci < currentDefinition.concepts.length; ci++) {
          html += '<span class="nv-pviz-tag">' + escapeHtml(currentDefinition.concepts[ci]) + '</span>';
        }
        html += '</div></div>';
      }

      html += '</div>'; // sidebar
      html += '</div>'; // layout
      html += '</div>'; // page

      workspace.innerHTML = html;

      // Render the visualization
      var canvas = workspace.querySelector('[data-viz-canvas]');
      if (canvas && renderer && currentModel) {
        renderer.render(canvas, currentModel);
      }

      // Render presets list
      renderPresetsList();

      // Bind controls
      bindControls();

      // Bind crosshair interaction
      bindCrosshair();

      // Bind experiment handlers
      bindExperiments();

      // Initialize interpretation panel
      updateInterpretation();
    }

    function renderNotFound() {
      var workspace = root.querySelector('#nv-workspace-content-body') || root.querySelector('.nv-workspace__surface');
      if (!workspace) return;

      var html = '<div class="nv-pviz-page"><div class="nv-pviz-empty-state">';
      html += '<h2>Visualization Not Found</h2>';
      html += '<p>The requested visualization does not exist or may have been removed.</p>';
      html += '<a href="#/visualizations" class="nv-pviz-btn nv-pviz-btn--primary">Browse All Visualizations</a>';
      html += '</div></div>';
      workspace.innerHTML = html;
    }

    function updateVisualization() {
      var engine = getEngine();
      var renderer = getRenderer();

      if (!engine || !renderer || !currentDefinition) return;

      // Store previous state for ghost curve
      if (currentModel && currentModel.points) {
        previousParams = Object.assign({}, currentParams);
      }

      currentModel = engine.computeRenderModel(currentDefinition, currentParams);

      // Add ghost points for comparative feedback
      if (currentModel && previousParams && currentModel.points) {
        var prevModel = engine.computeRenderModel(currentDefinition, previousParams);
        if (prevModel && prevModel.points) {
          currentModel.ghostPoints = prevModel.points;
        }
      }

      var canvas = root.querySelector('[data-viz-canvas]');
      if (canvas && currentModel) {
        // Smooth scientific morphing transition
        canvas.style.transition = 'opacity 0.12s ease-out';
        canvas.style.opacity = '0.5';
        renderer.render(canvas, currentModel);
        // Rebind crosshair after re-render
        bindCrosshair();
        // Update interpretation panel
        updateInterpretation();
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            canvas.style.opacity = '1';
          });
        });
      }
    }

    function bindControls() {
      var controls = root.querySelector('.nv-pviz-controls');
      if (!controls) return;

      // Section toggle (progressive disclosure)
      controls.querySelectorAll('[data-toggle-section]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var sectionId = this.getAttribute('data-toggle-section');
          var section = controls.querySelector('[data-section="' + sectionId + '"]');
          var body = section ? section.querySelector('.nv-pviz-param-section-body') : null;
          if (!body) return;

          var isCollapsed = section.classList.contains('nv-pviz-param-section--collapsed');
          if (isCollapsed) {
            section.classList.remove('nv-pviz-param-section--collapsed');
            body.style.display = '';
            this.setAttribute('aria-expanded', 'true');
            this.querySelector('.nv-pviz-param-section-icon').textContent = '−';
          } else {
            section.classList.add('nv-pviz-param-section--collapsed');
            body.style.display = 'none';
            this.setAttribute('aria-expanded', 'false');
            this.querySelector('.nv-pviz-param-section-icon').textContent = '+';
          }
        });
      });

      // Slider inputs — with parameter highlighting
      controls.querySelectorAll('.nv-pviz-slider').forEach(function (slider) {
        slider.addEventListener('input', function () {
          var key = this.getAttribute('data-param-key');
          var type = this.getAttribute('data-param-type');
          var valueEl = root.querySelector('#pviz-val-' + key);
          var paramGroup = this.closest('.nv-pviz-param-group');

          // Highlight active parameter
          controls.querySelectorAll('.nv-pviz-param-group').forEach(function (g) {
            g.classList.remove('nv-pviz-param-group--active');
          });
          if (paramGroup) paramGroup.classList.add('nv-pviz-param-group--active');

          if (type === 'integer') {
            currentParams[key] = parseInt(this.value, 10);
          } else {
            currentParams[key] = parseFloat(this.value);
          }

          if (valueEl) valueEl.textContent = currentParams[key];
          updateVisualization();
        });

        // Remove highlight on blur
        slider.addEventListener('blur', function () {
          var paramGroup = this.closest('.nv-pviz-param-group');
          if (paramGroup) paramGroup.classList.remove('nv-pviz-param-group--active');
        });
      });

      // Select inputs
      controls.querySelectorAll('.nv-pviz-select').forEach(function (select) {
        select.addEventListener('change', function () {
          var key = this.getAttribute('data-param-key');
          currentParams[key] = this.value;
          updateVisualization();
        });
      });

      // Checkbox inputs
      controls.querySelectorAll('.nv-pviz-checkbox').forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
          var key = this.getAttribute('data-param-key');
          currentParams[key] = this.checked;
          updateVisualization();
        });
      });

      // Action buttons
      root.querySelectorAll('[data-action]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          var action = this.getAttribute('data-action');
          handleAction(action, e);
        });
      });

      // Comparison preset buttons
      root.querySelectorAll('[data-comparison-preset]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var presetIdx = parseInt(this.getAttribute('data-comparison-preset'), 10);
          var vizId = this.getAttribute('data-viz-id');
          var ui = getUI();
          var presets = ui && ui.COMPARISON_PRESETS ? ui.COMPARISON_PRESETS[vizId] : null;
          if (!presets || !presets[presetIdx]) return;

          var preset = presets[presetIdx];
          var engine = getEngine();
          var renderer = getRenderer();
          if (!engine || !renderer || !currentDefinition) return;

          // Generate overlay model
          var currentModel = engine.computeRenderModel(currentDefinition, currentParams);
          var presetModel = engine.computeRenderModel(currentDefinition, preset.params);

          if (currentModel && presetModel && currentModel.points) {
            var overlayModel = {
              type: 'overlay',
              title: currentDefinition.title + ' — Comparison',
              overlays: [
                { points: currentModel.points, label: 'Current', color: '#06b6d4' },
                { points: presetModel.points, label: preset.label, color: '#f59e0b' }
              ]
            };

            var canvas = root.querySelector('[data-viz-canvas]');
            if (canvas) {
              canvas.style.transition = 'opacity 0.12s ease-out';
              canvas.style.opacity = '0.5';
              renderer.render(canvas, overlayModel);
              bindCrosshair();
              requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                  canvas.style.opacity = '1';
                });
              });
            }

            // Update interpretation with comparative narration
            updateComparisonInterpretation(currentParams, preset.params, preset.label, vizId);
          }
        });
      });
    }

    function updateComparisonInterpretation(currentParams, presetParams, presetName, vizId) {
      var panel = root.querySelector('[data-interpretation]');
      if (!panel) return;

      var content = panel.querySelector('.nv-pviz-interpretation-content');
      if (!content) return;

      var html = '';

      // Parameter attribution
      html += '<div class="nv-pviz-comparison-attribution">';
      html += '<div class="nv-pviz-comparison-label">Comparison: ' + escapeHtml(presetName) + '</div>';
      var changedParams = [];
      Object.keys(presetParams).forEach(function (key) {
        if (currentParams[key] !== presetParams[key]) {
          changedParams.push(key);
        }
      });
      if (changedParams.length > 0) {
        html += '<div class="nv-pviz-comparison-params">';
        changedParams.forEach(function (key) {
          html += '<span class="nv-pviz-comparison-param">' + escapeHtml(key) + ': ' + currentParams[key] + ' → ' + presetParams[key] + '</span>';
        });
        html += '</div>';
      }
      html += '</div>';

      // Comparative narration
      html += '<div class="nv-pviz-comparison-narration">';
      switch (vizId) {
        case 'sigmoid-function':
          var kDiff = (presetParams.k || 1) - (currentParams.k || 1);
          if (kDiff > 0) {
            html += 'Higher k compresses the transition. Gradient becomes sharper.';
          } else if (kDiff < 0) {
            html += 'Lower k widens the transition. Gradient becomes smoother.';
          }
          break;
        case 'gradient-descent-loss':
          var lrDiff = (presetParams.learningRate || 0.01) - (currentParams.learningRate || 0.01);
          if (lrDiff > 0) {
            html += 'Higher learning rate reduces convergence time but increases oscillation near the minimum.';
          } else if (lrDiff < 0) {
            html += 'Lower learning rate converges more slowly but with greater stability.';
          }
          break;
        case 'normal-distribution':
          var stdDiff = (presetParams.stdDev || 1) - (currentParams.stdDev || 1);
          if (stdDiff > 0) {
            html += 'Wider distribution preserves the mean while increasing uncertainty. 95% coverage expands.';
          } else if (stdDiff < 0) {
            html += 'Narrower distribution concentrates probability near the mean.';
          }
          break;
        case 'linear-function':
          var slopeDiff = (presetParams.slope || 1) - (currentParams.slope || 1);
          if (slopeDiff > 0) {
            html += 'Steeper slope increases the rate of change.';
          } else if (slopeDiff < 0) {
            html += 'Shallower slope decreases the rate of change.';
          }
          break;
        case 'quadratic-function':
          var aDiff = (presetParams.a || 1) - (currentParams.a || 1);
          if (aDiff > 0) {
            html += 'Narrower parabola with stronger curvature.';
          } else if (aDiff < 0) {
            html += 'Wider parabola with gentler curvature.';
          }
          break;
        case 'relu-function':
          var thrDiff = (presetParams.threshold || 0) - (currentParams.threshold || 0);
          if (thrDiff > 0) {
            html += 'Later threshold delays activation.';
          } else if (thrDiff < 0) {
            html += 'Earlier threshold activates sooner.';
          }
          break;
        default:
          html += 'Comparing configurations reveals mathematical differences.';
      }
      html += '</div>';

      content.innerHTML = html;
    }

    // Experiment state
    var currentExperiment = null;
    var currentStep = 0;

    function bindExperiments() {
      // Start experiment
      root.querySelectorAll('[data-start-experiment]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var vizId = this.getAttribute('data-start-experiment');
          var ui = getUI();
          var EXPERIMENTS = ui && ui.EXPERIMENTS ? ui.EXPERIMENTS : null;
          if (!EXPERIMENTS || !EXPERIMENTS[vizId]) return;

          currentExperiment = EXPERIMENTS[vizId];
          currentStep = 0;
          renderExperimentStep();
        });
      });

      // Next step
      root.addEventListener('click', function (e) {
        var nextBtn = e.target.closest('[data-next-step]');
        if (nextBtn) {
          var stepIdx = parseInt(nextBtn.getAttribute('data-next-step'), 10);
          if (currentExperiment && stepIdx < currentExperiment.steps.length) {
            // Apply step parameters
            var step = currentExperiment.steps[stepIdx];
            if (step.params) {
              Object.keys(step.params).forEach(function (key) {
                currentParams[key] = step.params[key];
              });
              currentStep = stepIdx;
              updateVisualization();
              renderExperimentStep();
            }
          } else if (currentExperiment && stepIdx >= currentExperiment.steps.length) {
            // Complete experiment
            renderExperimentConclusion();
          }
        }
      });

      // Restart experiment
      root.addEventListener('click', function (e) {
        var restartBtn = e.target.closest('[data-restart-experiment]');
        if (restartBtn) {
          currentExperiment = null;
          currentStep = 0;
          // Re-render the experiment card
          var ui = getUI();
          if (ui && currentDefinition) {
            var expContainer = root.querySelector('[data-experiment]');
            if (expContainer) {
              expContainer.outerHTML = ui.renderExperiments(currentDefinition.id);
              bindExperiments();
            }
          }
          updateVisualization();
        }
      });
    }

    function renderExperimentStep() {
      var ui = getUI();
      if (!ui || !currentExperiment) return;

      var expContainer = root.querySelector('[data-experiment]');
      if (!expContainer) return;

      var html = '<div class="nv-pviz-experiment active">';
      html += '<div class="nv-pviz-experiment-header">';
      html += '<h4 class="nv-pviz-experiment-title">🔬 ' + escapeHtml(currentExperiment.title) + '</h4>';
      html += '</div>';

      // Question
      html += '<div class="nv-pviz-experiment-question">' + escapeHtml(currentExperiment.question) + '</div>';

      // Hypothesis
      html += '<div class="nv-pviz-experiment-hypothesis">' + escapeHtml(currentExperiment.hypothesis) + '</div>';

      // Current step
      if (currentStep < currentExperiment.steps.length) {
        html += ui.renderExperimentStep(currentExperiment, currentStep);
      }

      html += '</div>';
      expContainer.outerHTML = html;
    }

    function renderExperimentConclusion() {
      var ui = getUI();
      if (!ui || !currentExperiment) return;

      var expContainer = root.querySelector('[data-experiment]');
      if (!expContainer) return;

      var html = '<div class="nv-pviz-experiment completed">';
      html += '<div class="nv-pviz-experiment-header">';
      html += '<h4 class="nv-pviz-experiment-title">🔬 ' + escapeHtml(currentExperiment.title) + '</h4>';
      html += '</div>';
      html += ui.renderExperimentConclusion(currentExperiment);
      html += '</div>';
      expContainer.outerHTML = html;

      // Rebind restart button
      var restartBtn = root.querySelector('[data-restart-experiment]');
      if (restartBtn) {
        restartBtn.addEventListener('click', function () {
          currentExperiment = null;
          currentStep = 0;
          var newExpContainer = root.querySelector('[data-experiment]');
          if (newExpContainer && ui && currentDefinition) {
            newExpContainer.outerHTML = ui.renderExperiments(currentDefinition.id);
            bindExperiments();
          }
          updateVisualization();
        });
      }
    }

    function bindCrosshair() {
      var canvas = root.querySelector('[data-viz-canvas]');
      var svg = canvas ? canvas.querySelector('svg') : null;
      var tracker = svg ? svg.querySelector('.nv-pviz-tracker') : null;
      var crossX = svg ? svg.querySelector('.nv-pviz-cross-x') : null;
      var crossY = svg ? svg.querySelector('.nv-pviz-cross-y') : null;
      var tooltip = svg ? svg.querySelector('.nv-pviz-tooltip') : null;

      if (!tracker || !crossX || !crossY) return;

      tracker.addEventListener('mousemove', function (e) {
        var rect = svg.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var svgX = (x / rect.width) * 660;
        var svgY = (y / rect.height) * 420;

        crossX.setAttribute('x1', svgX);
        crossX.setAttribute('x2', svgX);
        crossX.setAttribute('opacity', '1');
        crossY.setAttribute('y1', svgY);
        crossY.setAttribute('y2', svgY);
        crossY.setAttribute('opacity', '1');
      });

      tracker.addEventListener('mouseleave', function () {
        crossX.setAttribute('opacity', '0');
        crossY.setAttribute('opacity', '0');
        if (tooltip) tooltip.setAttribute('opacity', '0');
      });
    }

    function updateInterpretation() {
      var panel = root.querySelector('[data-interpretation]');
      if (!panel || !currentDefinition) return;

      var html = '';
      var params = currentParams;

      switch (currentDefinition.id) {
        case 'linear-function':
          var m = params.slope || 1;
          var b = params.intercept || 0;
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Slope</span><span class="nv-pviz-state-value">' + (m > 0 ? '↑ Increasing' : m < 0 ? '↓ Decreasing' : '— Constant') + '</span></div>';
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Intercept</span><span class="nv-pviz-state-value">y = ' + b.toFixed(1) + '</span></div>';
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Steepness</span><span class="nv-pviz-state-value">' + Math.abs(m).toFixed(1) + 'x</span></div>';
          // Mathematical narration
          if (Math.abs(m) > 3) html += '<div class="nv-pviz-narration">The line is very steep.</div>';
          else if (Math.abs(m) < 0.3) html += '<div class="nv-pviz-narration">The line is nearly flat.</div>';
          break;
        case 'quadratic-function':
          var a = params.a || 1;
          var b2 = params.b || 0;
          var c = params.c || 0;
          var vx = safeDiv(-b2, 2 * a);
          var vy = a * vx * vx + b2 * vx + c;
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Concavity</span><span class="nv-pviz-state-value">' + (a > 0 ? '↑ Upward' : '↓ Downward') + '</span></div>';
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Vertex</span><span class="nv-pviz-state-value">(' + vx.toFixed(1) + ', ' + vy.toFixed(1) + ')</span></div>';
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Y-intercept</span><span class="nv-pviz-state-value">' + c.toFixed(1) + '</span></div>';
          // Roots
          var disc = b2 * b2 - 4 * a * c;
          if (disc > 0) {
            var r1 = (-b2 + Math.sqrt(disc)) / (2 * a);
            var r2 = (-b2 - Math.sqrt(disc)) / (2 * a);
            html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Roots</span><span class="nv-pviz-state-value">x = ' + r1.toFixed(1) + ', ' + r2.toFixed(1) + '</span></div>';
          } else if (Math.abs(disc) < 0.001) {
            html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Roots</span><span class="nv-pviz-state-value">x = ' + vx.toFixed(1) + ' (double)</span></div>';
          } else {
            html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Roots</span><span class="nv-pviz-state-value">None (complex)</span></div>';
          }
          if (a > 0) html += '<div class="nv-pviz-narration">Opens upward — minimum at vertex.</div>';
          else html += '<div class="nv-pviz-narration">Opens downward — maximum at vertex.</div>';
          break;
        case 'sigmoid-function':
          var k = params.k || 1;
          var x0 = params.x0 || 0;
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Steepness</span><span class="nv-pviz-state-value">' + (k > 2 ? 'Sharp' : k > 0.5 ? 'Moderate' : 'Smooth') + '</span></div>';
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Center</span><span class="nv-pviz-state-value">x₀ = ' + x0.toFixed(1) + '</span></div>';
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Transition</span><span class="nv-pviz-state-value">~' + (2 / Math.max(k, 0.1)).toFixed(1) + ' units</span></div>';
          if (k > 3) html += '<div class="nv-pviz-narration">Nearly a step function.</div>';
          else if (k < 0.3) html += '<div class="nv-pviz-narration">Very gradual transition.</div>';
          break;
        case 'normal-distribution':
          var mean = params.mean || 0;
          var std = params.stdDev || 1;
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Mean μ</span><span class="nv-pviz-state-value">' + mean.toFixed(1) + '</span></div>';
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Std Dev σ</span><span class="nv-pviz-state-value">' + std.toFixed(1) + '</span></div>';
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">68% range</span><span class="nv-pviz-state-value">[' + (mean - std).toFixed(1) + ', ' + (mean + std).toFixed(1) + ']</span></div>';
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">95% range</span><span class="nv-pviz-state-value">[' + (mean - 2 * std).toFixed(1) + ', ' + (mean + 2 * std).toFixed(1) + ']</span></div>';
          if (std > 2) html += '<div class="nv-pviz-narration">Wide distribution — high variance.</div>';
          else if (std < 0.5) html += '<div class="nv-pviz-narration">Narrow distribution — low variance.</div>';
          break;
        case 'relu-function':
          var thr = params.threshold || 0;
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Threshold</span><span class="nv-pviz-state-value">' + thr.toFixed(1) + '</span></div>';
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Active for</span><span class="nv-pviz-state-value">x > ' + thr.toFixed(1) + '</span></div>';
          html += '<div class="nv-pviz-narration">Zero below, linear above.</div>';
          break;
        case 'gradient-descent-loss':
          var lr = params.learningRate || 0.01;
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Learning Rate</span><span class="nv-pviz-state-value">' + (lr > 0.1 ? 'Aggressive' : lr > 0.01 ? 'Moderate' : 'Conservative') + '</span></div>';
          html += '<div class="nv-pviz-state-item"><span class="nv-pviz-state-label">Convergence</span><span class="nv-pviz-state-value">' + (lr > 0.05 ? 'Fast' : lr > 0.01 ? 'Moderate' : 'Slow') + '</span></div>';
          if (lr > 0.3) html += '<div class="nv-pviz-narration">May overshoot — risk of divergence.</div>';
          else if (lr < 0.005) html += '<div class="nv-pviz-narration">Very slow convergence.</div>';
          break;
        default:
          html = '<p class="nv-pviz-muted">Adjust parameters to explore.</p>';
      }

      panel.querySelector('.nv-pviz-interpretation-content').innerHTML = html;
    }

    function bindCategoryFilter() {
      root.querySelectorAll('.nv-pviz-filter-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var category = this.getAttribute('data-category');
          var registry = getRegistry();
          if (!registry) return;

          // Update active state
          root.querySelectorAll('.nv-pviz-filter-btn').forEach(function (b) {
            b.classList.remove('nv-pviz-filter-btn--active');
          });
          this.classList.add('nv-pviz-filter-btn--active');

          // Filter cards
          var cards = root.querySelectorAll('.nv-pviz-card');
          cards.forEach(function (card) {
            if (category === 'all') {
              card.style.display = '';
            } else {
              var vizId = card.getAttribute('data-viz-id');
              var def = registry.get(vizId);
              card.style.display = (def && def.category === category) ? '' : 'none';
            }
          });
        });
      });
    }

    function handleAction(action) {
      var storage = getStorage();
      var pe = getParameterEngine();

      switch (action) {
        case 'reset-params':
          if (currentDefinition && pe) {
            currentParams = pe.buildDefaults(currentDefinition);
            renderDetail();
          }
          break;

        case 'copy-params':
          if (currentParams) {
            var json = JSON.stringify(currentParams, null, 2);
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
              navigator.clipboard.writeText(json).catch(function () {});
            }
          }
          break;

        case 'toggle-favorite':
          if (storage && currentDefinition) {
            storage.toggleFavorite(currentDefinition.id);
            renderDetail();
          }
          break;

        case 'save-preset': {
          var nameInput = root.querySelector('#nv-pviz-preset-name');
          var name = nameInput ? nameInput.value.trim() : '';
          if (!name || !storage || !currentDefinition) break;
          storage.savePreset(currentDefinition.id, name, Object.assign({}, currentParams));
          if (nameInput) nameInput.value = '';
          renderPresetsList();
          break;
        }
      }
    }

    function renderPresetsList() {
      var storage = getStorage();
      var pe = getParameterEngine();
      var presetsContainer = root.querySelector('[data-presets-list]');
      var presetsSection = root.querySelector('[data-presets-section]');
      if (!presetsContainer || !currentDefinition) return;

      var presets = storage ? storage.getPresets(currentDefinition.id) : [];
      if (presets.length === 0) {
        presetsContainer.innerHTML = '';
        if (presetsSection) presetsSection.classList.add('nv-pviz-presets--empty');
        return;
      }

      if (presetsSection) presetsSection.classList.remove('nv-pviz-presets--empty');

      var html = '';
      for (var i = 0; i < presets.length; i++) {
        html += '<div class="nv-pviz-preset-item">';
        html += '<button class="nv-pviz-preset-load" data-preset-index="' + i + '" aria-label="Load preset ' + escapeHtml(presets[i].name) + '">';
        html += escapeHtml(presets[i].name);
        html += '</button>';
        html += '<button class="nv-pviz-preset-delete" data-preset-delete="' + i + '" aria-label="Delete preset ' + escapeHtml(presets[i].name) + '">&times;</button>';
        html += '</div>';
      }
      presetsContainer.innerHTML = html;

      // Bind preset load
      presetsContainer.querySelectorAll('.nv-pviz-preset-load').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idx = parseInt(this.getAttribute('data-preset-index'), 10);
          var preset = presets[idx];
          if (preset && preset.params) {
            currentParams = Object.assign({}, preset.params);
            renderDetail();
          }
        });
      });

      // Bind preset delete
      presetsContainer.querySelectorAll('.nv-pviz-preset-delete').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idx = parseInt(this.getAttribute('data-preset-delete'), 10);
          if (storage) {
            storage.deletePreset(currentDefinition.id, idx);
            renderPresetsList();
          }
        });
      });
    }

    function loadVisualizationBySlug(slug) {
      loadVisualization(slug);
    }

    function init() {
      // Listen for route changes
      window.addEventListener('nv:routerendered', function (e) {
        var routeId = e.detail && e.detail.routeId;
        if (routeId === 'visualizations') {
          renderList();
        } else if (routeId === 'visualization-detail') {
          var hash = window.location.hash || '';
          var match = hash.match(/^#\/visualizations\/([a-z0-9-]+)$/);
          var slug = match ? match[1] : null;
          if (slug) {
            loadVisualizationBySlug(slug);
          }
        }
      });

      // Listen for state import
      window.addEventListener('nv:viz_state_imported', function () {
        if (currentDefinition) {
          renderDetail();
        }
      });
    }

    return {
      init: init,
      renderList: renderList,
      loadVisualization: loadVisualizationBySlug,
      renderDetail: renderDetail,
      getCurrentDefinition: function () { return currentDefinition; },
      getCurrentParams: function () { return Object.assign({}, currentParams); }
    };
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createVisualizationController = createVisualizationController;
})();
