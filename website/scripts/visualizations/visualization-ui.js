/**
 * NV-1100-P9B — Visualization UI
 * Renders parameter controls, layout, metrics, and UI chrome for parametric visualizations.
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

  function renderParameterControls(parameterSchema, params, onChange) {
    var html = '';
    if (!Array.isArray(parameterSchema) || parameterSchema.length === 0) {
      return '<div class="nv-pviz-no-params"><p>No configurable parameters.</p></div>';
    }

    for (var i = 0; i < parameterSchema.length; i++) {
      var schema = parameterSchema[i];
      var key = schema.id;
      var value = params[key] !== undefined ? params[key] : schema.defaultValue;

      html += '<div class="nv-pviz-param-group" data-param-id="' + escapeHtml(key) + '">';
      html += '<label class="nv-pviz-param-label" for="pviz-param-' + escapeHtml(key) + '">';
      html += escapeHtml(schema.label);
      html += '</label>';

      if (schema.description) {
        html += '<span class="nv-pviz-param-desc">' + escapeHtml(schema.description) + '</span>';
      }

      switch (schema.type) {
        case 'number':
        case 'integer': {
          var step = schema.type === 'integer' ? 1 : (schema.step || 0.01);
          html += '<div class="nv-pviz-slider-row">';
          html += '<input type="range" id="pviz-param-' + escapeHtml(key) + '" ';
          html += 'class="nv-pviz-slider" ';
          html += 'min="' + schema.min + '" max="' + schema.max + '" step="' + step + '" ';
          html += 'value="' + value + '" ';
          html += 'aria-label="' + escapeHtml(schema.label) + '" ';
          html += 'data-param-key="' + escapeHtml(key) + '" ';
          html += 'data-param-type="' + escapeHtml(schema.type) + '">';
          html += '<span class="nv-pviz-slider-value" id="pviz-val-' + escapeHtml(key) + '">' + value + '</span>';
          html += '</div>';
          break;
        }

        case 'boolean': {
          html += '<label class="nv-pviz-toggle">';
          html += '<input type="checkbox" id="pviz-param-' + escapeHtml(key) + '" ';
          html += 'class="nv-pviz-checkbox" ';
          html += (value ? 'checked ' : '');
          html += 'aria-label="' + escapeHtml(schema.label) + '" ';
          html += 'data-param-key="' + escapeHtml(key) + '" ';
          html += 'data-param-type="boolean">';
          html += '<span class="nv-pviz-toggle-slider"></span>';
          html += '</label>';
          break;
        }

        case 'enum': {
          html += '<select id="pviz-param-' + escapeHtml(key) + '" ';
          html += 'class="nv-pviz-select" ';
          html += 'aria-label="' + escapeHtml(schema.label) + '" ';
          html += 'data-param-key="' + escapeHtml(key) + '" ';
          html += 'data-param-type="enum">';
          var options = schema.options || [];
          for (var oi = 0; oi < options.length; oi++) {
            html += '<option value="' + escapeHtml(options[oi]) + '" ';
            html += (options[oi] === value ? 'selected' : '');
            html += '>' + escapeHtml(options[oi]) + '</option>';
          }
          html += '</select>';
          break;
        }
      }

      html += '</div>';
    }

    return html;
  }

  function renderMetrics(metrics) {
    if (!metrics || typeof metrics !== 'object') return '';

    var html = '<div class="nv-pviz-metrics">';
    var keys = Object.keys(metrics);
    for (var i = 0; i < keys.length; i++) {
      var val = metrics[keys[i]];
      var display = typeof val === 'number' ? val.toFixed(4) : String(val);
      html += '<div class="nv-pviz-metric-item">';
      html += '<span class="nv-pviz-metric-label">' + escapeHtml(keys[i]) + ':</span>';
      html += '<span class="nv-pviz-metric-value">' + escapeHtml(display) + '</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderVisualizationHeader(definition, isFavorite) {
    if (!definition) return '';

    var html = '<div class="nv-pviz-header">';
    html += '<div class="nv-pviz-header-info">';
    html += '<h2 class="nv-pviz-title">' + escapeHtml(definition.title) + '</h2>';
    html += '<span class="nv-pviz-badge">' + escapeHtml(definition.category) + '</span>';
    if (definition.version) {
      html += '<span class="nv-pviz-version">v' + escapeHtml(definition.version) + '</span>';
    }
    html += '</div>';
    html += '<div class="nv-pviz-header-actions">';
    html += '<button class="nv-pviz-btn nv-pviz-btn-favorite" data-action="toggle-favorite" aria-label="' + (isFavorite ? 'Remove from favorites' : 'Add to favorites') + '" data-viz-id="' + escapeHtml(definition.id) + '">';
    html += isFavorite ? '&#9733;' : '&#9734;';
    html += '</button>';
    html += '<button class="nv-pviz-btn nv-pviz-btn-reset" data-action="reset-params" aria-label="Reset parameters to defaults">Reset</button>';
    html += '<button class="nv-pviz-btn nv-pviz-btn-copy" data-action="copy-params" aria-label="Copy current parameter values">Copy</button>';
    html += '</div>';
    html += '</div>';

    if (definition.summary) {
      html += '<p class="nv-pviz-summary">' + escapeHtml(definition.summary) + '</p>';
    }

    return html;
  }

  function renderVisualizationList(definitions) {
    if (!Array.isArray(definitions) || definitions.length === 0) {
      return '<div class="nv-pviz-empty-list"><p>No visualizations available.</p></div>';
    }

    var html = '<div class="nv-pviz-grid" role="region" aria-label="Visualization gallery">';

    for (var i = 0; i < definitions.length; i++) {
      var def = definitions[i];
      html += '<a href="#/visualizations/' + escapeHtml(def.slug) + '" class="nv-pviz-card" data-viz-id="' + escapeHtml(def.id) + '">';
      html += '<div class="nv-pviz-card-header">';
      html += '<span class="nv-pviz-card-category">' + escapeHtml(def.category) + '</span>';
      html += '<span class="nv-pviz-card-version">v' + escapeHtml(def.version || '1.0.0') + '</span>';
      html += '</div>';
      html += '<h3 class="nv-pviz-card-title">' + escapeHtml(def.title) + '</h3>';
      html += '<p class="nv-pviz-card-summary">' + escapeHtml(def.summary || '') + '</p>';
      html += '<div class="nv-pviz-card-meta">';
      html += '<span class="nv-pviz-card-params">' + (def.parameterSchema || []).length + ' params</span>';
      if (def.concepts && def.concepts.length > 0) {
        html += '<span class="nv-pviz-card-concepts">' + def.concepts.length + ' concepts</span>';
      }
      html += '</div>';
      html += '</a>';
    }

    html += '</div>';
    return html;
  }

  function renderBreadcrumb(vizId, title) {
    var html = '<nav class="nv-pviz-breadcrumb" aria-label="Visualization navigation">';
    html += '<a href="#/visualizations" class="nv-pviz-breadcrumb-link">Visualizations</a>';
    html += '<span class="nv-pviz-breadcrumb-sep" aria-hidden="true">/</span>';
    html += '<span class="nv-pviz-breadcrumb-current" aria-current="page">' + escapeHtml(title || vizId) + '</span>';
    html += '</nav>';
    return html;
  }

  function renderCategoryFilter(categories) {
    if (!Array.isArray(categories) || categories.length === 0) return '';

    var html = '<div class="nv-pviz-category-filter" role="group" aria-label="Filter by category">';
    html += '<button class="nv-pviz-filter-btn nv-pviz-filter-btn--active" data-category="all">All</button>';
    for (var i = 0; i < categories.length; i++) {
      html += '<button class="nv-pviz-filter-btn" data-category="' + escapeHtml(categories[i]) + '">' + escapeHtml(categories[i]) + '</button>';
    }
    html += '</div>';
    return html;
  }

  function renderStatusRegion() {
    return '<div class="nv-pviz-status" role="status" aria-live="polite" data-viz-status></div>';
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.VizUI = {
    renderParameterControls: renderParameterControls,
    renderMetrics: renderMetrics,
    renderVisualizationHeader: renderVisualizationHeader,
    renderVisualizationList: renderVisualizationList,
    renderBreadcrumb: renderBreadcrumb,
    renderCategoryFilter: renderCategoryFilter,
    renderStatusRegion: renderStatusRegion
  };
})();
