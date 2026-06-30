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

      var html = '';
      html += '<div class="nv-lab-viewer-header">';
      html += '<a href="#/laboratory" class="nv-lab-back-btn" aria-label="Back to laboratories">';
      html += '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';
      html += 'Back';
      html += '</a>';
      html += '<h2 data-lab-title>' + escapeHtml(lab.title) + '</h2>';
      html += '<span class="nv-lab-header-summary" data-lab-summary>' + escapeHtml(lab.summary) + '</span>';
      html += '<div class="nv-lab-header-actions">';
      html += '<button class="nv-lab-reset-btn" data-lab-reset aria-label="Reset parameters to defaults">';
      html += '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.3 2.6L3 12"/><path d="M3 3v5h5"/></svg>';
      html += 'Reset';
      html += '</button>';
      html += '</div>';
      html += '</div>';
      html += '<div class="nv-lab-parameter-panel" data-lab-parameters>';
      html += '<h3>Parameters</h3>';
      html += '</div>';
      html += '<div class="nv-lab-visualization-panel">';
      html += '<div class="nv-lab-metadata" data-lab-metadata></div>';
      html += '<div data-lab-visualization></div>';
      html += '</div>';

      viewer.innerHTML = html;
      viewer.style.display = 'grid';

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
