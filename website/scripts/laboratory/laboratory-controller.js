/**
 * NV-1100-P7 — Laboratory Controller
 * Page-level controller for routing, lifecycle, and integration.
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

  function createLaboratoryController(options) {
    var root = options.root || document;
    var uiController = null;

    function getIndexContainer() {
      return root.querySelector('[data-lab-index]');
    }

    function getViewerContainer() {
      return root.querySelector('[data-lab-viewer]');
    }

    function loadLabIndex() {
      var container = getIndexContainer();
      if (!container) return;

      function doRender() {
        if (!uiController) {
          uiController = window.NeuralVerse.createLabUIController({ root: root });
        }
        uiController.renderLabIndex(container);
      }

      // Wait for labs to be loaded before rendering
      var loadAllLabs = window.NeuralVerse.loadAllLabs;
      if (loadAllLabs) {
        loadAllLabs(doRender);
      } else {
        doRender();
      }
    }

    function loadLabBySlug(slug) {
      function doLoad() {
        var lab = window.NeuralVerse.LabRegistry.getBySlug(slug);
        if (!lab) {
          showLabNotFound();
          return;
        }

        var viewer = getViewerContainer();
        if (!viewer) return;

        renderLabViewer(lab);

        if (!uiController) {
          uiController = window.NeuralVerse.createLabUIController({ root: viewer });
        }
        uiController.loadLab(lab);
      }

      // Wait for labs to be loaded
      var loadAllLabs = window.NeuralVerse.loadAllLabs;
      if (loadAllLabs) {
        loadAllLabs(doLoad);
      } else {
        doLoad();
      }
    }

    function renderLabViewer(lab) {
      var viewer = getViewerContainer();
      if (!viewer) return;

      var hasSteps = lab.steps && lab.steps.length > 0;
      var familyMap = {
        'machine-learning': 'Model Behavior',
        'optimization': 'Optimization',
        'dimensionality-reduction': 'Dimensionality Reduction',
        'mathematics': 'Similarity',
        'natural-language-processing': 'Similarity',
        'probability': 'Probabilistic Reasoning',
        'evaluation': 'Evaluation',
        'deep-learning': 'Attention Mechanisms'
      };
      var family = familyMap[lab.category] || lab.category;

      var html = '';

      // ── Experiment Overview ──
      html += '<div class="nv-lab-workspace-header">';
      html += '<div class="nv-lab-ws-nav">';
      html += '<a href="#/laboratory" class="nv-lab-back-btn" aria-label="Back to laboratories">';
      html += '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';
      html += 'Experiments';
      html += '</a>';
      html += '<span class="nv-lab-ws-family">' + escapeHtml(family) + '</span>';
      html += '</div>';
      html += '<div class="nv-lab-ws-overview">';
      html += '<h2 class="nv-lab-ws-title" data-lab-title>' + escapeHtml(lab.title) + '</h2>';
      html += '<p class="nv-lab-ws-summary" data-lab-summary>' + escapeHtml(lab.summary) + '</p>';
      html += '<div class="nv-lab-ws-meta">';
      html += '<span class="nv-lab-ws-meta-item"><span class="nv-lab-ws-meta-label">Duration</span> ' + escapeHtml(lab.estimatedDuration || '10 min') + '</span>';
      html += '<span class="nv-lab-ws-meta-item"><span class="nv-lab-ws-meta-label">Status</span> ' + escapeHtml(lab.canonicalStatus || 'ready') + '</span>';
      if (hasSteps) {
        html += '<span class="nv-lab-ws-meta-item"><span class="nv-lab-ws-meta-label">Steps</span> ' + lab.steps.length + '</span>';
      }
      html += '</div>';
      html += '</div>';
      html += '</div>';

      // ── Main Workspace Grid ──
      html += '<div class="nv-lab-workspace-body">';

      // ── Left: Setup Panel ──
      html += '<div class="nv-lab-ws-setup">';
      html += '<div class="nv-lab-ws-setup-header">';
      html += '<h3>Experiment Setup</h3>';
      html += '<button class="nv-lab-ws-reset-btn" data-lab-reset aria-label="Reset parameters">';
      html += '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.3 2.6L3 12"/><path d="M3 3v5h5"/></svg>';
      html += 'Reset';
      html += '</button>';
      html += '</div>';
      html += '<div class="nv-lab-ws-params" data-lab-parameters></div>';

      // ── Execution Controls ──
      if (hasSteps) {
        html += '<div class="nv-lab-ws-controls">';
        html += '<h4>Execution</h4>';
        html += '<div class="nv-lab-ws-control-bar">';
        html += '<button class="nv-lab-ws-ctrl" data-action="run" aria-label="Run experiment" title="Run">&#9654;</button>';
        html += '<button class="nv-lab-ws-ctrl" data-action="step" aria-label="Step forward" title="Step">&#9193;</button>';
        html += '<button class="nv-lab-ws-ctrl" data-action="pause" aria-label="Pause" title="Pause" disabled>&#9646;&#9646;</button>';
        html += '<button class="nv-lab-ws-ctrl" data-action="reset-exec" aria-label="Reset execution" title="Reset">&#8634;</button>';
        html += '<div class="nv-lab-ws-speed">';
        html += '<button class="nv-lab-ws-speed-btn active" data-speed="1">1×</button>';
        html += '<button class="nv-lab-ws-speed-btn" data-speed="2">2×</button>';
        html += '<button class="nv-lab-ws-speed-btn" data-speed="4">4×</button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        // ── Live State ──
        html += '<div class="nv-lab-ws-live">';
        html += '<h4>Live State</h4>';
        html += '<div class="nv-lab-ws-live-grid" data-lab-live-state>';
        html += '<div class="nv-lab-ws-live-item"><span class="nv-lab-ws-live-label">Step</span><span class="nv-lab-ws-live-value" data-live-step>0 / 0</span></div>';
        html += '<div class="nv-lab-ws-live-item"><span class="nv-lab-ws-live-label">Status</span><span class="nv-lab-ws-live-value" data-live-status>Idle</span></div>';
        html += '</div>';
        html += '</div>';
      }

      html += '</div>';

      // ── Center: Execution Workspace ──
      html += '<div class="nv-lab-ws-center">';

      // ── Timeline ──
      if (hasSteps) {
        html += '<div class="nv-lab-ws-timeline" data-lab-timeline>';
        lab.steps.forEach(function (step, i) {
          html += '<div class="nv-lab-ws-tl-step" data-step="' + i + '">';
          html += '<div class="nv-lab-ws-tl-dot"></div>';
          html += '<span class="nv-lab-ws-tl-label">' + escapeHtml(step.label) + '</span>';
          html += '</div>';
        });
        html += '</div>';
      }

      // ── Algorithm State Inspector ──
      html += '<div class="nv-lab-ws-inspector" data-lab-inspector>';
      html += '<div class="nv-lab-ws-inspector-header">';
      html += '<h3>' + escapeHtml(lab.inspector ? lab.inspector.title : 'Algorithm State') + '</h3>';
      html += '</div>';
      html += '<div class="nv-lab-ws-inspector-body" data-lab-inspector-body>';

      if (lab.inspector && lab.inspector.sections) {
        lab.inspector.sections.forEach(function (section) {
          html += '<div class="nv-lab-ws-inspector-section">';
          html += '<h4 class="nv-lab-ws-inspector-section-title">' + escapeHtml(section.label) + '</h4>';
          html += '<div class="nv-lab-ws-inspector-cards">';
          section.cards.forEach(function (card) {
            html += '<div class="nv-lab-inspector-card" data-inspector-key="' + escapeHtml(card.key) + '">';
            html += '<span class="nv-lab-inspector-label">' + escapeHtml(card.label) + '</span>';
            html += '<span class="nv-lab-inspector-value" data-inspector-value="' + escapeHtml(card.key) + '">—</span>';
            html += '<span class="nv-lab-inspector-interpretation" data-inspector-interpretation="' + escapeHtml(card.key) + '"></span>';
            if (card.fixed) html += '<span class="nv-lab-inspector-fixed">fixed</span>';
            html += '</div>';
          });
          html += '</div>';
          html += '</div>';
        });
      }

      // ── Change Feed ──
      html += '<div class="nv-lab-ws-change-feed" data-lab-change-feed>';
      html += '<h4 class="nv-lab-ws-inspector-section-title">Change Feed</h4>';
      html += '<div class="nv-lab-ws-change-entries" data-lab-change-entries></div>';
      html += '</div>';

      html += '</div>';
      html += '</div>';

      // ── Observation Workspace ──
      html += '<div class="nv-lab-ws-observations" data-lab-observations>';

      if (lab.observations && lab.observations.length > 0) {
        lab.observations.forEach(function (obs, i) {
          var sizeClass = obs.defaultSize === 'large' ? 'nv-lab-obs-panel--large' : 'nv-lab-obs-panel--small';
          html += '<div class="nv-lab-obs-panel ' + sizeClass + '" data-obs-id="' + escapeHtml(obs.id) + '" data-obs-index="' + i + '">';
          html += '<div class="nv-lab-obs-panel-header">';
          html += '<div class="nv-lab-obs-panel-info">';
          html += '<span class="nv-lab-obs-panel-title">' + escapeHtml(obs.title) + '</span>';
          html += '<span class="nv-lab-obs-panel-purpose">' + escapeHtml(obs.purpose) + '</span>';
          html += '</div>';
          html += '<div class="nv-lab-obs-panel-actions">';
          html += '<button class="nv-lab-obs-btn" data-action="expand" aria-label="Expand panel" title="Expand">&#x26F6;</button>';
          html += '<button class="nv-lab-obs-btn" data-action="collapse" aria-label="Collapse panel" title="Collapse">&#x2212;</button>';
          html += '</div>';
          html += '</div>';
          html += '<div class="nv-lab-obs-panel-body" data-obs-body="' + escapeHtml(obs.id) + '"></div>';
          html += '</div>';
        });
      } else {
        // Fallback: single visualization
        html += '<div class="nv-lab-obs-panel nv-lab-obs-panel--large" data-obs-id="primary">';
        html += '<div class="nv-lab-obs-panel-header">';
        html += '<div class="nv-lab-obs-panel-info">';
        html += '<span class="nv-lab-obs-panel-title">' + escapeHtml(lab.visualization ? lab.visualization.title || 'Output' : 'Output') + '</span>';
        html += '</div>';
        html += '</div>';
        html += '<div class="nv-lab-obs-panel-body" data-lab-visualization data-obs-body="primary"></div>';
        html += '</div>';
      }

      html += '</div>';

      // ── Metrics Panel ──
      html += '<div class="nv-lab-ws-metrics" data-lab-metrics>';
      html += '<h4>Metrics</h4>';
      html += '<div class="nv-lab-ws-metrics-grid" data-lab-metrics-grid></div>';
      html += '</div>';

      html += '</div>';

      // ── Right: Log Panel ──
      html += '<div class="nv-lab-ws-log">';
      html += '<h4>Scientific Log</h4>';
      html += '<div class="nv-lab-ws-log-entries" data-lab-log></div>';
      html += '</div>';

      html += '</div>';

      viewer.innerHTML = html;
      viewer.style.display = 'flex';
      viewer.style.flexDirection = 'column';

      // Wire up reset
      var resetBtn = viewer.querySelector('[data-lab-reset]');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          if (uiController) uiController.resetParameters();
        });
      }
    }

    function showLabNotFound() {
      var viewer = getViewerContainer();
      if (!viewer) return;
      viewer.innerHTML = '<div class="nv-lab-error" style="margin:48px;text-align:center;">' +
        '<h3 style="color:var(--nv-lab-text);margin-bottom:8px;">Laboratory Not Found</h3>' +
        '<p>The requested laboratory could not be found.</p>' +
        '<a href="#/laboratory" class="nv-lab-back-btn" style="margin-top:16px;display:inline-flex;">Back to Laboratories</a>' +
        '</div>';
      viewer.style.display = 'block';
    }

    function handleRoute(params) {
      var slug = params && params.slug;
      if (slug) {
        loadLabBySlug(slug);
      } else {
        loadLabIndex();
      }
    }

    function destroy() {
      if (uiController) {
        uiController.destroy();
        uiController = null;
      }
    }

    return {
      handleRoute: handleRoute,
      loadLabIndex: loadLabIndex,
      loadLabBySlug: loadLabBySlug,
      destroy: destroy
    };
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createLaboratoryController = createLaboratoryController;

})();
