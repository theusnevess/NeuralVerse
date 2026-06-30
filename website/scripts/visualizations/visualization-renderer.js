/**
 * NV-1100-P9B — Visualization Renderer
 * DOM/SVG rendering for all visualization primitive types.
 * Pure rendering layer — no business logic.
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
      var keys = Object.keys(attrs);
      for (var i = 0; i < keys.length; i++) {
        el.setAttribute(keys[i], attrs[keys[i]]);
      }
    }
    return el;
  }

  function renderLinePlot(container, model) {
    var width = 600;
    var height = 400;
    var padding = { top: 30, right: 30, bottom: 50, left: 60 };
    var plotW = width - padding.left - padding.right;
    var plotH = height - padding.top - padding.bottom;

    var allPoints = model.points || [];
    if (allPoints.length === 0) {
      container.innerHTML = '<p class="nv-pviz-empty">No data points.</p>';
      return;
    }

    var xs = allPoints.map(function (p) { return p.x; });
    var ys = allPoints.map(function (p) { return p.y; });
    var minX = Math.min.apply(null, xs);
    var maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys);
    var maxY = Math.max.apply(null, ys);
    var rangeX = maxX - minX || 1;
    var rangeY = maxY - minY || 1;

    var svg = createSvgElement('svg', {
      viewBox: '0 0 ' + width + ' ' + height,
      role: 'img',
      'aria-label': escapeHtml(model.title || 'Line plot'),
      style: 'width:100%;height:auto;max-height:400px'
    });

    // Grid lines
    for (var g = 0; g <= 5; g++) {
      var gy = padding.top + (plotH / 5) * g;
      svg.appendChild(createSvgElement('line', {
        x1: padding.left, y1: gy,
        x2: width - padding.right, y2: gy,
        stroke: 'rgba(138,180,248,0.08)', 'stroke-width': '0.5'
      }));
      var label = maxY - (rangeY / 5) * g;
      var text = createSvgElement('text', {
        x: padding.left - 8, y: gy + 4,
        fill: 'rgba(138,180,248,0.5)', 'font-size': '10',
        'text-anchor': 'end', 'font-family': 'monospace'
      });
      text.textContent = label.toFixed(2);
      svg.appendChild(text);
    }

    // X axis labels
    for (var xi = 0; xi <= 4; xi++) {
      var xPos = padding.left + (plotW / 4) * xi;
      var xVal = minX + (rangeX / 4) * xi;
      var xText = createSvgElement('text', {
        x: xPos, y: height - padding.bottom + 18,
        fill: 'rgba(138,180,248,0.5)', 'font-size': '10',
        'text-anchor': 'middle', 'font-family': 'monospace'
      });
      xText.textContent = xVal.toFixed(1);
      svg.appendChild(xText);
    }

    // Plot line
    var points = [];
    for (var pi = 0; pi < allPoints.length; pi++) {
      var px = padding.left + ((allPoints[pi].x - minX) / rangeX) * plotW;
      var py = padding.top + plotH - ((allPoints[pi].y - minY) / rangeY) * plotH;
      points.push(px + ',' + py);
    }

    if (points.length > 1) {
      svg.appendChild(createSvgElement('polyline', {
        points: points.join(' '),
        fill: 'none',
        stroke: '#06b6d4',
        'stroke-width': '2',
        'stroke-linejoin': 'round'
      }));
    }

    // Annotations
    if (model.annotations && model.annotations.length > 0) {
      for (var ai = 0; ai < model.annotations.length; ai++) {
        var ann = model.annotations[ai];
        var annX = padding.left + ((ann.x - minX) / rangeX) * plotW;
        var annY = padding.top + plotH - ((ann.y - minY) / rangeY) * plotH;
        svg.appendChild(createSvgElement('circle', {
          cx: annX, cy: annY, r: '5',
          fill: '#f59e0b', stroke: '#0f172a', 'stroke-width': '2'
        }));
        var annText = createSvgElement('text', {
          x: annX + 10, y: annY - 10,
          fill: '#f59e0b', 'font-size': '11',
          'font-family': 'monospace', 'font-weight': 'bold'
        });
        annText.textContent = ann.label || '';
        svg.appendChild(annText);
      }
    }

    // Axes
    svg.appendChild(createSvgElement('line', {
      x1: padding.left, y1: height - padding.bottom,
      x2: width - padding.right, y2: height - padding.bottom,
      stroke: 'rgba(138,180,248,0.2)', 'stroke-width': '1'
    }));

    // Title
    var titleText = createSvgElement('text', {
      x: width / 2, y: 18,
      fill: '#cdd6f4', 'font-size': '13',
      'text-anchor': 'middle', 'font-weight': '600',
      'font-family': 'sans-serif'
    });
    titleText.textContent = model.title || '';
    svg.appendChild(titleText);

    // Axis labels
    if (model.yLabel) {
      var yLabelEl = createSvgElement('text', {
        x: 15, y: height / 2,
        fill: 'rgba(138,180,248,0.4)', 'font-size': '10',
        'text-anchor': 'middle', 'font-family': 'monospace',
        transform: 'rotate(-90, 15, ' + (height / 2) + ')'
      });
      yLabelEl.textContent = model.yLabel;
      svg.appendChild(yLabelEl);
    }

    container.innerHTML = '';
    container.appendChild(svg);
  }

  function renderMultiLinePlot(container, model) {
    var width = 600;
    var height = 400;
    var padding = { top: 30, right: 30, bottom: 50, left: 60 };
    var plotW = width - padding.left - padding.right;
    var plotH = height - padding.top - padding.bottom;
    var colors = ['#06b6d4', '#f59e0b', '#ef4444', '#22c55e'];

    var allSeries = model.series || [];
    if (allSeries.length === 0) {
      container.innerHTML = '<p class="nv-pviz-empty">No data.</p>';
      return;
    }

    var allXs = [];
    var allYs = [];
    for (var si = 0; si < allSeries.length; si++) {
      for (var pi = 0; pi < allSeries[si].length; pi++) {
        allXs.push(allSeries[si][pi].x);
        allYs.push(allSeries[si][pi].y);
      }
    }

    var minX = Math.min.apply(null, allXs);
    var maxX = Math.max.apply(null, allXs);
    var minY = Math.min.apply(null, allYs);
    var maxY = Math.max.apply(null, allYs);
    var rangeX = maxX - minX || 1;
    var rangeY = maxY - minY || 1;

    var svg = createSvgElement('svg', {
      viewBox: '0 0 ' + width + ' ' + height,
      role: 'img',
      'aria-label': escapeHtml(model.title || 'Multi-line plot'),
      style: 'width:100%;height:auto;max-height:400px'
    });

    // Grid
    for (var g = 0; g <= 5; g++) {
      var gy = padding.top + (plotH / 5) * g;
      svg.appendChild(createSvgElement('line', {
        x1: padding.left, y1: gy,
        x2: width - padding.right, y2: gy,
        stroke: 'rgba(138,180,248,0.08)', 'stroke-width': '0.5'
      }));
      var label = maxY - (rangeY / 5) * g;
      var text = createSvgElement('text', {
        x: padding.left - 8, y: gy + 4,
        fill: 'rgba(138,180,248,0.5)', 'font-size': '10',
        'text-anchor': 'end', 'font-family': 'monospace'
      });
      text.textContent = label.toFixed(2);
      svg.appendChild(text);
    }

    // Series
    for (var si2 = 0; si2 < allSeries.length; si2++) {
      var series = allSeries[si2];
      var pts = [];
      for (var pi2 = 0; pi2 < series.length; pi2++) {
        var px = padding.left + ((series[pi2].x - minX) / rangeX) * plotW;
        var py = padding.top + plotH - ((series[pi2].y - minY) / rangeY) * plotH;
        pts.push(px + ',' + py);
      }
      if (pts.length > 1) {
        svg.appendChild(createSvgElement('polyline', {
          points: pts.join(' '),
          fill: 'none',
          stroke: colors[si2 % colors.length],
          'stroke-width': '2',
          'stroke-linejoin': 'round'
        }));
      }
    }

    // Legend
    if (model.seriesLabels && model.seriesLabels.length > 0) {
      for (var li = 0; li < model.seriesLabels.length; li++) {
        var lx = padding.left + 10 + li * 100;
        var ly = padding.top + 10;
        svg.appendChild(createSvgElement('line', {
          x1: lx, y1: ly, x2: lx + 20, y2: ly,
          stroke: colors[li % colors.length], 'stroke-width': '2'
        }));
        var legendText = createSvgElement('text', {
          x: lx + 25, y: ly + 4,
          fill: 'rgba(138,180,248,0.7)', 'font-size': '10',
          'font-family': 'monospace'
        });
        legendText.textContent = model.seriesLabels[li];
        svg.appendChild(legendText);
      }
    }

    // Axes
    svg.appendChild(createSvgElement('line', {
      x1: padding.left, y1: height - padding.bottom,
      x2: width - padding.right, y2: height - padding.bottom,
      stroke: 'rgba(138,180,248,0.2)', 'stroke-width': '1'
    }));

    // Title
    var titleText = createSvgElement('text', {
      x: width / 2, y: 18,
      fill: '#cdd6f4', 'font-size': '13',
      'text-anchor': 'middle', 'font-weight': '600',
      'font-family': 'sans-serif'
    });
    titleText.textContent = model.title || '';
    svg.appendChild(titleText);

    container.innerHTML = '';
    container.appendChild(svg);
  }

  function renderBarChart(container, model) {
    var width = 600;
    var height = 350;
    var padding = { top: 30, right: 20, bottom: 60, left: 60 };
    var plotW = width - padding.left - padding.right;
    var plotH = height - padding.top - padding.bottom;

    var bars = model.bars || [];
    if (bars.length === 0) {
      container.innerHTML = '<p class="nv-pviz-empty">No data.</p>';
      return;
    }

    var values = bars.map(function (b) { return b.value; });
    var maxVal = Math.max.apply(null, values.map(Math.abs)) || 1;

    var svg = createSvgElement('svg', {
      viewBox: '0 0 ' + width + ' ' + height,
      role: 'img',
      'aria-label': escapeHtml(model.title || 'Bar chart'),
      style: 'width:100%;height:auto;max-height:350px'
    });

    var barWidth = Math.min(plotW / (bars.length * 1.5), 50);

    for (var i = 0; i < bars.length; i++) {
      var barH = (Math.abs(bars[i].value) / maxVal) * plotH;
      var x = padding.left + (i / bars.length) * plotW + (plotW / bars.length - barWidth) / 2;
      var y = padding.top + plotH - barH;

      svg.appendChild(createSvgElement('rect', {
        x: x, y: y, width: barWidth, height: barH,
        fill: '#06b6d4', opacity: '0.7', rx: '2'
      }));

      // Value label
      var valText = createSvgElement('text', {
        x: x + barWidth / 2, y: y - 5,
        fill: 'rgba(138,180,248,0.7)', 'font-size': '9',
        'text-anchor': 'middle', 'font-family': 'monospace'
      });
      valText.textContent = bars[i].value.toFixed(3);
      svg.appendChild(valText);

      // X axis label
      var xLabel = createSvgElement('text', {
        x: x + barWidth / 2, y: height - padding.bottom + 15,
        fill: 'rgba(138,180,248,0.5)', 'font-size': '10',
        'text-anchor': 'middle', 'font-family': 'monospace',
        transform: bars[i].label.length > 4 ? 'rotate(-30, ' + (x + barWidth / 2) + ', ' + (height - padding.bottom + 15) + ')' : ''
      });
      xLabel.textContent = bars[i].label;
      svg.appendChild(xLabel);
    }

    // Grid
    for (var g = 0; g <= 4; g++) {
      var gy = padding.top + (plotH / 4) * g;
      svg.appendChild(createSvgElement('line', {
        x1: padding.left, y1: gy,
        x2: width - padding.right, y2: gy,
        stroke: 'rgba(138,180,248,0.08)', 'stroke-width': '0.5'
      }));
    }

    // Axes
    svg.appendChild(createSvgElement('line', {
      x1: padding.left, y1: height - padding.bottom,
      x2: width - padding.right, y2: height - padding.bottom,
      stroke: 'rgba(138,180,248,0.2)', 'stroke-width': '1'
    }));

    // Title
    var titleText = createSvgElement('text', {
      x: width / 2, y: 18,
      fill: '#cdd6f4', 'font-size': '13',
      'text-anchor': 'middle', 'font-weight': '600',
      'font-family': 'sans-serif'
    });
    titleText.textContent = model.title || '';
    svg.appendChild(titleText);

    container.innerHTML = '';
    container.appendChild(svg);
  }

  function renderScatterPlot(container, model) {
    var width = 600;
    var height = 400;
    var padding = { top: 30, right: 30, bottom: 50, left: 60 };
    var plotW = width - padding.left - padding.right;
    var plotH = height - padding.top - padding.bottom;

    var points = model.points || [];
    if (points.length === 0) {
      container.innerHTML = '<p class="nv-pviz-empty">No data points.</p>';
      return;
    }

    var xs = points.map(function (p) { return p.x; });
    var ys = points.map(function (p) { return p.y; });
    var minX = Math.min.apply(null, xs);
    var maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys);
    var maxY = Math.max.apply(null, ys);
    var rangeX = maxX - minX || 1;
    var rangeY = maxY - minY || 1;

    var svg = createSvgElement('svg', {
      viewBox: '0 0 ' + width + ' ' + height,
      role: 'img',
      'aria-label': escapeHtml(model.title || 'Scatter plot'),
      style: 'width:100%;height:auto;max-height:400px'
    });

    // Grid
    for (var g = 0; g <= 4; g++) {
      var gy = padding.top + (plotH / 4) * g;
      svg.appendChild(createSvgElement('line', {
        x1: padding.left, y1: gy,
        x2: width - padding.right, y2: gy,
        stroke: 'rgba(138,180,248,0.08)', 'stroke-width': '0.5'
      }));
    }

    // Points
    for (var pi = 0; pi < points.length; pi++) {
      var p = points[pi];
      var px = padding.left + ((p.x - minX) / rangeX) * plotW;
      var py = padding.top + plotH - ((p.y - minY) / rangeY) * plotH;
      var color = p.color || (model.colors && model.colors[p.cluster || 0]) || '#06b6d4';
      var radius = p.isQuery ? 7 : (p.isNeighbor ? 5 : 3.5);

      if (p.isQuery) {
        svg.appendChild(createSvgElement('circle', {
          cx: px, cy: py, r: radius,
          fill: '#f59e0b', stroke: '#0f172a', 'stroke-width': '2'
        }));
      } else if (p.isNeighbor) {
        svg.appendChild(createSvgElement('circle', {
          cx: px, cy: py, r: radius,
          fill: color, stroke: '#ffffff', 'stroke-width': '1.5'
        }));
      } else {
        svg.appendChild(createSvgElement('circle', {
          cx: px, cy: py, r: radius,
          fill: color, opacity: '0.7'
        }));
      }
    }

    // Lines (for cosine similarity)
    if (model.lines && model.lines.length > 0) {
      for (var li = 0; li < model.lines.length; li++) {
        var line = model.lines[li];
        var x1 = padding.left + ((line.from.x - minX) / rangeX) * plotW;
        var y1 = padding.top + plotH - ((line.from.y - minY) / rangeY) * plotH;
        var x2 = padding.left + ((line.to.x - minX) / rangeX) * plotW;
        var y2 = padding.top + plotH - ((line.to.y - minY) / rangeY) * plotH;
        svg.appendChild(createSvgElement('line', {
          x1: x1, y1: y1, x2: x2, y2: y2,
          stroke: line.color || '#06b6d4', 'stroke-width': '2',
          'stroke-dasharray': '4 2'
        }));
      }
    }

    // Boundary line
    if (model.boundaryLine) {
      var bLine = model.boundaryLine;
      var bx1 = minX;
      var by1 = bLine.slope * bx1 + bLine.intercept;
      var bx2 = maxX;
      var by2 = bLine.slope * bx2 + bLine.intercept;
      var lx1 = padding.left + ((bx1 - minX) / rangeX) * plotW;
      var ly1 = padding.top + plotH - ((by1 - minY) / rangeY) * plotH;
      var lx2 = padding.left + ((bx2 - minX) / rangeX) * plotW;
      var ly2 = padding.top + plotH - ((by2 - minY) / rangeY) * plotH;
      svg.appendChild(createSvgElement('line', {
        x1: lx1, y1: ly1, x2: lx2, y2: ly2,
        stroke: '#ef4444', 'stroke-width': '2',
        'stroke-dasharray': '6 3', opacity: '0.7'
      }));
    }

    // Annotations
    if (model.annotations && model.annotations.length > 0) {
      for (var ai = 0; ai < model.annotations.length; ai++) {
        var ann = model.annotations[ai];
        var annX = padding.left + ((ann.x - minX) / rangeX) * plotW;
        var annY = padding.top + plotH - ((ann.y - minY) / rangeY) * plotH;
        svg.appendChild(createSvgElement('circle', {
          cx: annX, cy: annY, r: '5',
          fill: '#f59e0b', stroke: '#0f172a', 'stroke-width': '2'
        }));
        var annText = createSvgElement('text', {
          x: annX + 10, y: annY - 10,
          fill: '#f59e0b', 'font-size': '11',
          'font-family': 'monospace', 'font-weight': 'bold'
        });
        annText.textContent = ann.label || '';
        svg.appendChild(annText);
      }
    }

    // Axes
    svg.appendChild(createSvgElement('line', {
      x1: padding.left, y1: height - padding.bottom,
      x2: width - padding.right, y2: height - padding.bottom,
      stroke: 'rgba(138,180,248,0.2)', 'stroke-width': '1'
    }));

    // Title
    var titleText = createSvgElement('text', {
      x: width / 2, y: 18,
      fill: '#cdd6f4', 'font-size': '13',
      'text-anchor': 'middle', 'font-weight': '600',
      'font-family': 'sans-serif'
    });
    titleText.textContent = model.title || '';
    svg.appendChild(titleText);

    // Axis labels
    if (model.xLabel) {
      var xLabelText = createSvgElement('text', {
        x: width / 2, y: height - 8,
        fill: 'rgba(138,180,248,0.4)', 'font-size': '10',
        'text-anchor': 'middle', 'font-family': 'monospace'
      });
      xLabelText.textContent = model.xLabel;
      svg.appendChild(xLabelText);
    }

    if (model.yLabel) {
      var yLabelText = createSvgElement('text', {
        x: 15, y: height / 2,
        fill: 'rgba(138,180,248,0.4)', 'font-size': '10',
        'text-anchor': 'middle', 'font-family': 'monospace',
        transform: 'rotate(-90, 15, ' + (height / 2) + ')'
      });
      yLabelText.textContent = model.yLabel;
      svg.appendChild(yLabelText);
    }

    container.innerHTML = '';
    container.appendChild(svg);
  }

  function renderHeatmap(container, model) {
    var matrices = model.matrices || [];
    if (matrices.length === 0) {
      container.innerHTML = '<p class="nv-pviz-empty">No data.</p>';
      return;
    }

    var html = '<div class="nv-pviz-heatmap-wrapper">';

    if (model.title) {
      html += '<h4 class="nv-pviz-chart-title">' + escapeHtml(model.title) + '</h4>';
    }

    for (var mi = 0; mi < matrices.length; mi++) {
      var matrix = matrices[mi];
      if (!matrix || !matrix.length) continue;

      if (model.matrixLabels && model.matrixLabels[mi]) {
        html += '<h5 class="nv-pviz-heatmap-subtitle">' + escapeHtml(model.matrixLabels[mi]) + '</h5>';
      }

      var rows = matrix.length;
      var cols = matrix[0].length;
      var flat = [];
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          flat.push(matrix[r][c]);
        }
      }
      var minVal = Math.min.apply(null, flat);
      var maxVal = Math.max.apply(null, flat);
      var range = maxVal - minVal || 1;

      html += '<div class="nv-pviz-heatmap-grid" style="grid-template-columns: auto repeat(' + cols + ', 1fr);">';

      // Header row
      html += '<div class="nv-pviz-heatmap-cell nv-pviz-heatmap-header"></div>';
      for (var ch = 0; ch < cols; ch++) {
        var colLabel = (model.colLabels && model.colLabels[ch]) || String(ch);
        html += '<div class="nv-pviz-heatmap-cell nv-pviz-heatmap-header">' + escapeHtml(colLabel) + '</div>';
      }

      // Data rows
      for (var ri = 0; ri < rows; ri++) {
        var rowLabel = (model.rowLabels && model.rowLabels[ri]) || String(ri);
        html += '<div class="nv-pviz-heatmap-cell nv-pviz-heatmap-header">' + escapeHtml(rowLabel) + '</div>';
        for (var ci = 0; ci < cols; ci++) {
          var val = matrix[ri][ci];
          var norm = (val - minVal) / range;
          var alpha = 0.15 + norm * 0.85;
          html += '<div class="nv-pviz-heatmap-cell" ';
          html += 'style="background-color: rgba(6,182,212,' + alpha + ');" ';
          html += 'title="' + escapeHtml((model.rowLabels && model.rowLabels[ri] || ri) + ' → ' + (model.colLabels && model.colLabels[ci] || ci) + ': ' + val.toFixed(4)) + '">';
          html += '<span>' + val.toFixed(3) + '</span>';
          html += '</div>';
        }
      }

      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function renderConfusionMatrix(container, model) {
    var html = '<div class="nv-pviz-confusion-wrapper">';

    if (model.title) {
      html += '<h4 class="nv-pviz-chart-title">' + escapeHtml(model.title) + '</h4>';
    }

    var matrix = model.matrix || [[0, 0], [0, 0]];
    var maxVal = Math.max.apply(null, matrix.flat());

    html += '<div class="nv-pviz-confusion-grid">';

    // Headers
    html += '<div class="nv-pviz-confusion-cell nv-pviz-confusion-corner"></div>';
    for (var ch = 0; ch < (model.colLabels || []).length; ch++) {
      html += '<div class="nv-pviz-confusion-cell nv-pviz-confusion-col-header">' + escapeHtml(model.colLabels[ch]) + '</div>';
    }

    for (var ri = 0; ri < matrix.length; ri++) {
      var rowLabel = (model.rowLabels && model.rowLabels[ri]) || String(ri);
      html += '<div class="nv-pviz-confusion-cell nv-pviz-confusion-row-header">' + escapeHtml(rowLabel) + '</div>';
      for (var ci = 0; ci < matrix[ri].length; ci++) {
        var val = matrix[ri][ci];
        var norm = maxVal > 0 ? val / maxVal : 0;
        var isCorrect = ri === ci;
        html += '<div class="nv-pviz-confusion-cell nv-pviz-confusion-value" ';
        html += 'style="background-color: ' + (isCorrect ? 'rgba(6,182,212,' + (0.2 + norm * 0.6) + ')' : 'rgba(239,68,68,' + (0.1 + norm * 0.5) + ')') + ';">';
        html += '<span class="nv-pviz-confusion-number">' + val + '</span>';
        html += '</div>';
      }
    }

    html += '</div>';

    // Metrics
    if (model.metrics) {
      var m = model.metrics;
      html += '<div class="nv-pviz-metrics">';
      html += '<div class="nv-pviz-metric-item"><span class="nv-pviz-metric-label">Accuracy:</span><span class="nv-pviz-metric-value">' + (m.accuracy * 100).toFixed(2) + '%</span></div>';
      html += '<div class="nv-pviz-metric-item"><span class="nv-pviz-metric-label">Precision:</span><span class="nv-pviz-metric-value">' + (m.precision * 100).toFixed(2) + '%</span></div>';
      html += '<div class="nv-pviz-metric-item"><span class="nv-pviz-metric-label">Recall:</span><span class="nv-pviz-metric-value">' + (m.recall * 100).toFixed(2) + '%</span></div>';
      html += '<div class="nv-pviz-metric-item"><span class="nv-pviz-metric-label">F1 Score:</span><span class="nv-pviz-metric-value">' + (m.f1Score * 100).toFixed(2) + '%</span></div>';
      html += '<div class="nv-pviz-metric-item"><span class="nv-pviz-metric-label">Total:</span><span class="nv-pviz-metric-value">' + m.total + '</span></div>';
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function renderVisualization(container, model) {
    if (!container || !model) return;

    switch (model.type) {
      case 'line-plot':
        renderLinePlot(container, model);
        break;
      case 'multi-line':
        renderMultiLinePlot(container, model);
        break;
      case 'bar-chart':
        renderBarChart(container, model);
        break;
      case 'scatter-plot':
        renderScatterPlot(container, model);
        break;
      case 'heatmap':
        renderHeatmap(container, model);
        break;
      case 'confusion-matrix':
        renderConfusionMatrix(container, model);
        break;
      case 'matrix':
        renderLinePlot(container, model);
        break;
      default:
        renderLinePlot(container, model);
        break;
    }
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.VizRenderer = {
    render: renderVisualization,
    renderLinePlot: renderLinePlot,
    renderMultiLinePlot: renderMultiLinePlot,
    renderBarChart: renderBarChart,
    renderScatterPlot: renderScatterPlot,
    renderHeatmap: renderHeatmap,
    renderConfusionMatrix: renderConfusionMatrix
  };
})();
