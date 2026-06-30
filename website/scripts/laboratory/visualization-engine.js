/**
 * NV-1100-P7 — Visualization Engine
 * Renders structured execution results as charts, tables, and diagrams.
 * Pure DOM-based rendering — no external charting libraries.
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

  function createSvgElement(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        el.setAttribute(key, attrs[key]);
      });
    }
    return el;
  }

  function renderLineChart(container, data, config) {
    var width = config.width || 400;
    var height = config.height || 250;
    var padding = { top: 20, right: 20, bottom: 30, left: 45 };
    var plotW = width - padding.left - padding.right;
    var plotH = height - padding.top - padding.bottom;

    var series = Array.isArray(data[0]) ? data : [data];
    var allValues = series.flat();
    var minVal = Math.min.apply(null, allValues);
    var maxVal = Math.max.apply(null, allValues);
    var range = maxVal - minVal || 1;

    var svg = createSvgElement('svg', {
      viewBox: '0 0 ' + width + ' ' + height,
      role: 'img',
      'aria-label': (config.title || 'Line chart'),
      style: 'width:100%;height:auto;max-height:350px'
    });

    // Grid lines
    for (var g = 0; g <= 4; g++) {
      var gy = padding.top + (plotH / 4) * g;
      svg.appendChild(createSvgElement('line', {
        x1: padding.left, y1: gy,
        x2: width - padding.right, y2: gy,
        stroke: 'rgba(138,180,248,0.1)', 'stroke-width': '0.5'
      }));
      var label = maxVal - (range / 4) * g;
      var text = createSvgElement('text', {
        x: padding.left - 5, y: gy + 4,
        fill: 'rgba(138,180,248,0.5)', 'font-size': '10',
        'text-anchor': 'end', 'font-family': 'monospace'
      });
      text.textContent = label.toFixed(1);
      svg.appendChild(text);
    }

    var colors = ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'];

    series.forEach(function (s, si) {
      var points = [];
      s.forEach(function (val, i) {
        var x = padding.left + (i / Math.max(s.length - 1, 1)) * plotW;
        var y = padding.top + plotH - ((val - minVal) / range) * plotH;
        points.push(x + ',' + y);
      });

      if (points.length > 1) {
        svg.appendChild(createSvgElement('polyline', {
          points: points.join(' '),
          fill: 'none',
          stroke: colors[si % colors.length],
          'stroke-width': '2',
          'stroke-linejoin': 'round'
        }));
      }

      s.forEach(function (val, i) {
        var x = padding.left + (i / Math.max(s.length - 1, 1)) * plotW;
        var y = padding.top + plotH - ((val - minVal) / range) * plotH;
        svg.appendChild(createSvgElement('circle', {
          cx: x, cy: y, r: '3',
          fill: colors[si % colors.length],
          'stroke': '#0f172a', 'stroke-width': '1'
        }));
      });
    });

    // X axis line
    svg.appendChild(createSvgElement('line', {
      x1: padding.left, y1: height - padding.bottom,
      x2: width - padding.right, y2: height - padding.bottom,
      stroke: 'rgba(138,180,248,0.2)', 'stroke-width': '1'
    }));

    container.innerHTML = '';
    if (config.title) {
      var title = document.createElement('h4');
      title.className = 'nv-lab-viz-title';
      title.textContent = config.title;
      container.appendChild(title);
    }
    container.appendChild(svg);

    if (config.description) {
      var desc = document.createElement('p');
      desc.className = 'nv-lab-viz-description';
      desc.textContent = config.description;
      container.appendChild(desc);
    }
  }

  function renderScatterPlot(container, data, config) {
    var width = config.width || 400;
    var height = config.height || 250;
    var padding = { top: 20, right: 20, bottom: 30, left: 45 };
    var plotW = width - padding.left - padding.right;
    var plotH = height - padding.top - padding.bottom;

    var xs = data.map(function (p) { return p[0]; });
    var ys = data.map(function (p) { return p[1]; });
    var minX = Math.min.apply(null, xs);
    var maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys);
    var maxY = Math.max.apply(null, ys);
    var rangeX = maxX - minX || 1;
    var rangeY = maxY - minY || 1;

    var svg = createSvgElement('svg', {
      viewBox: '0 0 ' + width + ' ' + height,
      role: 'img',
      'aria-label': (config.title || 'Scatter plot'),
      style: 'width:100%;height:auto;max-height:350px'
    });

    data.forEach(function (point) {
      var x = padding.left + ((point[0] - minX) / rangeX) * plotW;
      var y = padding.top + plotH - ((point[1] - minY) / rangeY) * plotH;
      svg.appendChild(createSvgElement('circle', {
        cx: x, cy: y, r: '3.5',
        fill: '#06b6d4', opacity: '0.8'
      }));
    });

    if (config.line) {
      var sorted = data.slice().sort(function (a, b) { return a[0] - b[0]; });
      var pts = sorted.map(function (p) {
        var x = padding.left + ((p[0] - minX) / rangeX) * plotW;
        var y = padding.top + plotH - ((p[1] - minY) / rangeY) * plotH;
        return x + ',' + y;
      });
      svg.appendChild(createSvgElement('polyline', {
        points: pts.join(' '),
        fill: 'none',
        stroke: 'rgba(6,182,212,0.4)',
        'stroke-width': '1.5',
        'stroke-dasharray': '4 2'
      }));
    }

    // Axes
    svg.appendChild(createSvgElement('line', {
      x1: padding.left, y1: height - padding.bottom,
      x2: width - padding.right, y2: height - padding.bottom,
      stroke: 'rgba(138,180,248,0.2)', 'stroke-width': '1'
    }));

    container.innerHTML = '';
    if (config.title) {
      var title = document.createElement('h4');
      title.className = 'nv-lab-viz-title';
      title.textContent = config.title;
      container.appendChild(title);
    }
    container.appendChild(svg);
  }

  function renderBarChart(container, data, config) {
    var width = config.width || 400;
    var height = config.height || 250;
    var padding = { top: 20, right: 20, bottom: 40, left: 45 };
    var plotW = width - padding.left - padding.right;
    var plotH = height - padding.top - padding.bottom;

    var labels = config.labels || data.map(function (_, i) { return String(i); });
    var values = data.map(function (d) { return typeof d === 'number' ? d : d.value; });
    var maxVal = Math.max.apply(null, values.map(Math.abs)) || 1;

    var svg = createSvgElement('svg', {
      viewBox: '0 0 ' + width + ' ' + height,
      role: 'img',
      'aria-label': (config.title || 'Bar chart'),
      style: 'width:100%;height:auto;max-height:350px'
    });

    var barWidth = plotW / (values.length * 1.5);
    values.forEach(function (val, i) {
      var barH = (Math.abs(val) / maxVal) * plotH;
      var x = padding.left + (i / values.length) * plotW + barWidth * 0.25;
      var y = padding.top + plotH - barH;
      svg.appendChild(createSvgElement('rect', {
        x: x, y: y, width: barWidth, height: barH,
        fill: '#06b6d4', opacity: '0.7', rx: '2'
      }));

      var text = createSvgElement('text', {
        x: x + barWidth / 2, y: height - padding.bottom + 15,
        fill: 'rgba(138,180,248,0.5)', 'font-size': '9',
        'text-anchor': 'middle', 'font-family': 'monospace'
      });
      text.textContent = labels[i] || '';
      svg.appendChild(text);
    });

    container.innerHTML = '';
    if (config.title) {
      var title = document.createElement('h4');
      title.className = 'nv-lab-viz-title';
      title.textContent = config.title;
      container.appendChild(title);
    }
    container.appendChild(svg);
  }

  function renderHeatmap(container, matrix, config) {
    if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) return;

    var rows = matrix.length;
    var cols = matrix[0].length;
    var flat = matrix.flat();
    var minVal = Math.min.apply(null, flat);
    var maxVal = Math.max.apply(null, flat);
    var range = maxVal - minVal || 1;

    var table = document.createElement('div');
    table.className = 'nv-lab-heatmap';
    table.setAttribute('role', 'img');
    table.setAttribute('aria-label', config.title || 'Heatmap');

    if (config.title) {
      var title = document.createElement('h4');
      title.className = 'nv-lab-viz-title';
      title.textContent = config.title;
      table.appendChild(title);
    }

    var grid = document.createElement('div');
    grid.className = 'nv-lab-heatmap-grid';
    grid.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var val = matrix[r][c];
        var norm = (val - minVal) / range;
        var cell = document.createElement('div');
        cell.className = 'nv-lab-heatmap-cell';
        var alpha = 0.15 + norm * 0.85;
        cell.style.backgroundColor = 'rgba(6,182,212,' + alpha + ')';
        cell.textContent = typeof val === 'number' ? val.toFixed(2) : String(val);
        cell.title = '(' + r + ',' + c + ') = ' + val;
        grid.appendChild(cell);
      }
    }

    table.appendChild(grid);
    container.innerHTML = '';
    container.appendChild(table);
  }

  function renderMatrix(container, matrix, config) {
    var table = document.createElement('div');
    table.className = 'nv-lab-matrix-display';

    if (config.title) {
      var title = document.createElement('h4');
      title.className = 'nv-lab-viz-title';
      title.textContent = config.title;
      table.appendChild(title);
    }

    if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
      container.innerHTML = '';
      container.appendChild(table);
      return;
    }

    var tbl = document.createElement('table');
    tbl.className = 'nv-lab-table';
    tbl.setAttribute('role', 'table');
    tbl.setAttribute('aria-label', config.title || 'Matrix');

    matrix.forEach(function (row, ri) {
      var tr = document.createElement('tr');
      row.forEach(function (cell) {
        var td = document.createElement('td');
        td.textContent = typeof cell === 'number' ? cell.toFixed(3) : String(cell);
        td.setAttribute('role', 'cell');
        tr.appendChild(td);
      });
      tbl.appendChild(tr);
    });

    table.appendChild(tbl);
    container.innerHTML = '';
    container.appendChild(table);
  }

  function renderTable(container, headers, rows, config) {
    var wrapper = document.createElement('div');
    wrapper.className = 'nv-lab-table-wrapper';

    if (config && config.title) {
      var title = document.createElement('h4');
      title.className = 'nv-lab-viz-title';
      title.textContent = config.title;
      wrapper.appendChild(title);
    }

    var tbl = document.createElement('table');
    tbl.className = 'nv-lab-table';
    tbl.setAttribute('role', 'table');

    if (headers && headers.length) {
      var thead = document.createElement('thead');
      var headRow = document.createElement('tr');
      headers.forEach(function (h) {
        var th = document.createElement('th');
        th.textContent = h;
        th.setAttribute('scope', 'col');
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      tbl.appendChild(thead);
    }

    if (rows && rows.length) {
      var tbody = document.createElement('tbody');
      rows.forEach(function (row) {
        var tr = document.createElement('tr');
        row.forEach(function (cell) {
          var td = document.createElement('td');
          td.textContent = typeof cell === 'number' ? cell.toFixed(4) : String(cell);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      tbl.appendChild(tbody);
    }

    wrapper.appendChild(tbl);
    container.innerHTML = '';
    container.appendChild(wrapper);
  }

  function renderNumericSummary(container, data, config) {
    var wrapper = document.createElement('div');
    wrapper.className = 'nv-lab-numeric-summary';

    if (config && config.title) {
      var title = document.createElement('h4');
      title.className = 'nv-lab-viz-title';
      title.textContent = config.title;
      wrapper.appendChild(title);
    }

    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      var grid = document.createElement('div');
      grid.className = 'nv-lab-summary-grid';
      Object.keys(data).forEach(function (key) {
        var item = document.createElement('div');
        item.className = 'nv-lab-summary-item';
        var labelEl = document.createElement('span');
        labelEl.className = 'nv-lab-summary-label';
        labelEl.textContent = key;
        var valueEl = document.createElement('span');
        valueEl.className = 'nv-lab-summary-value';
        var val = data[key];
        valueEl.textContent = typeof val === 'number' ? val.toFixed(4) : String(val);
        item.appendChild(labelEl);
        item.appendChild(valueEl);
        grid.appendChild(item);
      });
      wrapper.appendChild(grid);
    } else if (Array.isArray(data)) {
      var flatGrid = document.createElement('div');
      flatGrid.className = 'nv-lab-summary-grid';
      data.forEach(function (val, i) {
        var item = document.createElement('div');
        item.className = 'nv-lab-summary-item';
        var labelEl = document.createElement('span');
        labelEl.className = 'nv-lab-summary-label';
        labelEl.textContent = '[' + i + ']';
        var valueEl = document.createElement('span');
        valueEl.className = 'nv-lab-summary-value';
        valueEl.textContent = typeof val === 'number' ? val.toFixed(4) : String(val);
        item.appendChild(labelEl);
        item.appendChild(valueEl);
        flatGrid.appendChild(item);
      });
      wrapper.appendChild(flatGrid);
    }

    container.innerHTML = '';
    container.appendChild(wrapper);
  }

  function extractVisualizationData(result, vizType) {
    if (!result) return result;
    if (Array.isArray(result)) return result;

    // Extract data from structured result objects
    switch (vizType) {
      case 'scatter-plot':
        return result.dataPoints || result.points || result.projectedPoints || result.scatterData || Object.values(result)[0];
      case 'line-chart':
        return result.lossHistory || result.sigmoidCurve || result.prCurve || result.lineData || Object.values(result)[0];
      case 'bar-chart':
        return result.bars || result.barData || Object.values(result)[0];
      case 'heatmap':
        return result.attentionMatrix || result.similarityMatrix || result.heatmap || Object.values(result)[0];
      case 'matrix':
      case 'confusion-matrix':
        return result.confusionMatrix || result.matrix || Object.values(result)[0];
      default:
        return result;
    }
  }

  function renderVisualization(container, vizType, result, config) {
    if (!container || !result) return;

    config = config || {};

    try {
      var data = extractVisualizationData(result, vizType);

      switch (vizType) {
        case 'line-chart':
          renderLineChart(container, data, config);
          break;
        case 'scatter-plot':
          if (Array.isArray(data)) {
            renderScatterPlot(container, data, config);
          } else {
            renderNumericSummary(container, result, config);
          }
          break;
        case 'bar-chart':
          if (Array.isArray(data)) {
            renderBarChart(container, data, config);
          } else {
            renderNumericSummary(container, result, config);
          }
          break;
        case 'heatmap':
          renderHeatmap(container, data, config);
          break;
        case 'matrix':
        case 'confusion-matrix':
          renderMatrix(container, data, config);
          break;
        case 'table':
          renderTable(container, config.headers || [], data, config);
          break;
        case 'svg-diagram':
          renderNumericSummary(container, result, config);
          break;
        case 'numeric-summary':
          renderNumericSummary(container, result, config);
          break;
        default:
          renderNumericSummary(container, result, config);
      }
    } catch (e) {
      renderNumericSummary(container, result, config);
    }
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.VisualizationEngine = {
    render: renderVisualization,
    renderLineChart: renderLineChart,
    renderScatterPlot: renderScatterPlot,
    renderBarChart: renderBarChart,
    renderHeatmap: renderHeatmap,
    renderMatrix: renderMatrix,
    renderTable: renderTable,
    renderNumericSummary: renderNumericSummary
  };

})();
