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

  function createVisualizationController(options) {
    var root = options && options.root ? options.root : document;
    var currentDefinition = null;
    var currentParams = {};
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
      html += '<header class="nv-page-section__header nv-pviz-page-header">';
      html += '<p class="nv-page-section__eyebrow">Visualizations</p>';
      html += '<h1>Parametric, deterministic charts.</h1>';
      html += '<p>Visualize the underlying mathematics — every chart re-derives from a saved parameter set, perfect for inspecting and explaining.</p>';
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
      html += '<h3 class="nv-pviz-sidebar-title">Parameters</h3>';
      html += '<div class="nv-pviz-controls">';
      html += ui.renderParameterControls(currentDefinition.parameterSchema, currentParams);
      html += '</div>';

      // Presets section
      html += '<div class="nv-pviz-presets">';
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
    }

    function renderNotFound() {
      var workspace = root.querySelector('#nv-workspace-content-body') || root.querySelector('.nv-workspace__surface');
      if (!workspace) return;

      var html = '<div class="nv-pviz-page"><div class="nv-pviz-empty-state">';
      html += '<h2>Visualization Not Found</h2>';
      html += '<p>The requested visualization does not exist.</p>';
      html += '<a href="#/visualizations" class="nv-pviz-btn">Browse Visualizations</a>';
      html += '</div></div>';
      workspace.innerHTML = html;
    }

    function updateVisualization() {
      var engine = getEngine();
      var renderer = getRenderer();

      if (!engine || !renderer || !currentDefinition) return;

      currentModel = engine.computeRenderModel(currentDefinition, currentParams);
      var canvas = root.querySelector('[data-viz-canvas]');
      if (canvas && currentModel) {
        renderer.render(canvas, currentModel);
      }
    }

    function bindControls() {
      var controls = root.querySelector('.nv-pviz-controls');
      if (!controls) return;

      // Slider inputs
      controls.querySelectorAll('.nv-pviz-slider').forEach(function (slider) {
        slider.addEventListener('input', function () {
          var key = this.getAttribute('data-param-key');
          var type = this.getAttribute('data-param-type');
          var valueEl = root.querySelector('#pviz-val-' + key);

          if (type === 'integer') {
            currentParams[key] = parseInt(this.value, 10);
          } else {
            currentParams[key] = parseFloat(this.value);
          }

          if (valueEl) valueEl.textContent = currentParams[key];
          updateVisualization();
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
      if (!presetsContainer || !currentDefinition) return;

      var presets = storage ? storage.getPresets(currentDefinition.id) : [];
      if (presets.length === 0) {
        presetsContainer.innerHTML = '<p class="nv-pviz-muted">No saved presets.</p>';
        return;
      }

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
