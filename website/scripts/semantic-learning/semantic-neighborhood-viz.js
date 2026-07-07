/**
 * Semantic Learning Intelligence — Neighborhood Visualization
 * Local radial neighborhood diagram for semantic concepts.
 * Canvas 2D, deterministic positioning, lightweight interaction.
 *
 * NV-1100 Phase 3
 */
(function () {
  'use strict';

  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  var COLORS = {
    centerFill: '#1a3848',
    centerStroke: '#4a8aaa',
    centerGlow: 'rgba(42,82,108,0.25)',
    centerGlowOuter: 'rgba(42,82,108,0.08)',
    prereqFill: '#121e2a',
    prereqStroke: '#3a7a96',
    prereqGlow: 'rgba(42,102,128,0.15)',
    prereqLine: 'rgba(42,102,128,0.18)',
    relatedFill: '#101a22',
    relatedStroke: '#4a8aaa',
    relatedGlow: 'rgba(42,102,128,0.12)',
    relatedLine: 'rgba(42,102,128,0.14)',
    depFill: '#0e1a18',
    depStroke: '#4a9a7a',
    depGlow: 'rgba(42,122,98,0.12)',
    depLine: 'rgba(42,122,98,0.14)',
    recFill: '#1a1812',
    recStroke: '#9a8a5a',
    recGlow: 'rgba(142,128,58,0.1)',
    recLine: 'rgba(142,128,58,0.1)',
    hoverStroke: '#c0d0d8',
    hoverGlow: 'rgba(160,184,200,0.15)',
    textPrimary: '#c0d0d8',
    textSecondary: '#6a7a86',
    ringGuide: 'rgba(90,110,130,0.06)',
    labelText: '#c0d0d8',
    labelTextBg: 'rgba(8,12,18,0.92)',
    focusRing: '#4a8aaa'
  };

  var RING_RADII = {
    prereq: 0.28,
    related: 0.48,
    dependent: 0.66,
    recommendation: 0.82
  };

  var RING_LABELS = {
    prereq: 'Prerequisites',
    related: 'Related',
    dependent: 'Dependents',
    recommendation: 'Recommendations'
  };

  var NODE_RADIUS = { center: 7, neighbor: 5 };
  var HIT_RADIUS = 14;
  var EDGE_LABELS = {
    prereq: 'Prerequisite',
    related: 'Related',
    dependent: 'Dependent',
    recommendation: 'Recommended'
  };
  var OPACITY_TIERS = {
    center: 1,
    prereq: 0.8,
    related: 0.8,
    dependent: 0.6,
    recommendation: 0.45
  };

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max - 1) + '\u2026' : str;
  }

  function getEngine() {
    return window.NeuralVerse?.SemanticEngine || null;
  }

  function getNeighborhood() {
    return window.NeuralVerse?.SemanticNeighborhood || null;
  }

  function getRecs() {
    return window.NeuralVerse?.RecommendationEngine || null;
  }

  function createSemanticNeighborhoodViz(options) {
    var container = (options && options.root) || document;
    var _canvas = null;
    var _ctx = null;
    var _nodes = [];
    var _edges = [];
    var _centerConcept = null;
    var _hoveredIndex = -1;
    var _focusedIndex = -1;
    var _width = 0;
    var _height = 0;
    var _animFrame = null;
    var _tooltip = null;
    var _onConceptSelect = null;
    var _listeners = [];
    var _reducedMotion = false;
    var _destroyed = false;

    if (options && typeof options.onConceptSelect === 'function') {
      _onConceptSelect = options.onConceptSelect;
    }

    function addListener(el, event, handler) {
      if (!el) return;
      el.addEventListener(event, handler);
      _listeners.push({ el: el, event: event, handler: handler });
    }

    function clearListeners() {
      for (var i = 0; i < _listeners.length; i++) {
        _listeners[i].el.removeEventListener(_listeners[i].event, _listeners[i].handler);
      }
      _listeners = [];
    }

    function checkReducedMotion() {
      if (window.matchMedia) {
        _reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
    }

    function buildModel(conceptId) {
      var engine = getEngine();
      var neighborhood = getNeighborhood();
      var recs = getRecs();
      if (!engine || !neighborhood) return null;

      var concept = engine.getConcept(conceptId);
      if (!concept) return null;

      var nh = neighborhood.getNeighborhood(conceptId, 2);
      var recommendations = recs ? recs.getRecommendations(conceptId) : null;

      var nodes = [];
      var edges = [];

      // Center node
      nodes.push({
        id: concept.id,
        name: concept.name,
        ring: 'center',
        angle: 0,
        radius: 0,
        x: 0,
        y: 0,
        category: concept.category,
        relationshipType: 'selected'
      });

      // Categorize neighbors
      var prereqs = [];
      var related = [];
      var deps = [];
      var recItems = [];

      if (nh && nh.neighbors) {
        for (var i = 0; i < nh.neighbors.length; i++) {
          var n = nh.neighbors[i];
          if (n.kind !== 'concept') continue;
          if (n.relationshipType === 'prerequisite') prereqs.push(n);
          else if (n.relationshipType === 'dependent') deps.push(n);
          else related.push(n);
        }
      }

      if (recommendations && recommendations.categories) {
        var cats = recommendations.categories;
        var catKeys = ['relatedConcepts', 'dependentConcepts', 'prerequisites'];
        var recSeen = {};
        for (var ci = 0; ci < catKeys.length; ci++) {
          var items = cats[catKeys[ci]] || [];
          for (var ri = 0; ri < items.length; ri++) {
            if (!recSeen[items[ri].id] && items[ri].id !== conceptId) {
              recSeen[items[ri].id] = true;
              var alreadyInRing = false;
              for (var pi = 0; pi < prereqs.length; pi++) {
                if (prereqs[pi].id === items[ri].id) { alreadyInRing = true; break; }
              }
              if (!alreadyInRing) {
                for (var di = 0; di < deps.length; di++) {
                  if (deps[di].id === items[ri].id) { alreadyInRing = true; break; }
                }
              }
              if (!alreadyInRing) {
                for (var si = 0; si < related.length; si++) {
                  if (related[si].id === items[ri].id) { alreadyInRing = true; break; }
                }
              }
              if (!alreadyInRing) recItems.push(items[ri]);
            }
          }
        }
      }

      function placeRing(items, ring, startAngle) {
        var count = items.length;
        if (count === 0) return;
        var step = (Math.PI * 2) / count;
        for (var i = 0; i < count; i++) {
          var angle = startAngle + step * i;
          nodes.push({
            id: items[i].id,
            name: items[i].name,
            ring: ring,
            angle: angle,
            category: items[i].category || '',
            relationshipType: items[i].relationshipType || ring
          });
          edges.push({
            from: 0,
            to: nodes.length - 1,
            ring: ring
          });
        }
      }

      placeRing(prereqs, 'prereq', -Math.PI / 2);
      placeRing(related, 'related', 0);
      placeRing(deps, 'dependent', Math.PI / 2);
      placeRing(recItems.slice(0, 5), 'recommendation', Math.PI);

      return {
        concept: concept,
        nodes: nodes,
        edges: edges,
        totalNeighbors: nodes.length - 1
      };
    }

    function positionNodes(model) {
      if (!model) return;
      var cx = _width / 2;
      var cy = _height / 2;
      var minDim = Math.min(_width, _height);
      var baseRadius = minDim * 0.42;

      for (var i = 0; i < model.nodes.length; i++) {
        var node = model.nodes[i];
        if (node.ring === 'center') {
          node.x = cx;
          node.y = cy;
        } else {
          var r = baseRadius * (RING_RADII[node.ring] || 0.5);
          node.x = cx + Math.cos(node.angle) * r;
          node.y = cy + Math.sin(node.angle) * r;
        }
      }
    }

    function hitTest(mx, my) {
      for (var i = _nodes.length - 1; i >= 0; i--) {
        var dx = mx - _nodes[i].x;
        var dy = my - _nodes[i].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var threshold = _nodes[i].ring === 'center' ? HIT_RADIUS + 4 : HIT_RADIUS;
        if (dist <= threshold) return i;
      }
      return -1;
    }

    function drawRingGuides() {
      var cx = _width / 2;
      var cy = _height / 2;
      var minDim = Math.min(_width, _height);
      var baseRadius = minDim * 0.42;
      var rings = ['prereq', 'related', 'dependent', 'recommendation'];

      _ctx.setLineDash([2, 4]);
      _ctx.lineWidth = 0.5;
      _ctx.strokeStyle = COLORS.ringGuide;

      for (var i = 0; i < rings.length; i++) {
        var r = baseRadius * RING_RADII[rings[i]];
        _ctx.beginPath();
        _ctx.arc(cx, cy, r, 0, Math.PI * 2);
        _ctx.stroke();
      }
      _ctx.setLineDash([]);
    }

    function drawRingLabels() {
      var cx = _width / 2;
      var cy = _height / 2;
      var minDim = Math.min(_width, _height);
      var baseRadius = minDim * 0.42;
      var rings = ['prereq', 'related', 'dependent', 'recommendation'];

      _ctx.font = '500 10px Inter, system-ui, sans-serif';
      _ctx.textAlign = 'left';
      _ctx.textBaseline = 'middle';

      for (var i = 0; i < rings.length; i++) {
        var r = baseRadius * RING_RADII[rings[i]];
        var lx = cx + r + 6;
        var ly = cy - r * 0.3;
        if (lx + 80 > _width) lx = cx - r - 80;
        if (ly < 20) ly = 20;

        _ctx.fillStyle = COLORS.textSecondary;
        _ctx.fillText(RING_LABELS[rings[i]], lx, ly);
      }
    }

    function drawEdge(edge, model) {
      var from = model.nodes[edge.from];
      var to = model.nodes[edge.to];
      var isHoveredEdge = _hoveredIndex === edge.to || _hoveredIndex === edge.from;
      var tier = OPACITY_TIERS[edge.ring] || 0.6;

      _ctx.beginPath();
      _ctx.moveTo(from.x, from.y);

      // Subtle curve toward center for premium feel
      var mx = (from.x + to.x) / 2;
      var my = (from.y + to.y) / 2;
      var cx = _width / 2;
      var cy = _height / 2;
      var cpx = mx + (cx - mx) * 0.15;
      var cpy = my + (cy - my) * 0.15;
      _ctx.quadraticCurveTo(cpx, cpy, to.x, to.y);

      _ctx.strokeStyle = COLORS[edge.ring + 'Line'] || COLORS.relatedLine;
      _ctx.lineWidth = isHoveredEdge ? 1.5 : 0.8;
      _ctx.globalAlpha = isHoveredEdge ? 1 : tier * 0.6;
      _ctx.stroke();
      _ctx.globalAlpha = 1;

      // Edge relationship label on hover
      if (isHoveredEdge && EDGE_LABELS[edge.ring]) {
        var labelX = cpx;
        var labelY = cpy;
        _ctx.font = '500 9px Inter, system-ui, sans-serif';
        var tw = _ctx.measureText(EDGE_LABELS[edge.ring]).width;
        var pad = 4;

        _ctx.fillStyle = 'rgba(15,23,42,0.85)';
        _ctx.beginPath();
        _ctx.roundRect(labelX - tw / 2 - pad, labelY - 7, tw + pad * 2, 14, 3);
        _ctx.fill();

        _ctx.fillStyle = COLORS[edge.ring + 'Stroke'] || COLORS.textSecondary;
        _ctx.textAlign = 'center';
        _ctx.textBaseline = 'middle';
        _ctx.fillText(EDGE_LABELS[edge.ring], labelX, labelY);
      }
    }

    function drawNode(node, index) {
      var isHovered = index === _hoveredIndex;
      var isFocused = index === _focusedIndex;
      var isCenter = node.ring === 'center';
      var radius = isCenter ? NODE_RADIUS.center : NODE_RADIUS.neighbor;
      var tier = OPACITY_TIERS[node.ring] || 0.6;

      // Outer glow for center — double ring for premium pulse feel
      if (isCenter) {
        _ctx.beginPath();
        _ctx.arc(node.x, node.y, radius + 14, 0, Math.PI * 2);
        _ctx.fillStyle = COLORS.centerGlowOuter;
        _ctx.fill();

        _ctx.beginPath();
        _ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2);
        _ctx.fillStyle = COLORS.centerGlow;
        _ctx.fill();

        // Pulse ring (faint, static — communicates active selection)
        _ctx.beginPath();
        _ctx.arc(node.x, node.y, radius + 18, 0, Math.PI * 2);
        _ctx.strokeStyle = COLORS.centerStroke;
        _ctx.globalAlpha = 0.15;
        _ctx.lineWidth = 1;
        _ctx.stroke();
        _ctx.globalAlpha = 1;
      }

      // Node glow on hover
      if (isHovered && !isCenter) {
        var glowColor = COLORS[node.ring + 'Glow'] || COLORS.relatedGlow;
        _ctx.beginPath();
        _ctx.arc(node.x, node.y, radius + 6, 0, Math.PI * 2);
        _ctx.fillStyle = glowColor;
        _ctx.fill();
      }

      // Focus ring
      if (isFocused) {
        _ctx.beginPath();
        _ctx.arc(node.x, node.y, radius + 5, 0, Math.PI * 2);
        _ctx.strokeStyle = COLORS.focusRing;
        _ctx.lineWidth = 2;
        _ctx.stroke();
      }

      // Node circle with opacity tier
      var fillColor = isCenter ? COLORS.centerFill : (COLORS[node.ring + 'Fill'] || COLORS.relatedFill);
      var strokeColor = isCenter ? COLORS.centerStroke : (COLORS[node.ring + 'Stroke'] || COLORS.relatedStroke);

      _ctx.globalAlpha = isCenter || isHovered ? 1 : tier;
      _ctx.beginPath();
      _ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      _ctx.fillStyle = fillColor;
      _ctx.fill();

      if (isHovered) {
        _ctx.strokeStyle = COLORS.hoverStroke;
        _ctx.lineWidth = 2;
        _ctx.shadowColor = COLORS.hoverGlow;
        _ctx.shadowBlur = 8;
      } else {
        _ctx.strokeStyle = strokeColor;
        _ctx.lineWidth = 1.5;
        _ctx.shadowColor = 'transparent';
        _ctx.shadowBlur = 0;
      }
      _ctx.stroke();
      _ctx.shadowColor = 'transparent';
      _ctx.shadowBlur = 0;
      _ctx.globalAlpha = 1;

      // Label with premium pill
      if (isCenter || isHovered || isFocused) {
        var label = truncate(node.name, isCenter ? 30 : 20);
        _ctx.font = (isCenter ? '600 11px' : '500 10px') + ' Inter, system-ui, sans-serif';
        var textW = _ctx.measureText(label).width;
        var padX = 8;
        var padY = 3;
        var lx = node.x - textW / 2 - padX;
        var ly = node.y + radius + 10;

        // Background pill with subtle border
        _ctx.fillStyle = COLORS.labelTextBg;
        _ctx.beginPath();
        _ctx.roundRect(lx, ly - padY - 8, textW + padX * 2, 18, 4);
        _ctx.fill();

        // Subtle accent underline for center
        if (isCenter) {
          _ctx.fillStyle = COLORS.centerStroke;
          _ctx.globalAlpha = 0.4;
          _ctx.fillRect(lx + 4, ly + padY + 7, textW + padX * 2 - 8, 1);
          _ctx.globalAlpha = 1;
        }

        _ctx.fillStyle = isCenter ? COLORS.centerStroke : COLORS.labelText;
        _ctx.textAlign = 'center';
        _ctx.textBaseline = 'middle';
        _ctx.fillText(label, node.x, ly + 1);
      }
    }

    function render() {
      if (_destroyed || !_ctx) return;

      var prefersReduced = _reducedMotion;
      if (!prefersReduced) checkReducedMotion();

      _ctx.clearRect(0, 0, _width, _height);

      if (!_centerConcept) {
        _ctx.font = '400 13px Inter, system-ui, sans-serif';
        _ctx.fillStyle = COLORS.textSecondary;
        _ctx.textAlign = 'center';
        _ctx.textBaseline = 'middle';
        _ctx.fillText('Select a concept to visualize its semantic neighborhood', _width / 2, _height / 2);
        return;
      }

      drawRingGuides();
      drawRingLabels();

      for (var i = 0; i < _edges.length; i++) {
        drawEdge(_edges[i], { nodes: _nodes });
      }

      for (var i = 0; i < _nodes.length; i++) {
        drawNode(_nodes[i], i);
      }
    }

    function scheduleRender() {
      if (_animFrame) cancelAnimationFrame(_animFrame);
      _animFrame = requestAnimationFrame(render);
    }

    function resizeCanvas() {
      if (!_canvas || !_canvas.parentElement) return;
      var rect = _canvas.parentElement.getBoundingClientRect();
      _width = rect.width;
      _height = rect.height;
      _canvas.width = _width * DPR;
      _canvas.height = _height * DPR;
      _canvas.style.width = _width + 'px';
      _canvas.style.height = _height + 'px';
      _ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      if (_centerConcept) {
        positionNodes({ nodes: _nodes });
      }
      scheduleRender();
    }

    function showTooltip(node, x, y) {
      if (!_tooltip) {
        _tooltip = document.createElement('div');
        _tooltip.className = 'nv-sem-viz-tooltip';
        _tooltip.setAttribute('role', 'tooltip');
        _tooltip.hidden = true;
        container.appendChild(_tooltip);
      }

      var ringLabel = RING_LABELS[node.ring] || node.ring;
      var relLabel = node.relationshipType === 'selected' ? 'Selected concept' : ringLabel;
      _tooltip.innerHTML = '<strong>' + escapeHtml(node.name) + '</strong><br>' +
        '<span class="nv-sem-viz-tooltip__rel">' + escapeHtml(relLabel) + '</span>' +
        (node.category ? '<br><span class="nv-sem-viz-tooltip__cat">' + escapeHtml(node.category) + '</span>' : '');

      var tipW = 180;
      var tipH = 60;
      var tx = x + 12;
      var ty = y - tipH / 2;
      if (tx + tipW > _width) tx = x - tipW - 12;
      if (ty < 4) ty = 4;
      if (ty + tipH > _height) ty = _height - tipH - 4;

      _tooltip.style.left = tx + 'px';
      _tooltip.style.top = ty + 'px';
      _tooltip.hidden = false;
    }

    function hideTooltip() {
      if (_tooltip) _tooltip.hidden = true;
    }

    function onMouseMove(e) {
      var rect = _canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var idx = hitTest(mx, my);

      if (idx !== _hoveredIndex) {
        _hoveredIndex = idx;
        scheduleRender();
      }

      if (idx >= 0) {
        _canvas.style.cursor = 'pointer';
        showTooltip(_nodes[idx], mx, my);
      } else {
        _canvas.style.cursor = 'default';
        hideTooltip();
      }
    }

    function onMouseLeave() {
      _hoveredIndex = -1;
      hideTooltip();
      scheduleRender();
    }

    function onClick(e) {
      var rect = _canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var idx = hitTest(mx, my);

      if (idx >= 0 && idx !== 0 && _onConceptSelect) {
        _onConceptSelect(_nodes[idx].id);
      }
    }

    function onKeyDown(e) {
      if (!_centerConcept) return;

      var focusableCount = _nodes.length;
      if (focusableCount === 0) return;

      if (e.key === 'Escape') {
        _focusedIndex = 0;
        scheduleRender();
        e.preventDefault();
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        if (_focusedIndex >= 0 && _focusedIndex !== 0 && _onConceptSelect) {
          _onConceptSelect(_nodes[_focusedIndex].id);
        }
        e.preventDefault();
        return;
      }

      var step = 0;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') step = 1;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') step = -1;

      if (step !== 0) {
        _focusedIndex = (_focusedIndex + step + focusableCount) % focusableCount;
        scheduleRender();
        e.preventDefault();
      }
    }

    function renderViz(conceptId) {
      var model = buildModel(conceptId);
      if (!model) {
        _centerConcept = null;
        _nodes = [];
        _edges = [];
        scheduleRender();
        return;
      }

      _centerConcept = model.concept;
      _nodes = model.nodes;
      _edges = model.edges;
      _hoveredIndex = -1;
      _focusedIndex = 0;

      positionNodes({ nodes: _nodes });
      scheduleRender();

      // Update accessibility summary
      updateA11ySummary(model);
    }

    function updateA11ySummary(model) {
      var summaryEl = container.querySelector('.nv-sem-viz-a11y-summary');
      if (!summaryEl) return;

      var parts = [];
      parts.push('Semantic neighborhood for ' + model.concept.name + '.');

      var prereqCount = 0;
      var relCount = 0;
      var depCount = 0;
      var recCount = 0;

      for (var i = 1; i < model.nodes.length; i++) {
        var n = model.nodes[i];
        if (n.ring === 'prereq') prereqCount++;
        else if (n.ring === 'related') relCount++;
        else if (n.ring === 'dependent') depCount++;
        else if (n.ring === 'recommendation') recCount++;
      }

      if (prereqCount > 0) parts.push(prereqCount + ' prerequisite' + (prereqCount > 1 ? 's' : '') + '.');
      if (relCount > 0) parts.push(relCount + ' related concept' + (relCount > 1 ? 's' : '') + '.');
      if (depCount > 0) parts.push(depCount + ' dependent' + (depCount > 1 ? 's' : '') + '.');
      if (recCount > 0) parts.push(recCount + ' recommendation' + (recCount > 1 ? 's' : '') + '.');

      summaryEl.textContent = parts.join(' ');
    }

    function destroy() {
      _destroyed = true;
      if (_animFrame) cancelAnimationFrame(_animFrame);
      clearListeners();
      hideTooltip();
      if (_tooltip && _tooltip.parentElement) _tooltip.parentElement.removeChild(_tooltip);
      _tooltip = null;
      _canvas = null;
      _ctx = null;
      _nodes = [];
      _edges = [];
      _centerConcept = null;
    }

    function mount(canvasEl) {
      if (!canvasEl) return;
      _canvas = canvasEl;
      _ctx = canvasEl.getContext('2d');

      addListener(_canvas, 'mousemove', onMouseMove);
      addListener(_canvas, 'mouseleave', onMouseLeave);
      addListener(_canvas, 'click', onClick);
      addListener(_canvas, 'keydown', onKeyDown);

      var ro = new ResizeObserver(resizeCanvas);
      ro.observe(_canvas.parentElement);
      addListener(_canvas.parentElement, 'resize', resizeCanvas);

      checkReducedMotion();
      resizeCanvas();
    }

    return {
      mount: mount,
      renderViz: renderViz,
      destroy: destroy,
      resizeCanvas: resizeCanvas
    };
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createSemanticNeighborhoodViz = createSemanticNeighborhoodViz;
})();
