/**
 * NV-1100-P1 — Persistence Controller
 * UI orchestration for Settings > Data & Persistence section.
 */

(function () {
  'use strict';

  const WARNING_DISMISSED_KEY = 'nv_data_persistence_warning_dismissed';

  function isWarningDismissed() {
    try {
      return localStorage.getItem(WARNING_DISMISSED_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function dismissWarning() {
    try {
      localStorage.setItem(WARNING_DISMISSED_KEY, 'true');
    } catch (e) { /* silent */ }
  }

  function formatDate(isoString) {
    if (!isoString) return 'Unknown';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  }

  function createSectionBadge(section) {
    return '<span class="nv-badge" data-variant="neutral">' +
      section.label + ' (' + section.count + ')' +
      '</span>';
  }

  function createPersistenceController(options) {
    const root = options.root || document;
    let importMode = 'merge';
    let pendingFileContent = null;
    let pendingPreview = null;

    function getContainer() {
      return root.querySelector('[data-persistence-root]');
    }

    function renderWarning(container) {
      if (isWarningDismissed()) return;

      const warningEl = document.createElement('div');
      warningEl.className = 'nv-persistence-warning';
      warningEl.setAttribute('role', 'alert');
      warningEl.innerHTML =
        '<div class="nv-persistence-warning__content">' +
          '<svg class="nv-persistence-warning__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>' +
          '</svg>' +
          '<p class="nv-persistence-warning__text">' +
            'Your NeuralVerse personalization is stored locally in this browser. Export periodic backups to avoid accidental data loss.' +
          '</p>' +
          '<button type="button" class="nv-persistence-warning__dismiss" aria-label="Dismiss warning">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16">' +
              '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
            '</svg>' +
          '</button>' +
        '</div>';

      const dismissBtn = warningEl.querySelector('.nv-persistence-warning__dismiss');
      dismissBtn.addEventListener('click', function () {
        dismissWarning();
        warningEl.remove();
      });

      const warningAnchor = document.querySelector('[data-persistence-warning]');
      if (warningAnchor) {
        warningAnchor.appendChild(warningEl);
      }
    }

    function renderCurrentData(container) {
      const sections = window.NeuralVerse.PersistenceManager.getCurrentSections();
      const dataGrid = container.querySelector('[data-current-data-grid]');
      if (!dataGrid) return;

      if (sections.length === 0) {
        dataGrid.innerHTML =
          '<div class="nv-persistence-empty">' +
            '<p class="nv-muted">No personalization data yet. Start exploring the curriculum to build your learning profile.</p>' +
          '</div>';
        return;
      }

      let html = '';
      for (const section of sections) {
        html += createSectionBadge(section);
      }
      dataGrid.innerHTML = html;
    }

    function handleExport() {
      const payload = window.NeuralVerse.PersistenceManager.exportBackup();
      if (!payload) {
        showStatus('export-status', 'Export failed: storage unavailable.', 'error');
        return;
      }
      window.NeuralVerse.PersistenceManager.triggerDownload(payload);
      showStatus('export-status', 'Backup exported successfully.', 'success');
    }

    function handleFileSelect(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        const result = window.NeuralVerse.PersistenceManager.getBackupPreview(content);

        const previewEl = getContainer()?.querySelector('[data-import-preview]');
        const confirmBtn = getContainer()?.querySelector('[data-import-confirm]');

        if (!result.valid) {
          showImportErrors(result.errors);
          pendingFileContent = null;
          pendingPreview = null;
          if (previewEl) previewEl.innerHTML = '';
          if (confirmBtn) confirmBtn.disabled = true;
          return;
        }

        pendingFileContent = content;
        pendingPreview = result.preview;

        let previewHtml =
          '<div class="nv-persistence-preview">' +
            '<div class="nv-persistence-preview__header">Backup Preview</div>' +
            '<div class="nv-persistence-preview__grid">' +
              '<div class="nv-persistence-preview__item">' +
                '<span class="nv-persistence-preview__label">Export Date</span>' +
                '<span class="nv-persistence-preview__value">' + formatDate(result.preview.exportedAt) + '</span>' +
              '</div>' +
              '<div class="nv-persistence-preview__item">' +
                '<span class="nv-persistence-preview__label">Schema Version</span>' +
                '<span class="nv-persistence-preview__value">' + result.preview.schemaVersion + '</span>' +
              '</div>' +
              '<div class="nv-persistence-preview__item">' +
                '<span class="nv-persistence-preview__label">Version</span>' +
                '<span class="nv-persistence-preview__value">' + (result.preview.neuralVerseVersion || 'Unknown') + '</span>' +
              '</div>' +
            '</div>';

        if (result.preview.sections.length > 0) {
          previewHtml += '<div class="nv-persistence-preview__sections">';
          for (const section of result.preview.sections) {
            previewHtml += createSectionBadge(section);
          }
          previewHtml += '</div>';
        } else {
          previewHtml += '<p class="nv-muted">No data sections detected in backup.</p>';
        }

        previewHtml += '</div>';

        if (previewEl) previewEl.innerHTML = previewHtml;
        if (confirmBtn) confirmBtn.disabled = false;
      };

      reader.readAsText(file);
    }

    function handleImport() {
      if (!pendingFileContent) {
        showStatus('import-status', 'No backup file selected.', 'error');
        return;
      }

      const result = window.NeuralVerse.PersistenceManager.importBackup(pendingFileContent, importMode);

      if (result.success) {
        const count = result.sections ? result.sections.length : 0;
        const modeLabel = importMode === 'replace' ? 'Replaced' : 'Merged';
        showStatus('import-status', modeLabel + ' ' + count + ' data section(s) successfully.', 'success');
        pendingFileContent = null;
        pendingPreview = null;

        const previewEl = getContainer()?.querySelector('[data-import-preview]');
        const confirmBtn = getContainer()?.querySelector('[data-import-confirm]');
        const fileInput = getContainer()?.querySelector('[data-file-input]');
        if (previewEl) previewEl.innerHTML = '';
        if (confirmBtn) confirmBtn.disabled = true;
        if (fileInput) fileInput.value = '';

        renderCurrentData(getContainer());
      } else {
        showImportErrors(result.errors);
      }
    }

    function showImportErrors(errors) {
      const statusEl = getContainer()?.querySelector('[data-status="import-status"]');
      if (!statusEl) return;
      statusEl.className = 'nv-persistence-status nv-persistence-status--error';
      statusEl.textContent = errors.join(' ');
      statusEl.style.display = 'block';
    }

    function showStatus(statusId, message, type) {
      const container = getContainer();
      if (!container) return;
      const statusEl = container.querySelector('[data-status="' + statusId + '"]');
      if (!statusEl) return;
      statusEl.className = 'nv-persistence-status nv-persistence-status--' + type;
      statusEl.textContent = message;
      statusEl.style.display = 'block';

      setTimeout(function () {
        statusEl.style.display = 'none';
      }, 5000);
    }

    function handleImportModeChange(event) {
      const value = event.target.value;
      if (value === 'merge' || value === 'replace') {
        importMode = value;
      }
    }

    let eventsBound = false;

    function bindEvents(container) {
      if (eventsBound) return;
      eventsBound = true;

      const exportBtn = container.querySelector('[data-action="export"]');
      if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
      }

      const fileInput = container.querySelector('[data-file-input]');
      if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
      }

      const importConfirmBtn = container.querySelector('[data-import-confirm]');
      if (importConfirmBtn) {
        importConfirmBtn.addEventListener('click', handleImport);
      }

      const radios = container.querySelectorAll('input[name="nv-import-mode"]');
      for (const radio of radios) {
        radio.addEventListener('change', handleImportModeChange);
      }
    }

    function init() {
      const container = getContainer();
      if (!container) return;

      renderWarning(container);
      renderCurrentData(container);
      bindEvents(container);
    }

    return { init };
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createPersistenceController = createPersistenceController;

})();
