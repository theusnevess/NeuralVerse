/**
 * NV-800 — Phase 2.5: Scientific Thumbnail Language
 * Canonical thumbnail grammar for every visualization.
 * Each thumbnail is an iconic scientific illustration, not a miniaturized screenshot.
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

  function capitalizeCategory(cat) {
    if (!cat) return '';
    return cat.split('-').map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  // --- Deterministic math utilities ---

  function deterministicRandom(seed) {
    var t = (seed + 0x6D2B79F5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function generateLinspace(min, max, steps) {
    var result = [];
    if (steps <= 1) { result.push(min); return result; }
    var step = (max - min) / (steps - 1);
    for (var i = 0; i < steps; i++) { result.push(min + step * i); }
    return result;
  }

  function generateScatterPoints(count, cx, cy, spread, seed) {
    var points = [];
    for (var i = 0; i < count; i++) {
      var s1 = deterministicRandom(seed + i * 2);
      var s2 = deterministicRandom(seed + i * 2 + 1);
      points.push({
        x: cx + (s1 - 0.5) * 2 * spread,
        y: cy + (s2 - 0.5) * 2 * spread
      });
    }
    return points;
  }

  // --- Canonical Thumbnail Grammar ---

  // Dimensions — generous negative space
  var THUMB_W = 280;
  var THUMB_H = 160;
  // Large margins for whitespace — the mathematical object is the hero
  var M = { top: 24, right: 24, bottom: 24, left: 24 };

  function plotW() { return THUMB_W - M.left - M.right; }
  function plotH() { return THUMB_H - M.top - M.bottom; }

  // Scientific palette — no decorative colors
  var C = {
    accent: '#06b6d4',    // primary curve
    secondary: '#f59e0b', // secondary curve
    danger: '#ef4444',    // boundary / warning
    muted: 'rgba(138,180,248,0.08)', // background grid
    faint: 'rgba(138,180,248,0.03)', // very faint reference
    stroke: 1.5,          // consistent stroke width
    thin: 0.75            // supporting strokes
  };

  // Base SVG — clean, no grid by default
  function thumbBase() {
    return createSvgElement('svg', {
      viewBox: '0 0 ' + THUMB_W + ' ' + THUMB_H,
      role: 'img',
      class: 'nv-pviz-thumb-svg',
      'aria-hidden': 'true',
      'shape-rendering': 'geometricPrecision'
    });
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

  // Map data points to SVG coordinates
  function mapPoints(points, padX, padY) {
    padX = padX || 0;
    padY = padY || 0;
    var xs = points.map(function (p) { return p.x; });
    var ys = points.map(function (p) { return p.y; });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var rangeX = maxX - minX || 1, rangeY = maxY - minY || 1;
    var pw = plotW() - padX * 2, ph = plotH() - padY * 2;
    return points.map(function (p) {
      return {
        x: M.left + padX + ((p.x - minX) / rangeX) * pw,
        y: M.top + padY + ph - ((p.y - minY) / rangeY) * ph
      };
    });
  }

  // --- Thumbnail Renderers — One Mathematical Idea Each ---

  // FUNCTIONS: Single clean curve, large negative space
  function thumbCurve(points, color, opts) {
    opts = opts || {};
    var svg = thumbBase();
    if (!points || points.length < 2) return svg;

    var mapped = mapPoints(points, 8, 8);
    var pts = mapped.map(function (p) { return p.x + ',' + p.y; });

    // Optional: very faint baseline reference
    if (opts.baseline !== false) {
      var baseY = M.top + plotH() * 0.5;
      svg.appendChild(createSvgElement('line', {
        x1: M.left, y1: baseY, x2: THUMB_W - M.right, y2: baseY,
        stroke: C.faint, 'stroke-width': '0.4'
      }));
    }

    // Main curve — confident stroke
    svg.appendChild(createSvgElement('polyline', {
      points: pts.join(' '),
      fill: 'none',
      stroke: color || C.accent,
      'stroke-width': opts.stroke || C.stroke,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }));

    return svg;
  }

  // SCATTER: Points with optional regions
  function thumbScatter(points, colors, opts) {
    opts = opts || {};
    var svg = thumbBase();
    if (!points || points.length === 0) return svg;

    var mapped = mapPoints(points, 12, 12);

    for (var i = 0; i < mapped.length; i++) {
      var c = points[i].color || (colors && colors[points[i].cluster || 0]) || C.accent;
      var r = points[i].isQuery ? 4.5 : (points[i].isNeighbor ? 3 : 2);
      var op = points[i].isQuery ? '1' : '0.55';
      svg.appendChild(createSvgElement('circle', {
        cx: mapped[i].x, cy: mapped[i].y, r: r,
        fill: c, opacity: op
      }));
    }

    // Optional boundary line
    if (opts.boundary) {
      var b = opts.boundary;
      var bx1 = -10, by1 = b.slope * bx1 + b.intercept;
      var bx2 = 10, by2 = b.slope * bx2 + b.intercept;
      var bMapped = mapPoints([{ x: bx1, y: by1 }, { x: bx2, y: by2 }], 12, 12);
      svg.appendChild(createSvgElement('line', {
        x1: bMapped[0].x, y1: bMapped[0].y,
        x2: bMapped[1].x, y2: bMapped[1].y,
        stroke: C.danger, 'stroke-width': C.thin,
        'stroke-dasharray': '4 3', opacity: '0.5'
      }));
    }

    return svg;
  }

  // BARS: Clean bars without axes
  function thumbBars(bars, color) {
    var svg = thumbBase();
    if (!bars || bars.length === 0) return svg;

    var values = bars.map(function (b) { return b.value; });
    var maxVal = Math.max.apply(null, values.map(Math.abs)) || 1;
    var pw = plotW(), ph = plotH();
    var barW = Math.min(pw / (bars.length * 1.4), 28);
    var gap = (pw - barW * bars.length) / (bars.length + 1);

    for (var i = 0; i < bars.length; i++) {
      var barH = (Math.abs(bars[i].value) / maxVal) * ph * 0.8;
      var x = M.left + gap + i * (barW + gap);
      var y = M.top + ph - barH;
      svg.appendChild(createSvgElement('rect', {
        x: x, y: y, width: barW, height: barH,
        fill: color || C.accent, opacity: '0.65', rx: '2'
      }));
    }
    return svg;
  }

  // HEATMAP: Clean matrix without labels
  function thumbMatrix(matrix, color) {
    var svg = thumbBase();
    if (!matrix || !matrix.length) return svg;

    var rows = matrix.length, cols = matrix[0].length;
    var flat = [];
    for (var r = 0; r < rows; r++)
      for (var c = 0; c < cols; c++) flat.push(matrix[r][c]);
    var minV = Math.min.apply(null, flat), maxV = Math.max.apply(null, flat);
    var range = maxV - minV || 1;

    var gap = 2;
    var cellW = (plotW() - gap * (cols - 1)) / cols;
    var cellH = (plotH() - gap * (rows - 1)) / rows;
    var offsetX = M.left + (plotW() - (cellW * cols + gap * (cols - 1))) / 2;
    var offsetY = M.top + (plotH() - (cellH * rows + gap * (rows - 1))) / 2;

    for (var ri = 0; ri < rows; ri++) {
      for (var ci = 0; ci < cols; ci++) {
        var norm = (matrix[ri][ci] - minV) / range;
        var alpha = 0.15 + norm * 0.85;
        svg.appendChild(createSvgElement('rect', {
          x: offsetX + ci * (cellW + gap),
          y: offsetY + ri * (cellH + gap),
          width: cellW, height: cellH,
          fill: (color || C.accent).replace(')', ',' + alpha + ')').replace('rgb', 'rgba'),
          rx: '1'
        }));
      }
    }
    return svg;
  }

  // --- Per-Visualization Canonical Thumbnails ---

  function generateThumbnail(def) {
    if (!def) return null;

    switch (def.id) {

      // ═══════════════════════════════════════
      // MATHEMATICS — Clean curves
      // ═══════════════════════════════════════

      case 'linear-function': {
        // One diagonal line — the essence of linearity
        var xs = generateLinspace(-4, 4, 40);
        var pts = xs.map(function (x) { return { x: x, y: x }; });
        return thumbCurve(pts, C.accent);
      }

      case 'quadratic-function': {
        // Single parabola — the U shape
        var xs = generateLinspace(-3, 3, 50);
        var pts = xs.map(function (x) { return { x: x, y: x * x - 1 }; });
        return thumbCurve(pts, C.accent);
      }

      case 'sigmoid-function': {
        // The S curve — iconic sigmoid
        var xs = generateLinspace(-5, 5, 60);
        var pts = xs.map(function (x) { return { x: x, y: 1 / (1 + Math.exp(-x)) }; });
        return thumbCurve(pts, C.accent);
      }

      case 'relu-function': {
        // The ramp — zero then linear
        var xs = generateLinspace(-3, 3, 40);
        var pts = xs.map(function (x) { return { x: x, y: Math.max(0, x) }; });
        return thumbCurve(pts, C.accent);
      }

      case 'logistic-curve': {
        // Growth S-curve — logistic identity
        var xs = generateLinspace(-6, 6, 60);
        var pts = xs.map(function (x) { return { x: x, y: 1 / (1 + Math.exp(-0.8 * x)) }; });
        return thumbCurve(pts, C.accent);
      }

      // ═══════════════════════════════════════
      // PROBABILITY — Distributions
      // ═══════════════════════════════════════

      case 'normal-distribution': {
        // The bell curve — iconic Gaussian
        var xs = generateLinspace(-4, 4, 80);
        var pts = xs.map(function (x) {
          return { x: x, y: Math.exp(-0.5 * x * x) };
        });
        return thumbCurve(pts, C.accent);
      }

      case 'binomial-distribution': {
        // Discrete probability mass — bar identity
        var n = 10, p = 0.5;
        var bars = [];
        for (var k = 0; k <= n; k++) {
          var logComb = 0;
          for (var ci = 0; ci < k; ci++) logComb += Math.log(n - ci) - Math.log(ci + 1);
          bars.push({ label: String(k), value: Math.exp(logComb + k * Math.log(p) + (n - k) * Math.log(1 - p)) });
        }
        return thumbBars(bars, C.accent);
      }

      case 'bayes-probability': {
        // Bayesian update — prior vs posterior comparison
        var bars = [
          { label: 'Prior', value: 0.3 },
          { label: 'Likelihood', value: 0.8 },
          { label: 'Posterior', value: 0.77 }
        ];
        return thumbBars(bars, C.accent);
      }

      // ═══════════════════════════════════════
      // OPTIMIZATION — Descent trajectories
      // ═══════════════════════════════════════

      case 'gradient-descent-loss': {
        // Exponential decay — the optimization path
        var xs = generateLinspace(0, 40, 60);
        var pts = xs.map(function (x) { return { x: x, y: 50 * Math.exp(-0.1 * x) }; });
        return thumbCurve(pts, C.accent, { baseline: false });
      }

      case 'learning-rate-impact': {
        // Three decay curves — comparison identity
        var svg = thumbBase();
        var xs = generateLinspace(0, 80, 50);
        var series = [
          { lr: 0.02, color: C.accent },
          { lr: 0.08, color: C.secondary },
          { lr: 0.2, color: C.danger }
        ];
        series.forEach(function (s) {
          var pts = xs.map(function (x) { return { x: x, y: 100 * Math.exp(-s.lr * x) }; });
          var mapped = mapPoints(pts, 8, 8);
          var pStr = mapped.map(function (p) { return p.x + ',' + p.y; }).join(' ');
          svg.appendChild(createSvgElement('polyline', {
            points: pStr, fill: 'none', stroke: s.color,
            'stroke-width': C.thin, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
          }));
        });
        return svg;
      }

      // ═══════════════════════════════════════
      // EVALUATION — Comparison curves
      // ═══════════════════════════════════════

      case 'precision-recall-tradeoff': {
        // The PR curve — precision vs recall
        var xs = generateLinspace(0, 1, 60);
        var pts = xs.map(function (x) {
          return { x: x, y: 0.85 * (1 - x * 0.6) + 0.08 * Math.sin(x * Math.PI) };
        });
        return thumbCurve(pts, C.accent, { baseline: false });
      }

      case 'roc-threshold': {
        // ROC curve with diagonal reference
        var svg = thumbBase();
        var xs = generateLinspace(0, 1, 60);
        var pts = xs.map(function (x) { return { x: x, y: Math.pow(x, 0.35) }; });
        var mapped = mapPoints(pts, 12, 12);
        var pStr = mapped.map(function (p) { return p.x + ',' + p.y; }).join(' ');

        // Diagonal reference (random classifier)
        svg.appendChild(createSvgElement('line', {
          x1: M.left + 12, y1: M.top + 12 + plotH() - 24,
          x2: M.left + 12 + plotW() - 24, y2: M.top + 12,
          stroke: C.faint, 'stroke-width': '1', 'stroke-dasharray': '4 4'
        }));

        // ROC curve
        svg.appendChild(createSvgElement('polyline', {
          points: pStr, fill: 'none', stroke: C.accent,
          'stroke-width': C.stroke, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
        }));
        return svg;
      }

      case 'confusion-matrix': {
        // 2×2 matrix — the classification identity
        var matrix = [[80, 10], [5, 70]];
        var svg = thumbBase();
        var gap = 6;
        var cellW = (plotW() - gap) / 2;
        var cellH = (plotH() - gap) / 2;
        var offsetX = M.left + (plotW() - (cellW * 2 + gap)) / 2;
        var offsetY = M.top + (plotH() - (cellH * 2 + gap)) / 2;
        var maxV = 80;

        var fills = [
          ['rgba(6,182,212,0.7)', 'rgba(239,68,68,0.35)'],
          ['rgba(239,68,68,0.2)', 'rgba(6,182,212,0.55)']
        ];

        for (var ri = 0; ri < 2; ri++) {
          for (var ci = 0; ci < 2; ci++) {
            svg.appendChild(createSvgElement('rect', {
              x: offsetX + ci * (cellW + gap),
              y: offsetY + ri * (cellH + gap),
              width: cellW, height: cellH,
              fill: fills[ri][ci], rx: '3'
            }));
          }
        }
        return svg;
      }

      // ═══════════════════════════════════════
      // DEEP LEARNING — Activations & attention
      // ═══════════════════════════════════════

      case 'softmax-distribution': {
        // Probability distribution — descending bars
        var bars = [
          { label: '', value: 0.55 },
          { label: '', value: 0.25 },
          { label: '', value: 0.12 },
          { label: '', value: 0.08 }
        ];
        return thumbBars(bars, C.accent);
      }

      case 'attention-head-weights': {
        // Attention matrix — the transformer identity
        var matrix = [
          [0.6, 0.1, 0.1, 0.1, 0.1],
          [0.1, 0.5, 0.2, 0.1, 0.1],
          [0.1, 0.1, 0.4, 0.3, 0.1],
          [0.1, 0.1, 0.2, 0.5, 0.1],
          [0.1, 0.1, 0.1, 0.1, 0.6]
        ];
        return thumbMatrix(matrix, 'rgba(6,182,212');
      }

      // ═══════════════════════════════════════
      // EMBEDDINGS — Clusters
      // ═══════════════════════════════════════

      case 'embedding-space-2d': {
        // Three clusters — the embedding identity
        var pts = [];
        var colors = [C.accent, C.secondary, C.danger];
        for (var ci = 0; ci < 3; ci++) {
          var cp = generateScatterPoints(10, (ci - 1) * 2.5, (ci - 1) * 0.8, 0.7, ci * 100);
          cp.forEach(function (p) { pts.push({ x: p.x, y: p.y, cluster: ci }); });
        }
        return thumbScatter(pts, colors);
      }

      // ═══════════════════════════════════════
      // MACHINE LEARNING — Decision regions
      // ═══════════════════════════════════════

      case 'knn-neighborhood': {
        // Points with query marker — the neighborhood identity
        var allPts = generateScatterPoints(24, 0, 0, 4, 42);
        var kPts = allPts.map(function (p) {
          var dist = Math.sqrt(p.x * p.x + p.y * p.y);
          return { x: p.x, y: p.y, cluster: dist < 2.2 ? 1 : 0 };
        });
        kPts.push({ x: 0, y: 0, isQuery: true, cluster: 2 });
        return thumbScatter(kPts, ['rgba(138,180,248,0.25)', C.accent, C.secondary]);
      }

      case 'decision-boundary': {
        // Two regions separated by a line
        var dbPts = [];
        for (var di = 0; di < 18; di++) {
          var rx1 = deterministicRandom(42 + di * 4) * 6 - 3;
          var ry1 = deterministicRandom(42 + di * 4 + 1) * 3 + 1;
          dbPts.push({ x: rx1, y: ry1, cluster: 0 });
          var rx2 = deterministicRandom(42 + di * 4 + 1000) * 6 - 3;
          var ry2 = deterministicRandom(42 + di * 4 + 1001) * 3 - 1;
          dbPts.push({ x: rx2, y: ry2, cluster: 1 });
        }
        return thumbScatter(dbPts, [C.accent, C.secondary], { boundary: { slope: -0.5, intercept: 0 } });
      }

      case 'pca-projection': {
        // Projected points — the dimensionality reduction identity
        var pcaPts = generateScatterPoints(35, 0, 0, 1.2, 42);
        return thumbScatter(pcaPts, [C.accent]);
      }

      // ═══════════════════════════════════════
      // SIMILARITY — Vector geometry
      // ═══════════════════════════════════════

      case 'cosine-similarity': {
        // Two vectors from origin — the angle identity
        var svg = thumbBase();
        var cx = M.left + plotW() * 0.15;
        var cy = M.top + plotH() * 0.8;
        var ax = M.left + plotW() * 0.75;
        var ay = M.top + plotH() * 0.15;
        var bx = M.left + plotW() * 0.85;
        var by = M.top + plotH() * 0.55;

        // Vector A
        svg.appendChild(createSvgElement('line', {
          x1: cx, y1: cy, x2: ax, y2: ay,
          stroke: C.accent, 'stroke-width': C.stroke, 'stroke-linecap': 'round'
        }));
        // Vector B
        svg.appendChild(createSvgElement('line', {
          x1: cx, y1: cy, x2: bx, y2: by,
          stroke: C.secondary, 'stroke-width': C.stroke, 'stroke-linecap': 'round'
        }));
        // Origin dot
        svg.appendChild(createSvgElement('circle', {
          cx: cx, cy: cy, r: '3', fill: '#ffffff', opacity: '0.8'
        }));
        // Endpoint dots
        svg.appendChild(createSvgElement('circle', { cx: ax, cy: ay, r: '3', fill: C.accent }));
        svg.appendChild(createSvgElement('circle', { cx: bx, cy: by, r: '3', fill: C.secondary }));
        return svg;
      }

      default: {
        var xs = generateLinspace(-4, 4, 40);
        var pts = xs.map(function (x) { return { x: x, y: x * x }; });
        return thumbCurve(pts, C.accent);
      }
    }
  }

  // --- Existing UI functions ---

  // Concept-aware parameter hints
  var PARAM_HINTS = {
    'slope': { left: 'descending', right: 'ascending', concept: 'concavity' },
    'intercept': { left: 'negative', right: 'positive', concept: 'y-intercept' },
    'a': { left: 'concave down', right: 'concave up', concept: 'concavity' },
    'b': { left: 'shift left', right: 'shift right', concept: 'horizontal shift' },
    'c': { left: 'lower', right: 'higher', concept: 'vertical shift' },
    'k': { left: 'smooth', right: 'sharp', concept: 'steepness' },
    'x0': { left: 'left', right: 'right', concept: 'center' },
    'threshold': { left: 'earlier', right: 'later', concept: 'activation point' },
    'learningRate': { left: 'conservative', right: 'aggressive', concept: 'step size' },
    'mean': { left: 'left', right: 'right', concept: 'center μ' },
    'stdDev': { left: 'narrow', right: 'wide', concept: 'spread σ' },
    'prior': { left: 'skeptical', right: 'confident', concept: 'initial belief' },
    'likelihood': { left: 'unlikely', right: 'likely', concept: 'evidence strength' },
    'L': { left: 'small', right: 'large', concept: 'carrying capacity' },
    'initialLoss': { left: 'low', right: 'high', concept: 'starting point' },
    'steps': { left: 'few', right: 'many', concept: 'iterations' },
  };

  // Parameter grouping by visualization
  var PARAM_GROUPS = {
    'linear-function': [
      { label: 'Model', params: ['slope', 'intercept'] }
    ],
    'quadratic-function': [
      { label: 'Coefficients', params: ['a', 'b', 'c'] }
    ],
    'sigmoid-function': [
      { label: 'Shape', params: ['k', 'x0'] }
    ],
    'relu-function': [
      { label: 'Activation', params: ['threshold'] }
    ],
    'gradient-descent-loss': [
      { label: 'Optimization', params: ['learningRate', 'steps'] },
      { label: 'Configuration', params: ['initialLoss', 'lossType'] }
    ],
    'learning-rate-impact': [
      { label: 'Learning Rates', params: ['lr1', 'lr2', 'lr3'] },
      { label: 'Configuration', params: ['steps'] }
    ],
    'normal-distribution': [
      { label: 'Distribution', params: ['mean', 'stdDev'] },
      { label: 'Sampling', params: ['sampleSize', 'seed'] }
    ],
    'softmax-distribution': [
      { label: 'Inputs', params: ['input1', 'input2', 'input3', 'input4'] }
    ],
    'bayes-probability': [
      { label: 'Probabilities', params: ['prior', 'likelihood', 'falsePositive'] }
    ],
  };

  function renderParameterControls(parameterSchema, params, vizId) {
    var html = '';
    if (!Array.isArray(parameterSchema) || parameterSchema.length === 0) {
      return '<div class="nv-pviz-no-params"><p>No configurable parameters.</p></div>';
    }

    var groups = PARAM_GROUPS[vizId] || [{ label: 'Parameters', params: parameterSchema.map(function (s) { return s.id; }) }];

    groups.forEach(function (group, gi) {
      var groupParams = group.params.map(function (pid) {
        return parameterSchema.find(function (s) { return s.id === pid; });
      }).filter(Boolean);

      if (groupParams.length === 0) return;

      var isAdvanced = gi > 0;
      html += '<div class="nv-pviz-param-section' + (isAdvanced ? ' nv-pviz-param-section--collapsed' : '') + '" data-section="' + gi + '">';
      html += '<button class="nv-pviz-param-section-header" aria-expanded="' + !isAdvanced + '" data-toggle-section="' + gi + '">';
      html += '<span class="nv-pviz-param-section-title">' + escapeHtml(group.label) + '</span>';
      html += '<span class="nv-pviz-param-section-icon">' + (isAdvanced ? '+' : '−') + '</span>';
      html += '</button>';
      html += '<div class="nv-pviz-param-section-body"' + (isAdvanced ? ' style="display:none"' : '') + '>';

      groupParams.forEach(function (schema) {
        var key = schema.id;
        var value = params[key] !== undefined ? params[key] : schema.defaultValue;
        var hint = PARAM_HINTS[key];

        html += '<div class="nv-pviz-param-card" data-param-id="' + escapeHtml(key) + '">';
        html += '<div class="nv-pviz-param-card-header">';
        html += '<label class="nv-pviz-param-label" for="pviz-param-' + escapeHtml(key) + '">' + escapeHtml(schema.label) + '</label>';
        if (hint) html += '<span class="nv-pviz-param-concept">' + hint.concept + '</span>';
        html += '</div>';
        if (schema.description) {
          html += '<span class="nv-pviz-param-desc">' + escapeHtml(schema.description) + '</span>';
        }
        switch (schema.type) {
          case 'number': case 'integer': {
            var step = schema.type === 'integer' ? 1 : (schema.step || 0.01);
            html += '<div class="nv-pviz-slider-row">';
            if (hint) html += '<span class="nv-pviz-slider-hint-left">' + hint.left + '</span>';
            html += '<input type="range" id="pviz-param-' + escapeHtml(key) + '" class="nv-pviz-slider" min="' + schema.min + '" max="' + schema.max + '" step="' + step + '" value="' + value + '" aria-label="' + escapeHtml(schema.label) + '" data-param-key="' + escapeHtml(key) + '" data-param-type="' + escapeHtml(schema.type) + '">';
            if (hint) html += '<span class="nv-pviz-slider-hint-right">' + hint.right + '</span>';
            html += '<span class="nv-pviz-slider-value" id="pviz-val-' + escapeHtml(key) + '">' + value + '</span>';
            html += '</div>';
            break;
          }
          case 'boolean': {
            html += '<label class="nv-pviz-toggle"><input type="checkbox" id="pviz-param-' + escapeHtml(key) + '" class="nv-pviz-checkbox" ' + (value ? 'checked ' : '') + 'aria-label="' + escapeHtml(schema.label) + '" data-param-key="' + escapeHtml(key) + '" data-param-type="boolean"><span class="nv-pviz-toggle-slider"></span></label>';
            break;
          }
          case 'enum': {
            html += '<select id="pviz-param-' + escapeHtml(key) + '" class="nv-pviz-select" aria-label="' + escapeHtml(schema.label) + '" data-param-key="' + escapeHtml(key) + '" data-param-type="enum">';
            var options = schema.options || [];
            for (var oi = 0; oi < options.length; oi++) {
              html += '<option value="' + escapeHtml(options[oi]) + '" ' + (options[oi] === value ? 'selected' : '') + '>' + escapeHtml(options[oi]) + '</option>';
            }
            html += '</select>';
            break;
          }
        }
        html += '</div>';
      });

      html += '</div></div>';
    });

    return html;
  }

  function renderMetrics(metrics) {
    if (!metrics || typeof metrics !== 'object') return '';
    var html = '<div class="nv-pviz-metrics">';
    var keys = Object.keys(metrics);
    for (var i = 0; i < keys.length; i++) {
      var val = metrics[keys[i]];
      var display = typeof val === 'number' ? val.toFixed(4) : String(val);
      html += '<div class="nv-pviz-metric-item"><span class="nv-pviz-metric-label">' + escapeHtml(keys[i]) + ':</span><span class="nv-pviz-metric-value">' + escapeHtml(display) + '</span></div>';
    }
    html += '</div>';
    return html;
  }

  function renderVisualizationHeader(definition, isFavorite) {
    if (!definition) return '';
    var html = '<div class="nv-pviz-header"><div class="nv-pviz-header-info">';
    html += '<h1 class="nv-pviz-title">' + escapeHtml(definition.title) + '</h1>';
    html += '<span class="nv-pviz-badge">' + escapeHtml(capitalizeCategory(definition.category)) + '</span>';
    html += '</div><div class="nv-pviz-header-actions">';
    html += '<button class="nv-pviz-btn nv-pviz-btn-favorite" data-action="toggle-favorite" aria-label="' + (isFavorite ? 'Remove from favorites' : 'Add to favorites') + '" data-viz-id="' + escapeHtml(definition.id) + '">' + (isFavorite ? '&#9733;' : '&#9734;') + '</button>';
    html += '<button class="nv-pviz-btn nv-pviz-btn-sm" data-action="reset-params" aria-label="Reset parameters to defaults">Reset</button>';
    html += '<button class="nv-pviz-btn nv-pviz-btn-sm" data-action="copy-params" aria-label="Copy current parameter values">Copy</button>';
    html += '</div></div>';
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
      var thumb = generateThumbnail(def);
      var thumbHtml = '';
      if (thumb) {
        var tmp = document.createElement('div');
        tmp.appendChild(thumb);
        thumbHtml = tmp.innerHTML;
      }
      html += '<a href="#/visualizations/' + escapeHtml(def.slug) + '" class="nv-pviz-card" data-viz-id="' + escapeHtml(def.id) + '" aria-label="' + escapeHtml(def.title) + ' — ' + escapeHtml(capitalizeCategory(def.category)) + '">';
      html += '<div class="nv-pviz-card-preview" aria-hidden="true"><div class="nv-pviz-card-preview-inner">' + thumbHtml + '</div></div>';
      html += '<div class="nv-pviz-card-content">';
      html += '<div class="nv-pviz-card-header-row">';
      html += '<h3 class="nv-pviz-card-title">' + escapeHtml(def.title) + '</h3>';
      html += '<span class="nv-pviz-card-category">' + escapeHtml(capitalizeCategory(def.category)) + '</span>';
      html += '</div>';
      html += '<p class="nv-pviz-card-summary">' + escapeHtml(def.summary || '') + '</p>';
      html += '</div></a>';
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
      html += '<button class="nv-pviz-filter-btn" data-category="' + escapeHtml(categories[i]) + '">' + escapeHtml(capitalizeCategory(categories[i])) + '</button>';
    }
    html += '</div>';
    return html;
  }

  function renderStatusRegion() {
    return '<div class="nv-pviz-status" role="status" aria-live="polite" data-viz-status></div>';
  }

  // Comparison presets
  var COMPARISON_PRESETS = {
    'sigmoid-function': [
      { label: 'Low Steepness', params: { k: 0.5, x0: 0 } },
      { label: 'Standard', params: { k: 1, x0: 0 } },
      { label: 'Sharp', params: { k: 5, x0: 0 } },
      { label: 'Binary', params: { k: 15, x0: 0 } }
    ],
    'gradient-descent-loss': [
      { label: 'Slow', params: { learningRate: 0.001, steps: 100 } },
      { label: 'Balanced', params: { learningRate: 0.01, steps: 50 } },
      { label: 'Aggressive', params: { learningRate: 0.1, steps: 30 } },
      { label: 'Divergence', params: { learningRate: 0.5, steps: 20 } }
    ],
    'normal-distribution': [
      { label: 'Narrow', params: { mean: 0, stdDev: 0.5 } },
      { label: 'Standard', params: { mean: 0, stdDev: 1 } },
      { label: 'Wide', params: { mean: 0, stdDev: 2 } }
    ],
    'linear-function': [
      { label: 'Flat', params: { slope: 0.2, intercept: 0 } },
      { label: 'Standard', params: { slope: 1, intercept: 0 } },
      { label: 'Steep', params: { slope: 3, intercept: 0 } }
    ],
    'quadratic-function': [
      { label: 'Narrow', params: { a: 2, b: 0, c: 0 } },
      { label: 'Standard', params: { a: 1, b: 0, c: 0 } },
      { label: 'Wide', params: { a: 0.3, b: 0, c: 0 } }
    ],
    'relu-function': [
      { label: 'Early', params: { threshold: -1 } },
      { label: 'Standard', params: { threshold: 0 } },
      { label: 'Late', params: { threshold: 1 } }
    ]
  };

  function renderComparisonPresets(vizId) {
    var presets = COMPARISON_PRESETS[vizId];
    if (!presets || presets.length === 0) return '';

    var html = '<div class="nv-pviz-comparison-presets">';
    html += '<h4 class="nv-pviz-comparison-title">Compare</h4>';
    html += '<div class="nv-pviz-comparison-grid">';
    presets.forEach(function (preset, idx) {
      html += '<button class="nv-pviz-comparison-btn" data-comparison-preset="' + idx + '" data-viz-id="' + escapeHtml(vizId) + '" aria-label="Compare with ' + escapeHtml(preset.label) + '">';
      html += '<span class="nv-pviz-comparison-label">' + escapeHtml(preset.label) + '</span>';
      html += '</button>';
    });
    html += '</div>';
    html += '</div>';
    return html;
  }

  // ═══════════════════════════════════════════════════════════
  // Guided Scientific Experiments
  // ═══════════════════════════════════════════════════════════

  var EXPERIMENTS = {
    'sigmoid-function': {
      title: 'Understanding Sigmoid Steepness',
      objective: 'Observe how parameter k changes the transition behavior of the sigmoid function.',
      duration: '3 min',
      difficulty: 'Beginner',
      question: 'What happens to the sigmoid curve when k becomes very large?',
      hypothesis: 'Prediction: What do you think will happen if k increases from 1 to 10?',
      steps: [
        { params: { k: 1, x0: 0 }, observation: 'Notice the smooth, gradual transition between 0 and 1.', highlight: 'transition' },
        { params: { k: 5, x0: 0 }, observation: 'The transition becomes narrower. The gradient concentrates near x₀.', highlight: 'transition' },
        { params: { k: 15, x0: 0 }, observation: 'The curve approximates a step function. Binary activation.', highlight: 'transition' }
      ],
      conclusion: 'Large values of k approximate binary activation, reducing the width of the transition region.',
      vocabulary: ['Inflection Point', 'Gradient', 'Saturation', 'Binary Approximation'],
      misconception: { text: 'Increasing k moves the center.', reality: 'Only the steepness changes. The inflection point stays at x₀.' },
      compareWith: ['relu-function', 'quadratic-function']
    },
    'gradient-descent-loss': {
      title: 'Learning Rate Trade-offs',
      objective: 'Observe how learning rate affects convergence speed and stability.',
      duration: '4 min',
      difficulty: 'Intermediate',
      question: 'Why does a larger learning rate sometimes make optimization worse?',
      hypothesis: 'Prediction: What happens when the learning rate becomes very aggressive?',
      steps: [
        { params: { learningRate: 0.001, steps: 100 }, observation: 'Slow, stable convergence. Loss decreases gradually.', highlight: 'trajectory' },
        { params: { learningRate: 0.01, steps: 50 }, observation: 'Faster convergence. Loss drops more quickly.', highlight: 'trajectory' },
        { params: { learningRate: 0.1, steps: 30 }, observation: 'Very fast initial drop. Possible oscillation near minimum.', highlight: 'trajectory' }
      ],
      conclusion: 'Higher learning rates accelerate convergence but increase instability near the minimum.',
      vocabulary: ['Learning Rate', 'Convergence', 'Oscillation', 'Gradient'],
      misconception: { text: 'Higher learning rates always converge faster.', reality: 'Very large learning rates can diverge or oscillate indefinitely.' },
      compareWith: ['normal-distribution', 'sigmoid-function']
    },
    'normal-distribution': {
      title: 'Variance and Uncertainty',
      objective: 'Observe how standard deviation changes distribution shape.',
      duration: '3 min',
      difficulty: 'Beginner',
      question: 'Why does increasing σ change uncertainty without changing the mean?',
      hypothesis: 'Prediction: What happens to the 68-95-99.7 intervals when σ doubles?',
      steps: [
        { params: { mean: 0, stdDev: 0.5 }, observation: 'Narrow distribution. Most data concentrated near the mean.', highlight: 'regions' },
        { params: { mean: 0, stdDev: 1 }, observation: 'Standard width. 68% within ±1σ.', highlight: 'regions' },
        { params: { mean: 0, stdDev: 2 }, observation: 'Wide distribution. Higher uncertainty. 95% interval expands.', highlight: 'regions' }
      ],
      conclusion: 'Changing σ changes uncertainty without moving the mean. Wider distributions have more spread.',
      vocabulary: ['Standard Deviation', 'Variance', 'Confidence Interval', 'Bell Curve'],
      misconception: { text: 'Increasing σ moves the distribution.', reality: 'Only the spread changes. The mean remains fixed.' },
      compareWith: ['binomial-distribution', 'sigmoid-function']
    },
    'linear-function': {
      title: 'Slope and Intercept',
      objective: 'Understand how slope and intercept shape a line.',
      duration: '2 min',
      difficulty: 'Beginner',
      question: 'How do slope and intercept independently control the line?',
      hypothesis: 'Prediction: What happens when slope is negative?',
      steps: [
        { params: { slope: 1, intercept: 0 }, observation: 'Standard diagonal line through origin.', highlight: 'line' },
        { params: { slope: 3, intercept: 0 }, observation: 'Steeper line. Higher rate of change.', highlight: 'line' },
        { params: { slope: -1, intercept: 2 }, observation: 'Line flips direction. Intercept shifts the crossing point.', highlight: 'line' }
      ],
      conclusion: 'Slope controls direction and steepness. Intercept controls where the line crosses the y-axis.',
      vocabulary: ['Slope', 'Intercept', 'Rate of Change', 'Y-intercept'],
      misconception: { text: 'Slope and intercept are independent.', reality: 'They are, but changing both simultaneously makes it hard to see individual effects.' },
      compareWith: ['quadratic-function', 'relu-function']
    },
    'quadratic-function': {
      title: 'Parabola Shape',
      objective: 'Understand how coefficients shape a parabola.',
      duration: '3 min',
      difficulty: 'Intermediate',
      question: 'How do a, b, and c independently affect the parabola?',
      hypothesis: 'Prediction: What happens when a is negative?',
      steps: [
        { params: { a: 1, b: 0, c: 0 }, observation: 'Standard parabola. Opens upward.', highlight: 'vertex' },
        { params: { a: 2, b: 0, c: 0 }, observation: 'Narrower. Stronger curvature.', highlight: 'vertex' },
        { params: { a: -1, b: 0, c: 2 }, observation: 'Opens downward. Vertex becomes maximum.', highlight: 'vertex' }
      ],
      conclusion: 'Coefficient a controls concavity and width. b shifts the vertex horizontally. c shifts vertically.',
      vocabulary: ['Vertex', 'Concavity', 'Roots', 'Axis of Symmetry'],
      misconception: { text: 'Changing b moves the vertex up or down.', reality: 'b moves the vertex horizontally. c moves it vertically.' },
      compareWith: ['linear-function', 'sigmoid-function']
    }
  };

  function renderExperiments(vizId) {
    var experiment = EXPERIMENTS[vizId];
    if (!experiment) return '';

    var html = '<div class="nv-pviz-experiment" data-experiment>';
    html += '<div class="nv-pviz-experiment-header">';
    html += '<h4 class="nv-pviz-experiment-title">' + escapeHtml(experiment.title) + '</h4>';
    html += '<div class="nv-pviz-experiment-meta">';
    html += '<span class="nv-pviz-experiment-badge">' + escapeHtml(experiment.difficulty) + '</span>';
    html += '<span class="nv-pviz-experiment-duration">' + escapeHtml(experiment.duration) + '</span>';
    html += '</div>';
    html += '</div>';

    html += '<div class="nv-pviz-experiment-objective">' + escapeHtml(experiment.objective) + '</div>';

    html += '<button class="nv-pviz-experiment-start" data-start-experiment="' + escapeHtml(vizId) + '">';
    html += 'Begin Experiment';
    html += '</button>';

    html += '</div>';
    return html;
  }

  function renderExperimentStep(experiment, stepIdx) {
    if (!experiment || stepIdx >= experiment.steps.length) return '';

    var step = experiment.steps[stepIdx];
    var html = '<div class="nv-pviz-experiment-step">';
    html += '<div class="nv-pviz-experiment-progress">Step ' + (stepIdx + 1) + ' / ' + experiment.steps.length + '</div>';
    html += '<div class="nv-pviz-experiment-instruction">' + escapeHtml(step.observation) + '</div>';

    // Show parameter change
    if (step.params) {
      html += '<div class="nv-pviz-experiment-params">';
      Object.keys(step.params).forEach(function (key) {
        html += '<span class="nv-pviz-experiment-param">' + escapeHtml(key) + ' = ' + step.params[key] + '</span>';
      });
      html += '</div>';
    }

    html += '<button class="nv-pviz-experiment-next" data-next-step="' + (stepIdx + 1) + '">';
    html += stepIdx < experiment.steps.length - 1 ? 'Next Step' : 'Complete';
    html += '</button>';
    html += '</div>';
    return html;
  }

  function renderExperimentConclusion(experiment) {
    if (!experiment) return '';

    var html = '<div class="nv-pviz-experiment-conclusion">';
    html += '<div class="nv-pviz-experiment-conclusion-title">Conclusion</div>';
    html += '<div class="nv-pviz-experiment-conclusion-text">' + escapeHtml(experiment.conclusion) + '</div>';

    // Vocabulary
    if (experiment.vocabulary && experiment.vocabulary.length > 0) {
      html += '<div class="nv-pviz-experiment-vocabulary">';
      html += '<div class="nv-pviz-experiment-vocab-title">Key Terms</div>';
      html += '<div class="nv-pviz-experiment-vocab-list">';
      experiment.vocabulary.forEach(function (term) {
        html += '<span class="nv-pviz-experiment-vocab-tag">' + escapeHtml(term) + '</span>';
      });
      html += '</div></div>';
    }

    // Misconception
    if (experiment.misconception) {
      html += '<div class="nv-pviz-experiment-misconception">';
      html += '<div class="nv-pviz-experiment-misconception-title">Common Misconception</div>';
      html += '<div class="nv-pviz-experiment-misconception-text">' + escapeHtml(experiment.misconception.text) + '</div>';
      html += '<div class="nv-pviz-experiment-misconception-reality">' + escapeHtml(experiment.misconception.reality) + '</div>';
      html += '</div>';
    }

    html += '<button class="nv-pviz-experiment-restart" data-restart-experiment>Restart</button>';
    html += '</div>';
    return html;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.VizUI = {
    renderParameterControls: renderParameterControls,
    renderMetrics: renderMetrics,
    renderVisualizationHeader: renderVisualizationHeader,
    renderVisualizationList: renderVisualizationList,
    renderBreadcrumb: renderBreadcrumb,
    renderCategoryFilter: renderCategoryFilter,
    renderStatusRegion: renderStatusRegion,
    renderComparisonPresets: renderComparisonPresets,
    COMPARISON_PRESETS: COMPARISON_PRESETS,
    renderExperiments: renderExperiments,
    renderExperimentStep: renderExperimentStep,
    renderExperimentConclusion: renderExperimentConclusion,
    EXPERIMENTS: EXPERIMENTS
  };
})();
