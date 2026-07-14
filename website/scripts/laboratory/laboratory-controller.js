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
    var uiControllerRoot = null;

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
        if (uiController && uiControllerRoot !== root) {
          uiController.destroy();
          uiController = null;
          uiControllerRoot = null;
        }
        if (!uiController) {
          uiController = window.NeuralVerse.createLabUIController({ root: root });
          uiControllerRoot = root;
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

        // The route view replaces [data-lab-viewer]. A controller rooted in
        // the previous viewer would retain detached controls and sessions.
        if (uiController && uiControllerRoot !== viewer) {
          uiController.destroy();
          uiController = null;
          uiControllerRoot = null;
        }
        if (!uiController) {
          uiController = window.NeuralVerse.createLabUIController({ root: viewer });
          uiControllerRoot = viewer;
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
      var difficulty = lab.difficulty || lab.level || 'Core';
      var prerequisite = lab.prerequisite || lab.prerequisites || 'None';
      var configurationLayout = lab.slug === 'logistic-regression' ? 'dense-grid' : 'standard';
      if (Array.isArray(prerequisite)) prerequisite = prerequisite.length ? prerequisite.join(', ') : 'None';

      var html = '<section class="nv-lab-v4-workspace nv-lab-workspace-body nv-lab-instrument" ' +
        'data-lab-v4-workspace data-lab-workspace data-workspace-version="4" ' +
        'data-workspace-architecture="canvas-first" data-configuration-layout="' + configurationLayout + '" data-execution-state="preparation" ' +
        'data-research-state="inactive">';

      // ── Workspace Header (compact) ──
      html += '<header class="nv-lab-v4-header nv-lab-workspace-header" data-lab-v4-header>';
      html += '<div class="nv-lab-ws-nav">';
      html += '<a href="#/laboratory" class="nv-lab-back-btn" aria-label="Back to laboratories">';
      html += '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';
      html += 'Experiments';
      html += '</a>';
      html += '<span class="nv-lab-ws-family">' + escapeHtml(family) + '</span>';
      html += '<button class="nv-lab-ws-research-toggle" data-research-toggle aria-expanded="false" aria-controls="v4-research-body" aria-label="Activate Research Session" title="Activate Research Session">';
      html += '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>';
      html += 'Research';
      html += '</button>';
      html += '</div>';
      html += '<div class="nv-lab-ws-overview">';
      html += '<h2 class="nv-lab-ws-title" data-lab-title>' + escapeHtml(lab.title) + '</h2>';
      html += '<p class="nv-lab-ws-summary" data-lab-summary>' + escapeHtml(lab.summary) + '</p>';
      html += '<div class="nv-lab-ws-meta">';
      html += '<span class="nv-lab-ws-meta-item"><span class="nv-lab-ws-meta-label">Duration</span> ' + escapeHtml(lab.estimatedDuration || '10 min') + '</span>';
      html += '<span class="nv-lab-ws-meta-item"><span class="nv-lab-ws-meta-label">Difficulty</span> ' + escapeHtml(difficulty) + '</span>';
      html += '<span class="nv-lab-ws-meta-item"><span class="nv-lab-ws-meta-label">Prerequisite</span> ' + escapeHtml(prerequisite) + '</span>';
      html += '</div>';
      html += '</div>';
      html += '</header>';

      // The canonical Observation Deck keeps the experiment and its immediate context adjacent.
      html += '<section class="nv-lab-v4-observation-deck" data-lab-v4-observation-deck aria-label="Observation deck">';
      html += '<section class="nv-lab-v4-stage nv-lab-canvas-region nv-lab-ws-center" data-lab-v4-stage data-lab-canvas-region aria-label="Scientific stage">';
      html += '<section class="nv-lab-v4-canvas" data-lab-v4-canvas aria-label="Scientific visualization">';
      html += '<div class="nv-lab-ws-observations" data-lab-observations>';

      if (lab.observations && lab.observations.length > 0) {
        lab.observations.forEach(function (obs, i) {
          var isPrimary = i === 0;
          var panelClass = isPrimary ? 'nv-lab-obs-panel nv-lab-obs-panel--primary nv-lab-v4-visualization' : 'nv-lab-obs-panel nv-lab-obs-panel--secondary';
          html += '<div class="' + panelClass + '" data-obs-id="' + escapeHtml(obs.id) + '" data-obs-index="' + i + '"' + (isPrimary ? ' data-lab-v4-visualization' : '') + '>';
          html += '<div class="nv-lab-obs-panel-header">';
          html += '<span class="nv-lab-obs-panel-title">' + escapeHtml(obs.title) + '</span>';
          if (!isPrimary) {
            html += '<span class="nv-lab-obs-panel-purpose">' + escapeHtml(obs.purpose) + '</span>';
          }
          html += '</div>';
          html += '<div class="nv-lab-obs-panel-body" data-obs-body="' + escapeHtml(obs.id) + '">';
          if (isPrimary) {
            html += '<div class="nv-lab-obs-placeholder" aria-hidden="true">';
            html += '<div class="nv-lab-obs-placeholder-icon">';
            html += '<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.25"><circle cx="24" cy="24" r="20"/><path d="M24 14v10l7 7"/></svg>';
            html += '</div>';
            html += '<span class="nv-lab-obs-placeholder-hint">Configure parameters and run the experiment</span>';
            html += '</div>';
          }
          html += '</div>';
          html += '</div>';
        });
      } else {
        html += '<div class="nv-lab-obs-panel nv-lab-obs-panel--primary nv-lab-v4-visualization" data-lab-v4-visualization data-obs-id="primary">';
        html += '<div class="nv-lab-obs-panel-header">';
        html += '<span class="nv-lab-obs-panel-title">' + escapeHtml(lab.visualization ? lab.visualization.title || 'Output' : 'Output') + '</span>';
        html += '</div>';
        html += '<div class="nv-lab-obs-panel-body" data-lab-visualization data-obs-body="primary"></div>';
        html += '</div>';
      }

      html += '</div>';
      html += '</section>';

      html += '</section>';
      html += '<aside class="nv-lab-v4-scientific-context" data-lab-v4-scientific-context aria-label="Scientific context">';
      // Essential telemetry stays close to the observation but is not an overlay.
      html += '<section class="nv-lab-v4-telemetry nv-lab-hud-telemetry" data-lab-v4-telemetry data-lab-hud-telemetry aria-label="Current experiment telemetry">';
      html += '<div class="nv-lab-hud-telemetry-title">' + escapeHtml(lab.title || (lab.inspector ? lab.inspector.title : 'Algorithm State')) + '</div>';
      html += '<dl class="nv-lab-hud-telemetry-grid" data-lab-hud-metrics>';
      html += '<div class="nv-lab-hud-metric" data-hud-metric="step"><dt class="nv-lab-hud-metric-label">Step</dt><dd class="nv-lab-hud-metric-value" data-hud-metric-value="step">0</dd></div>';
      html += '<div class="nv-lab-hud-metric" data-hud-metric="status"><dt class="nv-lab-hud-metric-label">Status</dt><dd class="nv-lab-hud-metric-value" data-hud-metric-value="status">Ready</dd></div>';
      html += '</dl>';
       html += '</section>';

       // The configuration has one semantic owner. It is placed in the active
       // experiment rail so preparation exposes Observe, Configure, Execute.
       html += '<div class="nv-lab-v4-configuration-slot" data-lab-v4-configuration-slot></div>';

       // Current finding is contextual interpretation, not a Stage overlay.
      html += '<aside class="nv-lab-v4-current-finding nv-xai-panel nv-lab-panel-reveal nv-lab-hud nv-lab-hud--right" data-lab-v4-current-finding data-xai-panel role="region" aria-label="Current scientific finding" aria-live="polite" hidden style="display:none;">';
      html += '<div class="nv-xai-panel-header">';
      html += '<h3>Scientific Findings</h3>';
      html += '<div class="nv-xai-panel-actions">';
      html += '<span class="nv-xai-metrics-inline">';
      html += '<span data-xai-metric-count>0</span> findings';
      html += ' · ';
      html += '<span data-xai-metric-critical>0</span> critical';
      html += '</span>';
      html += '<button class="nv-xai-toggle-history nv-lab-ws-collapsible-header" data-xai-toggle-history aria-label="Toggle findings history" title="History" aria-expanded="false">';
      html += '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>';
      html += '</button>';
      html += '</div>';
      html += '</div>';
      html += '<div class="nv-xai-live-finding" data-xai-live-finding aria-live="polite">';
      html += '<div class="nv-xai-empty-state">';
      html += '<span class="nv-xai-empty-label">Observations will appear during execution</span>';
      html += '</div>';
      html += '</div>';
      html += '<div class="nv-xai-history" data-xai-history style="display:none;">';
      html += '<div class="nv-xai-timeline" data-xai-timeline role="list" aria-label="Finding history"></div>';
      html += '</div>';
      html += '</aside>';

      html += '</aside>';
      html += '</section>';

      // ── Phase 12.3: execution controls are owned only by the v4 console. ──
      if (hasSteps) {
        html += '<section class="nv-lab-v4-console nv-lab-v4-execution-deck" data-lab-v4-console data-lab-v4-execution-deck aria-label="Execution deck">';
        html += '<section class="nv-lab-v4-execution-console" data-lab-v4-execution-console data-execution-state="preparation" aria-label="Experiment execution controls">';
        html += '<div class="nv-lab-v4-execution-console__status" data-lab-v4-execution-status aria-live="polite">';
        html += '<span data-live-status>Ready</span><span aria-hidden="true"> · </span><span data-live-step>0 / ' + lab.steps.length + '</span>';
        html += '</div>';
        html += '<div class="nv-lab-v4-execution-console__timeline" data-lab-v4-timeline-region>';
        html += '<div class="nv-lab-v4-timeline" data-lab-timeline style="--nv-lab-step-count:' + lab.steps.length + '">';
        html += '<div class="nv-lab-v4-timeline__track" aria-hidden="true"><div class="nv-lab-v4-timeline__progress" data-lab-v4-timeline-progress></div></div>';
        lab.steps.forEach(function (step, i) {
          var isMilestone = i === 0 || i === lab.steps.length - 1 || (lab.steps.length <= 8) || (i % Math.max(1, Math.floor(lab.steps.length / 4)) === 0);
          var classes = 'nv-lab-v4-timeline__step' + (isMilestone ? ' is-milestone' : '');
          html += '<span class="' + classes + '" data-step="' + i + '">';
          html += '<span class="nv-lab-v4-timeline__dot"></span>';
          html += '<span class="nv-lab-v4-timeline__label">' + escapeHtml(step.label) + '</span>';
          html += '</span>';
        });
        html += '<input class="nv-lab-v4-timeline__input" data-lab-v4-timeline-input type="range" min="0" max="' + (lab.steps.length - 1) + '" value="0" aria-label="Experiment step" aria-valuetext="Ready at step 0 of ' + lab.steps.length + '">';
        html += '</div>';
        html += '</div>';
        html += '<div class="nv-lab-v4-execution-console__controls" data-lab-v4-playback-controls aria-label="Playback controls">';
        html += '<button class="nv-lab-v4-execution-console__control nv-lab-v4-execution-console__control--primary" data-action="run" aria-label="Run experiment" title="Run experiment">&#9654;<span>Run</span></button>';
        html += '<button class="nv-lab-v4-execution-console__control" data-action="pause" aria-label="Pause experiment" title="Pause experiment" disabled>&#9646;&#9646;<span>Pause</span></button>';
        html += '<button class="nv-lab-v4-execution-console__control" data-action="step" aria-label="Step forward" title="Step forward">&#9193;<span>Step</span></button>';
        html += '</div>';
        html += '<div class="nv-lab-v4-execution-console__secondary" data-lab-v4-secondary-controls aria-label="Secondary execution controls">';
        html += '<button class="nv-lab-v4-execution-console__control" data-action="reset-exec" aria-label="Reset experiment" title="Reset experiment">&#8634;<span>Reset</span></button>';
        html += '</div>';
        html += '<div class="nv-lab-v4-execution-console__speed" data-lab-v4-speed-control role="radiogroup" aria-label="Execution speed">';
        html += '<button class="nv-lab-v4-execution-console__speed-option is-selected" data-speed="1" role="radio" aria-checked="true">1×</button>';
        html += '<button class="nv-lab-v4-execution-console__speed-option" data-speed="2" role="radio" aria-checked="false">2×</button>';
        html += '<button class="nv-lab-v4-execution-console__speed-option" data-speed="4" role="radio" aria-checked="false">4×</button>';
        html += '</div>';
        html += '</section>';
        html += '</section>';
      }

      // ── Phase 12.4: Disclosure Workspace ──
      html += '<section class="nv-lab-v4-disclosure nv-lab-v4-analysis-deck" data-lab-v4-disclosure data-lab-v4-analysis-deck aria-label="Analysis deck">';
      html += '<div class="nv-lab-v4-disclosure-workspace" data-lab-v4-disclosure-workspace>';

      // ── 1. Parameters Panel ──
      html += '<section class="nv-lab-v4-disclosure-panel nv-lab-v4-parameters" data-lab-v4-parameters data-lab-parameters-drawer data-disclosure-state="expanded">';
        html += '<div class="nv-lab-v4-disclosure-panel__header nv-lab-v4-disclosure-panel__header--parameters">';
        html += '<button class="nv-lab-v4-disclosure-panel__trigger" type="button" data-disclosure-toggle="parameters" aria-expanded="true" aria-controls="v4-parameters-body">';
      html += '<span class="nv-lab-v4-disclosure-panel__identity">';
      html += '<span class="nv-lab-v4-disclosure-panel__title">Experiment Configuration</span>';
      html += '<span class="nv-lab-v4-disclosure-panel__count" data-param-count>' + (lab.parameterSchema ? lab.parameterSchema.length : 0) + ' controls</span>';
      html += '</span>';
        html += '</button>';
        html += '<span class="nv-lab-v4-disclosure-panel__actions">';
      html += '<button class="nv-lab-v4-param-reset" data-lab-reset aria-label="Reset parameters to defaults" title="Reset parameters">';
      html += '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.3 2.6L3 12"/><path d="M3 3v5h5"/></svg>';
      html += 'Reset Parameters';
      html += '</button>';
        html += '</span>';
        html += '</div>';
      html += '<div class="nv-lab-v4-disclosure-panel__body" id="v4-parameters-body">';
      html += '<div class="nv-lab-v4-disclosure-panel__body-inner">';
      html += '<div class="nv-lab-ws-params" id="lab-parameters" data-lab-parameters></div>';
      html += '</div>';
      html += '</div>';
      html += '</section>';

      // ── 2. Inspector Details Panel ──
      var inspectorHidden = (!lab.inspector || !lab.inspector.sections || lab.inspector.sections.length === 0) ? ' hidden' : '';
      html += '<section class="nv-lab-v4-disclosure-panel nv-lab-v4-inspector-details" data-lab-v4-inspector-details data-lab-inspector data-disclosure-state="collapsed"' + inspectorHidden + '>';
      html += '<button class="nv-lab-v4-disclosure-panel__header" type="button" data-disclosure-toggle="inspector" aria-expanded="false" aria-controls="v4-inspector-body">';
      html += '<span class="nv-lab-v4-disclosure-panel__identity">';
      html += '<span class="nv-lab-v4-disclosure-panel__title">Inspector Details</span>';
      html += '<span class="nv-lab-v4-disclosure-panel__summary" data-inspector-summary>Secondary diagnostics</span>';
      html += '</span>';
      html += '<span class="nv-lab-v4-disclosure-panel__toggle" aria-hidden="true">';
      html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';
      html += '</span>';
      html += '</button>';
        html += '<div class="nv-lab-v4-disclosure-panel__body" id="v4-inspector-body" hidden inert>';
      html += '<div class="nv-lab-v4-disclosure-panel__body-inner">';
      html += '<div class="nv-lab-hud-accordions" data-lab-hud-accordions>';
      if (lab.inspector && lab.inspector.sections) {
        var hudSections = lab.inspector.sections.slice(0, 3);
        hudSections.forEach(function (section, sIdx) {
          var sectionId = 'v4-hud-accordion-' + sIdx;
          html += '<div class="nv-lab-hud-accordion" data-lab-hud-accordion="' + sIdx + '">';
          html += '<button class="nv-lab-hud-accordion-trigger" data-accordion-trigger="' + sectionId + '" aria-expanded="false" aria-controls="' + sectionId + '">';
          html += '<span class="nv-lab-hud-accordion-label">' + escapeHtml(section.label) + '</span>';
          html += '<svg class="nv-lab-hud-accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
          html += '</button>';
          html += '<div class="nv-lab-hud-accordion-body" id="' + sectionId + '" role="region" hidden inert>';
          section.cards.forEach(function (card) {
            html += '<div class="nv-lab-inspector-row nv-lab-inspector-card" data-inspector-key="' + escapeHtml(card.key) + '">';
            html += '<span class="nv-lab-inspector-label">' + escapeHtml(card.label) + '</span>';
            html += '<span class="nv-lab-inspector-value" data-inspector-value="' + escapeHtml(card.key) + '">—</span>';
            if (card.aliases && Array.isArray(card.aliases)) {
              card.aliases.forEach(function (alias) {
                html += '<span class="nv-lab-inspector-value" data-inspector-value="' + escapeHtml(alias) + '" data-inspector-alias-for="' + escapeHtml(card.key) + '" hidden>—</span>';
              });
            }
            html += '<span class="nv-lab-inspector-interpretation" data-inspector-interpretation="' + escapeHtml(card.key) + '"></span>';
            if (card.fixed) html += '<span class="nv-lab-inspector-fixed">fixed</span>';
            html += '</div>';
          });
          html += '</div>';
          html += '</div>';
        });
      }
      html += '</div>';
      html += '<div class="nv-lab-hud-drawers" data-lab-hud-drawers>';
      if (lab.inspector && lab.inspector.sections && lab.inspector.sections.length > 3) {
        lab.inspector.sections.slice(3).forEach(function (section, dIdx) {
          var drawerId = 'v4-hud-drawer-' + dIdx;
          html += '<div class="nv-lab-hud-drawer" data-lab-hud-drawer="' + dIdx + '">';
          html += '<button class="nv-lab-hud-drawer-trigger" data-drawer-trigger="' + drawerId + '" aria-expanded="false" aria-controls="' + drawerId + '">';
          html += '<span class="nv-lab-hud-drawer-label">' + escapeHtml(section.label) + '</span>';
          html += '<svg class="nv-lab-hud-drawer-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
          html += '</button>';
          html += '<div class="nv-lab-hud-drawer-body" id="' + drawerId + '" role="region" hidden inert>';
          section.cards.forEach(function (card) {
            html += '<div class="nv-lab-inspector-row nv-lab-inspector-card" data-inspector-key="' + escapeHtml(card.key) + '">';
            html += '<span class="nv-lab-inspector-label">' + escapeHtml(card.label) + '</span>';
            html += '<span class="nv-lab-inspector-value" data-inspector-value="' + escapeHtml(card.key) + '">—</span>';
            if (card.aliases && Array.isArray(card.aliases)) {
              card.aliases.forEach(function (alias) {
                html += '<span class="nv-lab-inspector-value" data-inspector-value="' + escapeHtml(alias) + '" data-inspector-alias-for="' + escapeHtml(card.key) + '" hidden>—</span>';
              });
            }
            html += '<span class="nv-lab-inspector-interpretation" data-inspector-interpretation="' + escapeHtml(card.key) + '"></span>';
            if (card.fixed) html += '<span class="nv-lab-inspector-fixed">fixed</span>';
            html += '</div>';
          });
          html += '</div>';
          html += '</div>';
        });
      }
      html += '</div>';
      html += '</div>';
      html += '</div>';
      html += '</section>';

      // ── 3. Findings History Panel ──
      html += '<section class="nv-lab-v4-disclosure-panel nv-lab-v4-findings-history" data-lab-v4-findings-history data-xai-history data-disclosure-state="collapsed" hidden>';
      html += '<button class="nv-lab-v4-disclosure-panel__header" type="button" data-disclosure-toggle="findings" aria-expanded="false" aria-controls="v4-findings-body">';
      html += '<span class="nv-lab-v4-disclosure-panel__identity">';
      html += '<span class="nv-lab-v4-disclosure-panel__title">Findings History</span>';
      html += '<span class="nv-lab-v4-disclosure-panel__count" data-xai-finding-count>0</span>';
      html += '</span>';
      html += '<span class="nv-lab-v4-disclosure-panel__toggle" aria-hidden="true">';
      html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';
      html += '</span>';
      html += '</button>';
      html += '<div class="nv-lab-v4-disclosure-panel__body" id="v4-findings-body">';
      html += '<div class="nv-lab-v4-disclosure-panel__body-inner">';
      html += '<div class="nv-xai-timeline" data-xai-timeline role="list" aria-label="Finding history"></div>';
      html += '</div>';
      html += '</div>';
      html += '</section>';

      // ── 4. Scientific Log Panel ──
      html += '<section class="nv-lab-v4-disclosure-panel nv-lab-v4-scientific-log" data-lab-v4-scientific-log data-lab-log data-disclosure-state="collapsed" hidden>';
      html += '<button class="nv-lab-v4-disclosure-panel__header" type="button" data-disclosure-toggle="log" aria-expanded="false" aria-controls="v4-log-body">';
      html += '<span class="nv-lab-v4-disclosure-panel__identity">';
      html += '<span class="nv-lab-v4-disclosure-panel__title">Scientific Log</span>';
      html += '<span class="nv-lab-v4-disclosure-panel__count" data-lab-log-count>0</span>';
      html += '</span>';
      html += '<span class="nv-lab-v4-disclosure-panel__toggle" aria-hidden="true">';
      html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';
      html += '</span>';
      html += '</button>';
      html += '<div class="nv-lab-v4-disclosure-panel__body" id="v4-log-body">';
      html += '<div class="nv-lab-v4-disclosure-panel__body-inner">';
      html += '<div class="nv-lab-log-entries" data-lab-log-entries role="log" aria-live="polite"></div>';
      html += '</div>';
      html += '</div>';
      html += '</section>';

      html += '</div>'; // disclosure-workspace
      html += '</section>'; // analysis deck

      // ── Research Deck ──
      html += '<section class="nv-lab-v4-research-deck" data-lab-v4-research-deck aria-label="Research deck">';
      html += '<section class="nv-lab-v4-disclosure-panel nv-lab-v4-research" data-lab-v4-research data-research-panel data-research-panel-state="inactive" data-disclosure-state="collapsed">';
      html += '<div class="nv-lab-v4-disclosure-panel__header">';
      html += '<span class="nv-lab-v4-disclosure-panel__identity">';
      html += '<span class="nv-lab-v4-disclosure-panel__title">Research Session</span>';
      html += '<span class="nv-lab-v4-disclosure-panel__summary" data-research-status>Inactive</span>';
      html += '</span>';
      html += '<button class="nv-lab-v4-research__activate" type="button" data-research-activate aria-expanded="false" aria-controls="v4-research-body">Activate Research Session</button>';
      html += '</div>';
      html += '<div class="nv-lab-v4-disclosure-panel__body" id="v4-research-body" data-research-session-body hidden>';
      html += '<div class="nv-lab-v4-disclosure-panel__body-inner">';
      html += '<div class="nv-lab-research-body">';
      html += '<textarea class="nv-lab-research-textarea" data-research-hypothesis placeholder="Formulate your hypothesis..." rows="2"></textarea>';
      html += '<div class="nv-lab-research-actions">';
      html += '<button class="nv-lab-research-btn" data-research-save-session>Save</button>';
      html += '<button class="nv-lab-research-btn" data-research-view-history>History</button>';
      html += '</div>';
      html += '<div class="nv-lab-research-session-info" data-research-session-info>';
      html += '<span class="nv-lab-research-session-name" data-research-session-name>Untitled</span>';
      html += '<span class="nv-lab-research-run-count" data-research-run-count>0 runs</span>';
      html += '</div>';
      html += '</div>';
      html += '<div class="nv-lab-research-notes" data-research-notes style="display:none;">';
      html += '<h4>Notes</h4>';
      html += '<div class="nv-lab-research-notes-list" data-research-notes-list></div>';
      html += '<div class="nv-lab-research-note-input">';
      html += '<select class="nv-lab-research-note-type" data-research-note-type">';
      html += '<option value="observation">Observation</option>';
      html += '<option value="interpretation">Interpretation</option>';
      html += '<option value="unexpected">Unexpected</option>';
      html += '<option value="question">Question</option>';
      html += '<option value="conclusion">Conclusion</option>';
      html += '</select>';
      html += '<input type="text" class="nv-lab-research-note-text" data-research-note-text placeholder="Add note..." />';
      html += '<button class="nv-lab-research-note-add" data-research-note-add>+</button>';
      html += '</div>';
      html += '</div>';
      html += '<div class="nv-lab-research-bookmarks" data-research-bookmarks style="display:none;">';
      html += '<h4>Bookmarks</h4>';
      html += '<div class="nv-lab-research-bookmarks-list" data-research-bookmarks-list></div>';
      html += '</div>';
      html += '<div class="nv-lab-research-evidence" data-research-evidence style="display:none;">';
      html += '<h4>Evidence Timeline</h4>';
      html += '<div class="nv-lab-research-evidence-list" data-research-evidence-list></div>';
      html += '</div>';
      html += '<div class="nv-lab-research-conclusions" data-research-conclusions style="display:none;">';
      html += '<h4>Conclusions</h4>';
      html += '<div class="nv-lab-research-conclusion-input">';
      html += '<input type="text" class="nv-lab-research-conclusion-text" data-research-conclusion-text placeholder="Record conclusion..." />';
      html += '<button class="nv-lab-research-conclusion-add" data-research-conclusion-add>Add</button>';
      html += '</div>';
      html += '<div class="nv-lab-research-conclusions-list" data-research-conclusions-list></div>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
      html += '</section>';
      html += '</section>'; // research deck
      html += '<section class="nv-lab-v4-continuations nv-lab-drawer-layer" data-lab-v4-continuations data-lab-v4-continuation-deck aria-label="Next experiments">';
      var ecosystem = window.NeuralVerse.LabEcosystem;
      if (ecosystem) {
        var nextExps = ecosystem.getNextExperiments(lab.slug);
        var continuationSource = null;
        try { continuationSource = sessionStorage.getItem('labContinuationSource'); } catch (e) {}

        if (continuationSource && continuationSource !== lab.slug) {
          var sourceLab = window.NeuralVerse.LabRegistry ? window.NeuralVerse.LabRegistry.getBySlug(continuationSource) : null;
          if (sourceLab) {
            html += '<div class="nv-lab-continuation-context" data-lab-continuation-context>';
            html += '<span class="nv-lab-continuation-from">Continued from ' + escapeHtml(sourceLab.title) + '</span>';
            html += '</div>';
          }
        }

        if (nextExps.length > 0) {
          html += '<div class="nv-lab-continuations" data-lab-continuations>';
          html += '<h4 class="nv-lab-continuations-title">Next Experiments</h4>';
          html += '<div class="nv-lab-continuations-list">';

          for (var c = 0; c < nextExps.length; c++) {
            var next = nextExps[c];
            var targetLab = window.NeuralVerse.LabRegistry ? window.NeuralVerse.LabRegistry.getBySlug(next.target) : null;
            if (!targetLab) continue;

            var typeLabels = {
              'prerequisite': 'Prerequisite',
              'extension': 'Extend',
              'application': 'Apply',
              'comparison': 'Compare',
              'failure-mode': 'Diagnose',
              'diagnostic': 'Diagnose',
              'conceptual-neighbor': 'Related',
              'workflow-next': 'Continue'
            };

            html += '<a href="#/laboratory/' + escapeHtml(next.target) + '" ';
            html += 'class="nv-lab-continuation-card" ';
            html += 'data-continuation-target="' + escapeHtml(next.target) + '" ';
            html += 'data-continuation-type="' + escapeHtml(next.type) + '" ';
            html += 'aria-label="' + escapeHtml(typeLabels[next.type] || next.type) + ': ' + escapeHtml(targetLab.title) + '"';
            html += 'onclick="try{sessionStorage.setItem(\'labContinuationSource\',\'' + escapeHtml(lab.slug) + '\')}catch(e){}"';
            html += 'onkeydown="if(event.key===\'Enter\'){try{sessionStorage.setItem(\'labContinuationSource\',\'' + escapeHtml(lab.slug) + '\')}catch(e){}}">';
            html += '<span class="nv-lab-continuation-type">' + escapeHtml(typeLabels[next.type] || next.type) + '</span>';
            html += '<span class="nv-lab-continuation-target">' + escapeHtml(targetLab.title) + '</span>';
            html += '</a>';
          }

          html += '</div>';
          html += '</div>';
        }
      }

      html += '</section>';
      html += '</section>'; // v4 workspace

       viewer.innerHTML = html;

       var configuration = viewer.querySelector('[data-lab-v4-parameters]');
       var configurationSlot = viewer.querySelector('[data-lab-v4-configuration-slot]');
       if (configuration && configurationSlot) configurationSlot.appendChild(configuration);

      // Phase 12.4: All disclosure panels are now in their correct v4 positions.
      // No DOM manipulation needed for inspector, log, or xai-history.

      viewer.style.display = 'flex';
      viewer.style.flexDirection = 'column';

      // Phase 12.4: Reset button is wired via wireV4DisclosureToggles delegation.
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
        uiControllerRoot = null;
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
