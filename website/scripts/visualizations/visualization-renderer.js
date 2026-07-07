/**
 * NV-800 — Phase 5+6: Mathematical Fidelity & Communication
 * Adaptive axes, numerical stability, comparative feedback,
 * dynamic highlights, mathematical narration.
 */
(function () {
  'use strict';

  function esc(v) {
    return String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function el(tag, a) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (a) Object.keys(a).forEach(function (k) { e.setAttribute(k, a[k]); });
    return e;
  }

  // ═══════════════════════════════════════════════════════════
  // Canvas — Scientific Figure Composition
  // ═══════════════════════════════════════════════════════════

  var W = 720, H = 460;
  var P = { t: 32, r: 32, b: 48, l: 56 };
  function pw() { return W - P.l - P.r; }
  function ph() { return H - P.t - P.b; }

  var F = { mono: "'JetBrains Mono', monospace", sans: "Inter, system-ui, sans-serif" };

  // ═══════════════════════════════════════════════════════════
  // Numerical Stability — protect against edge cases
  // ═══════════════════════════════════════════════════════════

  function safe(v) {
    if (typeof v !== 'number' || !isFinite(v)) return 0;
    return v;
  }

  function safeDiv(a, b) {
    if (!b || !isFinite(b)) return 0;
    var r = a / b;
    return isFinite(r) ? r : 0;
  }

  function safeSqrt(v) {
    if (v < 0) return 0;
    var r = Math.sqrt(v);
    return isFinite(r) ? r : 0;
  }

  function safeExp(v) {
    if (v > 500) return Math.exp(500);
    if (v < -500) return Math.exp(-500);
    var r = Math.exp(v);
    return isFinite(r) ? r : 0;
  }

  function safeLog(v) {
    if (v <= 0) return -10;
    var r = Math.log(v);
    return isFinite(r) ? r : -10;
  }

  // ═══════════════════════════════════════════════════════════
  // Adaptive Bounds — viewport intelligence
  // ═══════════════════════════════════════════════════════════

  function bnd(pts, opts) {
    opts = opts || {};
    if (!pts || pts.length === 0) return { x0: -10, x1: 10, y0: -10, y1: 10, dx: 20, dy: 20 };

    var xs = pts.map(function (p) { return safe(p.x); });
    var ys = pts.map(function (p) { return safe(p.y); });

    var xMin = Math.min.apply(null, xs);
    var xMax = Math.max.apply(null, xs);
    var yMin = Math.min.apply(null, ys);
    var yMax = Math.max.apply(null, ys);

    // Ensure range is never zero
    var dx = (xMax - xMin) || 1;
    var dy = (yMax - yMin) || 1;

    // Ensure minimum range for readability
    dx = Math.max(dx, opts.minDx || 2);
    dy = Math.max(dy, opts.minDy || 2);

    // Center the data
    var xCenter = (xMin + xMax) / 2;
    var yCenter = (yMin + yMax) / 2;

    // Add breathing room (15% padding)
    var padX = dx * 0.15;
    var padY = dy * 0.15;

    return {
      x0: xCenter - dx / 2 - padX,
      x1: xCenter + dx / 2 + padX,
      y0: yCenter - dy / 2 - padY,
      y1: yCenter + dy / 2 + padY,
      dx: dx + padX * 2,
      dy: dy + padY * 2
    };
  }

  function mx(v, b) { return P.l + (safeDiv(v - b.x0, b.dx)) * pw(); }
  function my(v, b) { return P.t + ph() - (safeDiv(v - b.y0, b.dy)) * ph(); }

  // ═══════════════════════════════════════════════════════════
  // Smart Tick Formatting — pleasant numbers
  // ═══════════════════════════════════════════════════════════

  function niceNum(range, round) {
    var exponent = Math.floor(Math.log10(range));
    var fraction = range / Math.pow(10, exponent);
    var nice;
    if (round) {
      if (fraction < 1.5) nice = 1;
      else if (fraction < 3) nice = 2;
      else if (fraction < 7) nice = 5;
      else nice = 10;
    } else {
      if (fraction <= 1) nice = 1;
      else if (fraction <= 2) nice = 2;
      else if (fraction <= 5) nice = 5;
      else nice = 10;
    }
    return nice * Math.pow(10, exponent);
  }

  function smartTicks(min, max, maxTicks) {
    maxTicks = maxTicks || 6;
    var range = max - min;
    if (range <= 0 || !isFinite(range)) return [0];

    var niceRange = niceNum(range, false);
    var spacing = niceNum(niceRange / (maxTicks - 1), true);
    if (spacing <= 0 || !isFinite(spacing)) return [min, max];

    var ticks = [];
    var start = Math.ceil(min / spacing) * spacing;
    for (var t = start; t <= max + spacing * 0.001; t += spacing) {
      ticks.push(Math.round(t * 1e10) / 1e10); // Avoid floating point artifacts
    }

    // Always include 0 if in range
    if (ticks.length > 0 && min < 0 && max > 0) {
      var hasZero = ticks.some(function (t) { return Math.abs(t) < spacing * 0.01; });
      if (!hasZero) {
        ticks.push(0);
        ticks.sort(function (a, b) { return a - b; });
      }
    }

    return ticks.length > 0 ? ticks : [min, max];
  }

  function fmtSmart(n) {
    if (!isFinite(n)) return '0';
    var abs = Math.abs(n);
    if (abs === 0) return '0';
    if (abs >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    if (abs < 0.001 && abs > 0) return n.toExponential(1);
    if (abs >= 100) return Math.round(n).toString();
    if (abs >= 10) return n.toFixed(1);
    if (abs >= 1) return n.toFixed(2);
    return n.toFixed(3);
  }

  // ═══════════════════════════════════════════════════════════
  // SVG Base
  // ═══════════════════════════════════════════════════════════

  function svg(label) {
    return el('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      role: 'img', 'aria-label': esc(label || 'Visualization'),
      class: 'nv-pviz-chart-svg',
      style: 'width:100%;height:auto;max-height:480px'
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Primitives
  // ═══════════════════════════════════════════════════════════

  function _axis(s, b) {
    s.appendChild(el('line', { x1: P.l, y1: H - P.b, x2: W - P.r, y2: H - P.b, stroke: 'rgba(138,180,248,0.08)', 'stroke-width': '0.5' }));
    s.appendChild(el('line', { x1: P.l, y1: P.t, x2: P.l, y2: H - P.b, stroke: 'rgba(138,180,248,0.08)', 'stroke-width': '0.5' }));
  }

  function _grid(s, b, opts) {
    opts = opts || {};
    var ticks = smartTicks(b.y0, b.y1, opts.maxTicks || 5);
    ticks.forEach(function (v) {
      var gy = my(v, b);
      if (gy > P.t && gy < H - P.b) {
        s.appendChild(el('line', { x1: P.l, y1: gy, x2: W - P.r, y2: gy, stroke: 'rgba(138,180,248,0.03)', 'stroke-width': '0.3' }));
      }
    });
  }

  function _ticks(s, b) {
    var yTicks = smartTicks(b.y0, b.y1, 5);
    yTicks.forEach(function (v) {
      var gy = my(v, b);
      if (gy > P.t + 8 && gy < H - P.b - 8) {
        var t = el('text', { x: P.l - 10, y: gy + 3, fill: 'rgba(138,180,248,0.25)', 'font-size': '8.5', 'text-anchor': 'end', 'font-family': F.mono, 'letter-spacing': '0.02em' });
        t.textContent = fmtSmart(v);
        s.appendChild(t);
      }
    });

    var xTicks = smartTicks(b.x0, b.x1, 5);
    xTicks.forEach(function (v) {
      var gx = mx(v, b);
      if (gx > P.l + 12 && gx < W - P.r - 12) {
        var t = el('text', { x: gx, y: H - P.b + 16, fill: 'rgba(138,180,248,0.25)', 'font-size': '8.5', 'text-anchor': 'middle', 'font-family': F.mono, 'letter-spacing': '0.02em' });
        t.textContent = fmtSmart(v);
        s.appendChild(t);
      }
    });
  }

  function _ann(s, x, y, label, opts) {
    opts = opts || {};
    var col = opts.color || '#f59e0b';
    var lx = x + (opts.dx || 14);
    var ly = y + (opts.dy || -16);
    s.appendChild(el('circle', { cx: x, cy: y, r: opts.r || 3, fill: col, stroke: '#080c14', 'stroke-width': '1.5' }));
    var t = el('text', { x: lx, y: ly + 4, fill: col, 'font-size': '9.5', 'font-family': F.mono, 'font-weight': '500', opacity: '0.85', 'letter-spacing': '0.02em' });
    t.textContent = label;
    s.appendChild(t);
  }

  function _ref(s, x1, y1, x2, y2, color) {
    s.appendChild(el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color || 'rgba(138,180,248,0.1)', 'stroke-width': '0.5', 'stroke-dasharray': '3 2' }));
  }

  function _region(s, d, color) {
    s.appendChild(el('path', { d: d, fill: color, stroke: 'none' }));
  }

  function _title(s, text) {
    var t = el('text', { x: P.l + 4, y: 20, fill: 'rgba(232,238,246,0.6)', 'font-size': '11', 'font-weight': '600', 'font-family': F.sans, 'letter-spacing': '-0.01em' });
    t.textContent = text;
    s.appendChild(t);
  }

  function _label(s, x, y, text, opts) {
    opts = opts || {};
    var t = el('text', { x: x, y: y, fill: opts.fill || '#a7b7c8', 'font-size': opts.size || '9', 'text-anchor': opts.anchor || 'middle', 'font-family': opts.font || F.mono, opacity: opts.opacity || '0.7', 'letter-spacing': '0.02em' });
    t.textContent = text;
    s.appendChild(t);
  }

  // Ghost curve — previous state for comparison
  function _ghost(s, pts, b, color) {
    if (!pts || pts.length < 2) return;
    var path = pts.map(function (p) { return mx(safe(p.x), b) + ',' + my(safe(p.y), b); }).join(' ');
    s.appendChild(el('polyline', { points: path, fill: 'none', stroke: color || 'rgba(138,180,248,0.08)', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '4 3' }));
  }

  function _tooltip(s) {
    var g = el('g', { class: 'nv-pviz-tooltip', opacity: '0' });
    g.appendChild(el('rect', { x: 0, y: 0, width: 130, height: 28, fill: '#0e1420', stroke: 'rgba(6,182,212,0.2)', 'stroke-width': '0.5', rx: '3' }));
    g.appendChild(el('text', { x: 6, y: 11, fill: '#e8eef6', 'font-size': '9', 'font-family': F.mono }));
    g.appendChild(el('text', { x: 6, y: 22, fill: '#a7b7c8', 'font-size': '8', 'font-family': F.mono }));
    s.appendChild(g);
    s.appendChild(el('rect', { x: P.l, y: P.t, width: pw(), height: ph(), fill: 'transparent', class: 'nv-pviz-tracker' }));
    s.appendChild(el('line', { x1: 0, y1: P.t, x2: 0, y2: H - P.b, stroke: 'rgba(6,182,212,0.1)', 'stroke-width': '0.5', 'stroke-dasharray': '3 2', opacity: '0', class: 'nv-pviz-cross-x' }));
    s.appendChild(el('line', { x1: P.l, y1: 0, x2: W - P.r, y2: 0, stroke: 'rgba(6,182,212,0.1)', 'stroke-width': '0.5', 'stroke-dasharray': '3 2', opacity: '0', class: 'nv-pviz-cross-y' }));
  }

  // ═══════════════════════════════════════════════════════════
  // LINEAR — Adaptive, minimal
  // ═══════════════════════════════════════════════════════════

  function renderLinear(container, model) {
    var pts = model.points || [];
    if (pts.length < 2) { container.innerHTML = '<p class="nv-pviz-empty">No data.</p>'; return; }
    var b = bnd(pts, { minDy: 4 });
    var s = svg(model.title);

    _grid(s, b);
    _axis(s, b);
    _ticks(s, b);

    // Ghost curve (previous state)
    if (model.ghostPoints) _ghost(s, model.ghostPoints, b);

    // The line
    var path = pts.map(function (p) { return mx(safe(p.x), b) + ',' + my(safe(p.y), b); }).join(' ');
    s.appendChild(el('polyline', { points: path, fill: 'none', stroke: '#06b6d4', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));

    // Annotations
    if (model.annotations) {
      model.annotations.forEach(function (a) {
        _ann(s, mx(safe(a.x), b), my(safe(a.y), b), a.label);
      });
    }

    _title(s, model.title);
    _tooltip(s);
    container.innerHTML = '';
    container.appendChild(s);
  }

  // ═══════════════════════════════════════════════════════════
  // QUADRATIC — Vertex, symmetry, regions
  // ═══════════════════════════════════════════════════════════

  function renderQuadratic(container, model) {
    var pts = model.points || [];
    if (pts.length < 2) { container.innerHTML = '<p class="nv-pviz-empty">No data.</p>'; return; }
    var b = bnd(pts, { minDy: 4 });
    var s = svg(model.title);

    _grid(s, b);
    _axis(s, b);
    _ticks(s, b);

    // Ghost curve
    if (model.ghostPoints) _ghost(s, model.ghostPoints, b);

    // Positive/negative regions
    var zeroY = my(0, b);
    if (zeroY > P.t && zeroY < H - P.b) {
      var posD = 'M' + P.l + ',' + zeroY;
      pts.forEach(function (p) { posD += ' L' + mx(safe(p.x), b) + ',' + my(safe(p.y), b); });
      posD += ' L' + W - P.r + ',' + zeroY + ' Z';
      _region(s, posD, 'rgba(34,197,94,0.04)');

      var negD = 'M' + P.l + ',' + zeroY;
      pts.forEach(function (p) { negD += ' L' + mx(safe(p.x), b) + ',' + my(safe(p.y), b); });
      negD += ' L' + W - P.r + ',' + zeroY + ' Z';
      _region(s, negD, 'rgba(239,68,68,0.04)');
    }

    // Symmetry axis
    if (model.annotations) {
      var vtx = model.annotations.find(function (a) { return a.label.indexOf('vertex') !== -1; });
      if (vtx) _ref(s, mx(safe(vtx.x), b), P.t, mx(safe(vtx.x), b), H - P.b, 'rgba(6,182,212,0.15)');
    }

    // The parabola
    var path = pts.map(function (p) { return mx(safe(p.x), b) + ',' + my(safe(p.y), b); }).join(' ');
    s.appendChild(el('polyline', { points: path, fill: 'none', stroke: '#06b6d4', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));

    if (model.annotations) {
      model.annotations.forEach(function (a) {
        _ann(s, mx(safe(a.x), b), my(safe(a.y), b), a.label, { dy: -16 });
      });
    }

    _title(s, model.title);
    _tooltip(s);
    container.innerHTML = '';
    container.appendChild(s);
  }

  // ═══════════════════════════════════════════════════════════
  // SIGMOID — Regions
  // ═══════════════════════════════════════════════════════════

  function renderSigmoid(container, model) {
    var pts = model.points || [];
    if (pts.length < 2) { container.innerHTML = '<p class="nv-pviz-empty">No data.</p>'; return; }
    var b = bnd(pts, { minDy: 1.5 });
    var s = svg(model.title);

    _grid(s, b);
    _axis(s, b);

    // Ghost curve
    if (model.ghostPoints) _ghost(s, model.ghostPoints, b);

    // Regions
    var x0 = model.annotations && model.annotations[0] ? safe(model.annotations[0].x) : 0;
    var zeroY = my(0, b);

    // Activation region
    var actPts = pts.filter(function (p) { return safe(p.x) <= x0; });
    if (actPts.length > 1) {
      var actD = 'M' + mx(safe(actPts[0].x), b) + ',' + zeroY;
      actPts.forEach(function (p) { actD += ' L' + mx(safe(p.x), b) + ',' + my(safe(p.y), b); });
      actD += ' L' + mx(safe(actPts[actPts.length - 1].x), b) + ',' + zeroY + ' Z';
      _region(s, actD, 'rgba(6,182,212,0.08)');
    }

    // Saturation region
    var satPts = pts.filter(function (p) { return safe(p.x) >= x0; });
    if (satPts.length > 1) {
      var satD = 'M' + mx(safe(satPts[0].x), b) + ',' + zeroY;
      satPts.forEach(function (p) { satD += ' L' + mx(safe(p.x), b) + ',' + my(safe(p.y), b); });
      satD += ' L' + mx(safe(satPts[satPts.length - 1].x), b) + ',' + zeroY + ' Z';
      _region(s, satD, 'rgba(6,182,212,0.08)');
    }

    // Transition region
    var transPts = pts.filter(function (p) { return safe(p.x) >= x0 - 1.5 && safe(p.x) <= x0 + 1.5; });
    if (transPts.length > 1) {
      var tD = 'M' + mx(safe(transPts[0].x), b) + ',' + zeroY;
      transPts.forEach(function (p) { tD += ' L' + mx(safe(p.x), b) + ',' + my(safe(p.y), b); });
      tD += ' L' + mx(safe(transPts[transPts.length - 1].x), b) + ',' + zeroY + ' Z';
      _region(s, tD, 'rgba(34,197,94,0.12)');
    }

    // 0.5 reference
    _ref(s, P.l, my(0.5, b), W - P.r, my(0.5, b), 'rgba(138,180,248,0.08)');

    // The S-curve
    var path = pts.map(function (p) { return mx(safe(p.x), b) + ',' + my(safe(p.y), b); }).join(' ');
    s.appendChild(el('polyline', { points: path, fill: 'none', stroke: '#06b6d4', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));

    if (model.annotations) {
      model.annotations.forEach(function (a) {
        _ann(s, mx(safe(a.x), b), my(safe(a.y), b), a.label, { color: '#22c55e' });
      });
    }

    _label(s, mx(x0 - 3, b), H - P.b - 8, 'low', { fill: 'rgba(138,180,248,0.3)', size: '8' });
    _label(s, mx(x0 + 3, b), H - P.b - 8, 'high', { fill: 'rgba(138,180,248,0.3)', size: '8' });

    _title(s, model.title);
    _tooltip(s);
    container.innerHTML = '';
    container.appendChild(s);
  }

  // ═══════════════════════════════════════════════════════════
  // NORMAL DISTRIBUTION — 68-95-99.7
  // ═══════════════════════════════════════════════════════════

  function renderNormalDist(container, model) {
    var pts = model.points || [];
    if (pts.length < 2) { container.innerHTML = '<p class="nv-pviz-empty">No data.</p>'; return; }
    var b = bnd(pts, { minDy: 0.5 });
    var s = svg(model.title);

    _grid(s, b);
    _axis(s, b);

    // Ghost curve
    if (model.ghostPoints) _ghost(s, model.ghostPoints, b);

    // 68-95-99.7 regions
    if (model.annotations) {
      var mu = model.annotations.find(function (a) { return a.label.indexOf('μ') !== -1; });
      var sigma = model.annotations.find(function (a) { return a.label.indexOf('σ') !== -1; });
      if (mu && sigma) {
        var muVal = safe(mu.x), sigVal = safe(sigma.x - mu.x);
        if (sigVal > 0) {
          var zeroY = my(0, b);

          // 99.7%
          var r3 = pts.filter(function (p) { return safe(p.x) >= muVal - 3 * sigVal && safe(p.x) <= muVal + 3 * sigVal; });
          if (r3.length > 1) {
            var d3 = 'M' + mx(safe(r3[0].x), b) + ',' + zeroY;
            r3.forEach(function (p) { d3 += ' L' + mx(safe(p.x), b) + ',' + my(safe(p.y), b); });
            d3 += ' L' + mx(safe(r3[r3.length - 1].x), b) + ',' + zeroY + ' Z';
            _region(s, d3, 'rgba(6,182,212,0.06)');
          }

          // 95%
          var r2 = pts.filter(function (p) { return safe(p.x) >= muVal - 2 * sigVal && safe(p.x) <= muVal + 2 * sigVal; });
          if (r2.length > 1) {
            var d2 = 'M' + mx(safe(r2[0].x), b) + ',' + zeroY;
            r2.forEach(function (p) { d2 += ' L' + mx(safe(p.x), b) + ',' + my(safe(p.y), b); });
            d2 += ' L' + mx(safe(r2[r2.length - 1].x), b) + ',' + zeroY + ' Z';
            _region(s, d2, 'rgba(6,182,212,0.1)');
          }

          // 68%
          var r1 = pts.filter(function (p) { return safe(p.x) >= muVal - sigVal && safe(p.x) <= muVal + sigVal; });
          if (r1.length > 1) {
            var d1 = 'M' + mx(safe(r1[0].x), b) + ',' + zeroY;
            r1.forEach(function (p) { d1 += ' L' + mx(safe(p.x), b) + ',' + my(safe(p.y), b); });
            d1 += ' L' + mx(safe(r1[r1.length - 1].x), b) + ',' + zeroY + ' Z';
            _region(s, d1, 'rgba(6,182,212,0.18)');
          }

          _ref(s, mx(muVal - sigVal, b), P.t, mx(muVal - sigVal, b), H - P.b, 'rgba(138,180,248,0.1)');
          _ref(s, mx(muVal + sigVal, b), P.t, mx(muVal + sigVal, b), H - P.b, 'rgba(138,180,248,0.1)');
          _label(s, mx(muVal, b), H - P.b + 28, '68%', { fill: '#06b6d4', size: '10', weight: '600' });
        }
      }
    }

    // The bell curve
    var path = pts.map(function (p) { return mx(safe(p.x), b) + ',' + my(safe(p.y), b); }).join(' ');
    s.appendChild(el('polyline', { points: path, fill: 'none', stroke: '#06b6d4', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));

    if (model.annotations) {
      model.annotations.forEach(function (a, i) {
        _ann(s, mx(safe(a.x), b), my(safe(a.y), b), a.label, { color: i === 0 ? '#f59e0b' : '#22c55e', dy: -18 });
      });
    }

    _title(s, model.title);
    _tooltip(s);
    container.innerHTML = '';
    container.appendChild(s);
  }

  // ═══════════════════════════════════════════════════════════
  // RELU — Regions
  // ═══════════════════════════════════════════════════════════

  function renderRelu(container, model) {
    var pts = model.points || [];
    if (pts.length < 2) { container.innerHTML = '<p class="nv-pviz-empty">No data.</p>'; return; }
    var b = bnd(pts, { minDy: 2 });
    var s = svg(model.title);

    _grid(s, b);
    _axis(s, b);

    // Ghost curve
    if (model.ghostPoints) _ghost(s, model.ghostPoints, b);

    // Regions
    var threshold = model.annotations && model.annotations[0] ? safe(model.annotations[0].x) : 0;
    var zeroY = my(0, b);
    var threshX = mx(threshold, b);

    // Inactive
    if (threshX > P.l) {
      s.appendChild(el('rect', { x: P.l, y: Math.max(P.t, zeroY - 40), width: Math.max(0, threshX - P.l), height: Math.min(40, zeroY - P.t), fill: 'rgba(239,68,68,0.06)', rx: '2' }));
      _label(s, P.l + (threshX - P.l) / 2, Math.max(P.t + 10, zeroY - 44), 'inactive', { fill: 'rgba(239,68,68,0.4)', size: '8' });
    }

    // Active
    if (threshX < W - P.r) {
      s.appendChild(el('rect', { x: threshX, y: P.t, width: Math.max(0, W - P.r - threshX), height: Math.max(0, zeroY - P.t), fill: 'rgba(34,197,94,0.04)', rx: '2' }));
      _label(s, threshX + (W - P.r - threshX) / 2, P.t + 14, 'active', { fill: 'rgba(34,197,94,0.4)', size: '8' });
    }

    _ref(s, threshX, P.t, threshX, H - P.b, 'rgba(245,158,11,0.2)');

    // The ramp
    var path = pts.map(function (p) { return mx(safe(p.x), b) + ',' + my(safe(p.y), b); }).join(' ');
    s.appendChild(el('polyline', { points: path, fill: 'none', stroke: '#06b6d4', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));

    if (model.annotations) {
      model.annotations.forEach(function (a) {
        _ann(s, mx(safe(a.x), b), my(safe(a.y), b), a.label, { color: '#f59e0b' });
      });
    }

    _title(s, model.title);
    _tooltip(s);
    container.innerHTML = '';
    container.appendChild(s);
  }

  // ═══════════════════════════════════════════════════════════
  // GRADIENT DESCENT
  // ═══════════════════════════════════════════════════════════

  function renderGradientDescent(container, model) {
    var pts = model.points || [];
    if (pts.length < 2) { container.innerHTML = '<p class="nv-pviz-empty">No data.</p>'; return; }
    var b = bnd(pts, { minDy: 5 });
    var s = svg(model.title);

    _grid(s, b);
    _axis(s, b);
    _ticks(s, b);

    // Ghost curve
    if (model.ghostPoints) _ghost(s, model.ghostPoints, b);

    // Convergence region
    var convY = my(safe(pts[pts.length - 1].y), b);
    s.appendChild(el('rect', { x: P.l, y: convY - 4, width: pw(), height: 8, fill: 'rgba(34,197,94,0.08)', rx: '2' }));

    // The trajectory
    var path = pts.map(function (p) { return mx(safe(p.x), b) + ',' + my(safe(p.y), b); }).join(' ');
    s.appendChild(el('polyline', { points: path, fill: 'none', stroke: '#06b6d4', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));

    // Start/end markers
    s.appendChild(el('circle', { cx: mx(safe(pts[0].x), b), cy: my(safe(pts[0].y), b), r: '4', fill: '#f59e0b', stroke: '#0a0f1a', 'stroke-width': '1.5' }));
    s.appendChild(el('circle', { cx: mx(safe(pts[pts.length - 1].x), b), cy: my(safe(pts[pts.length - 1].y), b), r: '4', fill: '#22c55e', stroke: '#0a0f1a', 'stroke-width': '1.5' }));

    _label(s, mx(safe(pts[0].x), b) + 8, my(safe(pts[0].y), b) - 6, 'start', { fill: '#f59e0b', size: '9', anchor: 'start' });
    _label(s, mx(safe(pts[pts.length - 1].x), b) + 8, my(safe(pts[pts.length - 1].y), b) - 6, 'converged', { fill: '#22c55e', size: '9', anchor: 'start' });

    _title(s, model.title);
    _tooltip(s);
    container.innerHTML = '';
    container.appendChild(s);
  }

  // ═══════════════════════════════════════════════════════════
  // MULTI-LINE
  // ═══════════════════════════════════════════════════════════

  function renderMultiLine(container, model) {
    var allSeries = model.series || [];
    if (allSeries.length === 0) { container.innerHTML = '<p class="nv-pviz-empty">No data.</p>'; return; }
    var colors = ['#06b6d4', '#f59e0b', '#ef4444', '#22c55e'];
    var allPts = [];
    allSeries.forEach(function (s) { allPts = allPts.concat(s); });
    var b = bnd(allPts);
    var s = svg(model.title);

    _grid(s, b);
    _axis(s, b);
    _ticks(s, b);

    allSeries.forEach(function (series, idx) {
      var path = series.map(function (p) { return mx(safe(p.x), b) + ',' + my(safe(p.y), b); }).join(' ');
      s.appendChild(el('polyline', { points: path, fill: 'none', stroke: colors[idx % colors.length], 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    });

    if (model.seriesLabels) {
      model.seriesLabels.forEach(function (label, i) {
        var lx = P.l + 12;
        var ly = P.t + 14 + i * 14;
        s.appendChild(el('line', { x1: lx, y1: ly, x2: lx + 14, y2: ly, stroke: colors[i % colors.length], 'stroke-width': '1.5', 'stroke-linecap': 'round' }));
        var t = el('text', { x: lx + 20, y: ly + 3, fill: 'rgba(167,183,200,0.5)', 'font-size': '8.5', 'font-family': F.mono });
        t.textContent = label;
        s.appendChild(t);
      });
    }

    _title(s, model.title);
    _tooltip(s);
    container.innerHTML = '';
    container.appendChild(s);
  }

  // ═══════════════════════════════════════════════════════════
  // BAR CHART
  // ═══════════════════════════════════════════════════════════

  function renderBarChart(container, model) {
    var bars = model.bars || [];
    if (bars.length === 0) { container.innerHTML = '<p class="nv-pviz-empty">No data.</p>'; return; }
    var vals = bars.map(function (b) { return safe(b.value); });
    var maxV = Math.max.apply(null, vals.map(Math.abs)) || 1;
    var s = svg(model.title);

    _axis(s, { x0: 0, x1: 1, y0: 0, y1: maxV, dx: 1, dy: maxV });

    var barW = Math.min(pw() / (bars.length * 1.4), 52);
    var gap = (pw() - barW * bars.length) / (bars.length + 1);

    bars.forEach(function (bar, i) {
      var barH = (Math.abs(safe(bar.value)) / maxV) * ph() * 0.85;
      var x = P.l + gap + i * (barW + gap);
      var y = P.t + ph() - barH;
      s.appendChild(el('rect', { x: x, y: y, width: barW, height: barH, fill: '#06b6d4', opacity: '0.6', rx: '2' }));
      var vt = el('text', { x: x + barW / 2, y: y - 5, fill: 'rgba(167,183,200,0.4)', 'font-size': '8', 'text-anchor': 'middle', 'font-family': F.mono });
      vt.textContent = fmtSmart(safe(bar.value));
      s.appendChild(vt);
      var lt = el('text', { x: x + barW / 2, y: H - P.b + 14, fill: 'rgba(138,180,248,0.25)', 'font-size': '8', 'text-anchor': 'middle', 'font-family': F.mono, transform: bar.label.length > 5 ? 'rotate(-25, ' + (x + barW / 2) + ', ' + (H - P.b + 14) + ')' : '' });
      lt.textContent = bar.label;
      s.appendChild(lt);
    });

    _title(s, model.title);
    container.innerHTML = '';
    container.appendChild(s);
  }

  // ═══════════════════════════════════════════════════════════
  // SCATTER
  // ═══════════════════════════════════════════════════════════

  function renderScatter(container, model) {
    var pts = model.points || [];
    if (pts.length === 0) { container.innerHTML = '<p class="nv-pviz-empty">No data.</p>'; return; }
    var b = bnd(pts);
    var s = svg(model.title);

    _grid(s, b);
    _axis(s, b);
    _ticks(s, b);

    if (model.lines) {
      model.lines.forEach(function (l) {
        s.appendChild(el('line', { x1: mx(safe(l.from.x), b), y1: my(safe(l.from.y), b), x2: mx(safe(l.to.x), b), y2: my(safe(l.to.y), b), stroke: l.color || '#06b6d4', 'stroke-width': '2', 'stroke-linecap': 'round' }));
      });
    }

    if (model.boundaryLine) {
      var bl = model.boundaryLine;
      var bx1 = b.x0, by1 = safe(bl.slope) * bx1 + safe(bl.intercept);
      var bx2 = b.x1, by2 = safe(bl.slope) * bx2 + safe(bl.intercept);
      s.appendChild(el('line', { x1: mx(bx1, b), y1: my(by1, b), x2: mx(bx2, b), y2: my(by2, b), stroke: '#ef4444', 'stroke-width': '1.5', 'stroke-dasharray': '6 3', opacity: '0.6' }));
    }

    pts.forEach(function (p) {
      if (p.isQuery || p.isNeighbor) return;
      var c = p.color || (model.colors && model.colors[p.cluster || 0]) || '#06b6d4';
      s.appendChild(el('circle', { cx: mx(safe(p.x), b), cy: my(safe(p.y), b), r: 2.5, fill: c, opacity: '0.45' }));
    });
    pts.forEach(function (p) {
      if (!p.isNeighbor) return;
      var c = p.color || (model.colors && model.colors[p.cluster || 0]) || '#06b6d4';
      s.appendChild(el('circle', { cx: mx(safe(p.x), b), cy: my(safe(p.y), b), r: 4, fill: c, stroke: '#ffffff', 'stroke-width': '1' }));
    });
    pts.forEach(function (p) {
      if (!p.isQuery) return;
      s.appendChild(el('circle', { cx: mx(safe(p.x), b), cy: my(safe(p.y), b), r: 5, fill: '#f59e0b', stroke: '#080c14', 'stroke-width': '1.5' }));
    });

    if (model.annotations) {
      model.annotations.forEach(function (a) {
        _ann(s, mx(safe(a.x), b), my(safe(a.y), b), a.label);
      });
    }

    _title(s, model.title);
    _tooltip(s);
    container.innerHTML = '';
    container.appendChild(s);
  }

  // ═══════════════════════════════════════════════════════════
  // HEATMAP
  // ═══════════════════════════════════════════════════════════

  function renderHeatmap(container, model) {
    var matrices = model.matrices || [];
    if (matrices.length === 0) { container.innerHTML = '<p class="nv-pviz-empty">No data.</p>'; return; }
    var html = '<div class="nv-pviz-heatmap-wrapper">';
    if (model.title) html += '<h4 class="nv-pviz-chart-title">' + esc(model.title) + '</h4>';
    matrices.forEach(function (matrix, mi) {
      if (!matrix || !matrix.length) return;
      if (model.matrixLabels && model.matrixLabels[mi]) html += '<h5 class="nv-pviz-heatmap-subtitle">' + esc(model.matrixLabels[mi]) + '</h5>';
      var rows = matrix.length, cols = matrix[0].length;
      var flat = [];
      matrix.forEach(function (r) { r.forEach(function (c) { flat.push(safe(c)); }); });
      var minV = Math.min.apply(null, flat), maxV = Math.max.apply(null, flat);
      var range = maxV - minV || 1;
      html += '<div class="nv-pviz-heatmap-grid" style="grid-template-columns: auto repeat(' + cols + ', 1fr);">';
      html += '<div class="nv-pviz-heatmap-cell nv-pviz-heatmap-header"></div>';
      for (var ch = 0; ch < cols; ch++) html += '<div class="nv-pviz-heatmap-cell nv-pviz-heatmap-header">' + esc((model.colLabels && model.colLabels[ch]) || String(ch)) + '</div>';
      matrix.forEach(function (row, ri) {
        html += '<div class="nv-pviz-heatmap-cell nv-pviz-heatmap-header">' + esc((model.rowLabels && model.rowLabels[ri]) || String(ri)) + '</div>';
        row.forEach(function (val, ci) {
          var norm = (safe(val) - minV) / range;
          html += '<div class="nv-pviz-heatmap-cell" style="background-color: rgba(6,182,212,' + (0.08 + norm * 0.92) + ');" title="' + esc(((model.rowLabels && model.rowLabels[ri]) || ri) + ' → ' + ((model.colLabels && model.colLabels[ci]) || ci) + ': ' + safe(val).toFixed(4)) + '"><span>' + safe(val).toFixed(3) + '</span></div>';
        });
      });
      html += '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════
  // CONFUSION MATRIX
  // ═══════════════════════════════════════════════════════════

  function renderConfusionMatrix(container, model) {
    var html = '<div class="nv-pviz-confusion-wrapper">';
    if (model.title) html += '<h4 class="nv-pviz-chart-title">' + esc(model.title) + '</h4>';
    var matrix = model.matrix || [[0, 0], [0, 0]];
    var maxV = Math.max.apply(null, matrix.flat());
    html += '<div class="nv-pviz-confusion-grid">';
    html += '<div class="nv-pviz-confusion-cell nv-pviz-confusion-corner"></div>';
    (model.colLabels || []).forEach(function (l) { html += '<div class="nv-pviz-confusion-cell nv-pviz-confusion-col-header">' + esc(l) + '</div>'; });
    matrix.forEach(function (row, ri) {
      html += '<div class="nv-pviz-confusion-cell nv-pviz-confusion-row-header">' + esc((model.rowLabels && model.rowLabels[ri]) || String(ri)) + '</div>';
      row.forEach(function (val, ci) {
        var norm = maxV > 0 ? val / maxV : 0;
        html += '<div class="nv-pviz-confusion-cell nv-pviz-confusion-value" style="background-color: ' + (ri === ci ? 'rgba(6,182,212,' + (0.2 + norm * 0.6) + ')' : 'rgba(239,68,68,' + (0.1 + norm * 0.5) + ')') + ';"><span class="nv-pviz-confusion-number">' + val + '</span></div>';
      });
    });
    html += '</div>';
    if (model.metrics) {
      var m = model.metrics;
      html += '<div class="nv-pviz-metrics">';
      html += '<div class="nv-pviz-metric-item"><span class="nv-pviz-metric-label">Accuracy:</span><span class="nv-pviz-metric-value">' + (safe(m.accuracy) * 100).toFixed(2) + '%</span></div>';
      html += '<div class="nv-pviz-metric-item"><span class="nv-pviz-metric-label">Precision:</span><span class="nv-pviz-metric-value">' + (safe(m.precision) * 100).toFixed(2) + '%</span></div>';
      html += '<div class="nv-pviz-metric-item"><span class="nv-pviz-metric-label">Recall:</span><span class="nv-pviz-metric-value">' + (safe(m.recall) * 100).toFixed(2) + '%</span></div>';
      html += '<div class="nv-pviz-metric-item"><span class="nv-pviz-metric-label">F1 Score:</span><span class="nv-pviz-metric-value">' + (safe(m.f1Score) * 100).toFixed(2) + '%</span></div>';
      html += '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════
  // OVERLAY — Multiple curves on one chart
  // ═══════════════════════════════════════════════════════════

  var OVERLAY_COLORS = ['#06b6d4', '#f59e0b', '#ef4444', '#22c55e', '#a855f7'];

  function renderOverlay(container, model) {
    var overlays = model.overlays || [];
    if (overlays.length === 0) { container.innerHTML = '<p class="nv-pviz-empty">No data.</p>'; return; }

    // Compute combined bounds
    var allPts = [];
    overlays.forEach(function (o) { if (o.points) allPts = allPts.concat(o.points); });
    var b = bnd(allPts);
    var s = svg(model.title);

    _grid(s, b);
    _axis(s, b);
    _ticks(s, b);

    // Render each overlay curve
    overlays.forEach(function (overlay, idx) {
      var pts = overlay.points || [];
      if (pts.length < 2) return;
      var color = overlay.color || OVERLAY_COLORS[idx % OVERLAY_COLORS.length];
      var path = pts.map(function (p) { return mx(safe(p.x), b) + ',' + my(safe(p.y), b); }).join(' ');
      s.appendChild(el('polyline', {
        points: path, fill: 'none', stroke: color,
        'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        opacity: overlay.opacity || '1'
      }));
    });

    // Legend
    var legendY = P.t + 8;
    overlays.forEach(function (overlay, idx) {
      var color = overlay.color || OVERLAY_COLORS[idx % OVERLAY_COLORS.length];
      var lx = P.l + 8;
      var ly = legendY + idx * 16;
      s.appendChild(el('line', { x1: lx, y1: ly, x2: lx + 14, y2: ly, stroke: color, 'stroke-width': '1.5', 'stroke-linecap': 'round' }));
      var t = el('text', { x: lx + 20, y: ly + 3, fill: 'rgba(167,183,200,0.5)', 'font-size': '8.5', 'font-family': F.mono });
      t.textContent = overlay.label || ('Curve ' + (idx + 1));
      s.appendChild(t);
    });

    _title(s, model.title);
    _tooltip(s);
    container.innerHTML = '';
    container.appendChild(s);
  }

  // ═══════════════════════════════════════════════════════════
  // Main Render
  // ═══════════════════════════════════════════════════════════

  function renderVisualization(container, model) {
    if (!container || !model) return;
    switch (model.type) {
      case 'line-plot': renderLinear(container, model); break;
      case 'multi-line': renderMultiLine(container, model); break;
      case 'overlay': renderOverlay(container, model); break;
      case 'bar-chart': renderBarChart(container, model); break;
      case 'scatter-plot': renderScatter(container, model); break;
      case 'heatmap': renderHeatmap(container, model); break;
      case 'confusion-matrix': renderConfusionMatrix(container, model); break;
      case 'matrix': renderLinear(container, model); break;
      default: renderLinear(container, model); break;
    }
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.VizRenderer = {
    render: renderVisualization,
    renderOverlay: renderOverlay,
    renderLinePlot: renderLinear,
    renderMultiLinePlot: renderMultiLine,
    renderBarChart: renderBarChart,
    renderScatterPlot: renderScatter,
    renderHeatmap: renderHeatmap,
    renderConfusionMatrix: renderConfusionMatrix
  };
})();
