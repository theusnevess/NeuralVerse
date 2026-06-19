/**
 * NeuralVerse Canvas Neural Galaxy Background — NV-600.8-R4
 * ==========================================================
 * Dense Canvas 2D neural field inspired by Galaxy-style ambience.
 * No dependencies. No domain state. No graph/retrieval coupling.
 */
(function () {
  'use strict';

  var CANVAS_ID = 'nv-neural-galaxy-canvas';
  var TARGET_FPS = 24;
  var FRAME_INTERVAL = 1000 / TARGET_FPS;
  var MAX_DPR = 2;
  var CONNECTION_UPDATE_MS = 260;
  var RESIZE_DEBOUNCE_MS = 180;
  var MAX_DEGREE = 2;
  var CONNECTED_NODE_TARGET = 0.28;
  var MAX_PULSES = 2;
  var PULSE_MIN_MS = 6000;
  var PULSE_MAX_MS = 14000;
  var PULSE_DURATION_MIN_MS = 700;
  var PULSE_DURATION_MAX_MS = 1100;

  var PROFILE = {
    landing: { density: 1.15, opacity: 1.0, motion: 1.0, maxDistance: 110 },
    home: { density: 1.0, opacity: 0.9, motion: 0.9, maxDistance: 104 },
    learning: { density: 0.85, opacity: 0.8, motion: 0.8, maxDistance: 96 },
    modules: { density: 0.8, opacity: 0.75, motion: 0.75, maxDistance: 92 },
    content: { density: 0.8, opacity: 0.75, motion: 0.75, maxDistance: 92 },
    workspace: { density: 0.55, opacity: 0.55, motion: 0.5, maxDistance: 84 },
    retrieval: { density: 0.35, opacity: 0.4, motion: 0.35, maxDistance: 78 },
    presentation: { density: 0.25, opacity: 0.3, motion: 0.2, maxDistance: 74 },
    settings: { density: 0.15, opacity: 0.2, motion: 0, maxDistance: 70 },
    default: { density: 0.82, opacity: 0.78, motion: 0.78, maxDistance: 94 }
  };

  var MIN_BY_WIDTH = [
    { width: 1440, min: 320 },
    { width: 1024, min: 240 },
    { width: 768, min: 160 },
    { width: 0, min: 80 }
  ];

  var canvas;
  var ctx;
  var width = 0;
  var height = 0;
  var dpr = 1;
  var nodes = [];
  var edges = [];
  var pulses = [];
  var profile = 'default';
  var profileConfig = PROFILE.default;
  var reducedMotion = false;
  var visible = true;
  var lastFrame = 0;
  var lastConnectionUpdate = 0;
  var nextPulseAt = 0;
  var resizeTimer = 0;
  var rafId = 0;
  var seed = 1;
  var frameCount = 0;
  var initialized = false;
  var observer = null;
  var state = {
    initialized: false,
    profile: 'default',
    width: 0,
    height: 0,
    nodeCount: 0,
    edgeCount: 0,
    fpsCap: TARGET_FPS,
    reducedMotion: false,
    pulseCount: 0,
    frameCount: 0,
    dpr: 1,
    route: '',
    canvasExists: false
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function hashString(input) {
    var h = 2166136261;
    for (var i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function profileFromRoute(route) {
    var hash = route || window.location.hash || '#/';
    if (hash.indexOf('retrieval-playground') >= 0) return 'retrieval';
    if (hash.indexOf('learning') >= 0) return 'learning';
    if (hash.indexOf('modules') >= 0) return 'modules';
    if (hash.indexOf('content') >= 0) return 'content';
    if (hash.indexOf('workspace') >= 0) return 'workspace';
    if (hash.indexOf('settings') >= 0) return 'settings';
    if (hash === '#/' || hash === '' || hash === '#') return 'home';
    return 'default';
  }

  function detectProfile(route) {
    var value = profileFromRoute(route);
    if (!value || value === 'default') {
      var explicit = document.querySelector('[data-background-profile]');
      value = explicit && explicit.getAttribute('data-background-profile');
    }
    if (!value && document.body) value = document.body.getAttribute('data-background-profile');
    if (!value) {
      var workspace = document.querySelector('.nv-main-workspace');
      var view = workspace && workspace.getAttribute('data-workspace-active-view');
      if (view === 'retrieval-playground') value = 'retrieval';
      else if (view) value = view;
    }
    if (!value) value = profileFromRoute(route);
    if (!PROFILE[value]) value = 'default';
    return value;
  }

  function minimumForWidth(w) {
    for (var i = 0; i < MIN_BY_WIDTH.length; i++) {
      if (w >= MIN_BY_WIDTH[i].width) return MIN_BY_WIDTH[i].min;
    }
    return 80;
  }

  function computeNodeCount(w, h, cfg) {
    var base = Math.floor((w * h) / 3600);
    var min = minimumForWidth(w);
    var count = Math.floor(Math.max(base, min) * cfg.density);
    if (cfg.density >= 0.8) count = Math.max(count, min);
    return clamp(count, 48, 520);
  }

  function layerForRoll(roll) {
    if (roll < 0.45) return 'far';
    if (roll < 0.85) return 'mid';
    return 'near';
  }

  function makeNode(index, random) {
    var layer = layerForRoll(random());
    var radiusRoll = random();
    var radius;
    if (radiusRoll < 0.7) radius = 0.7 + random() * 0.4;
    else if (radiusRoll < 0.95) radius = 1.1 + random() * 0.6;
    else radius = 1.8 + random() * 0.6;

    var speedBase;
    var alpha;
    var sizeScale;
    if (layer === 'far') {
      speedBase = 0.015 + random() * 0.02;
      alpha = 0.05 + random() * 0.04;
      sizeScale = 0.9;
    } else if (layer === 'mid') {
      speedBase = 0.025 + random() * 0.03;
      alpha = 0.08 + random() * 0.06;
      sizeScale = 1;
    } else {
      speedBase = 0.04 + random() * 0.04;
      alpha = 0.12 + random() * 0.08;
      sizeScale = 1.08;
    }

    var angle = random() * Math.PI * 2;
    var speed = speedBase * profileConfig.motion;
    return {
      id: index,
      x: random() * width,
      y: random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.min(2.6, radius * sizeScale),
      layer: layer,
      alpha: alpha,
      phase: random() * Math.PI * 2,
      phaseSpeed: 0.00035 + random() * 0.00085,
      driftAmplitude: 0.8 + random() * 2.8,
      degree: 0
    };
  }

  function rebuild() {
    if (!canvas || !ctx) return;
    profile = detectProfile();
    profileConfig = PROFILE[profile] || PROFILE.default;
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    width = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
    height = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var bucketW = Math.round(width / 120) * 120;
    var bucketH = Math.round(height / 120) * 120;
    seed = hashString(profile + ':' + bucketW + 'x' + bucketH);
    var random = mulberry32(seed);
    var count = computeNodeCount(width, height, profileConfig);
    nodes = [];
    for (var i = 0; i < count; i++) nodes.push(makeNode(i, random));
    edges = [];
    pulses = [];
    lastConnectionUpdate = 0;
    nextPulseAt = performance.now() + 2000;
    updateConnections(true);
    updateState();
    if (reducedMotion || profileConfig.motion === 0) drawFrame(performance.now(), 1);
    logDebug();
  }

  function updateState() {
    state = {
      initialized: initialized,
      profile: profile,
      width: width,
      height: height,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      fpsCap: TARGET_FPS,
      reducedMotion: reducedMotion,
      pulseCount: pulses.length,
      frameCount: frameCount,
      dpr: dpr,
      maxDistance: profileConfig ? profileConfig.maxDistance : 0,
      route: window.location.hash || '',
      canvasExists: !!canvas,
      running: !!rafId && visible && !reducedMotion && profileConfig && profileConfig.motion > 0,
      documentHidden: document.visibilityState === 'hidden'
    };
  }

  function wrapNode(n) {
    var margin = 24;
    if (n.x < -margin) n.x = width + margin;
    if (n.x > width + margin) n.x = -margin;
    if (n.y < -margin) n.y = height + margin;
    if (n.y > height + margin) n.y = -margin;
  }

  function stepNodes(dt, time) {
    var frameScale = dt / FRAME_INTERVAL;
    var motion = profileConfig.motion;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var sx = Math.sin(time * n.phaseSpeed + n.phase) * n.driftAmplitude * 0.055 * motion;
      var sy = Math.cos(time * n.phaseSpeed * 0.9 + n.phase) * n.driftAmplitude * 0.055 * motion;
      n.x += (n.vx + sx) * frameScale;
      n.y += (n.vy + sy) * frameScale;
      wrapNode(n);
    }
  }

  function updateConnections(force) {
    var now = performance.now();
    if (!force && now - lastConnectionUpdate < CONNECTION_UPDATE_MS) return;
    lastConnectionUpdate = now;
    for (var n = 0; n < nodes.length; n++) nodes[n].degree = 0;

    var maxDistance = profileConfig.maxDistance;
    var candidates = [];
    var step = nodes.length > 360 ? 2 : 1;
    for (var i = 0; i < nodes.length; i += step) {
      for (var j = i + 1; j < nodes.length; j += step) {
        var a = nodes[i];
        var b = nodes[j];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= maxDistance) candidates.push({ from: a, to: b, distance: dist });
      }
    }
    candidates.sort(function (a, b) { return a.distance - b.distance; });

    var targetEdges = Math.floor(nodes.length * CONNECTED_NODE_TARGET);
    edges = [];
    for (var c = 0; c < candidates.length && edges.length < targetEdges; c++) {
      var edge = candidates[c];
      if (edge.from.degree >= MAX_DEGREE || edge.to.degree >= MAX_DEGREE) continue;
      edge.from.degree++;
      edge.to.degree++;
      var fade = 1 - edge.distance / maxDistance;
      edge.alpha = (0.025 + fade * 0.05) * profileConfig.opacity;
      edge.width = 0.35 + fade * 0.3;
      edges.push(edge);
    }
    updateState();
  }

  function schedulePulse(time) {
    if (reducedMotion || profileConfig.motion === 0 || edges.length === 0) return;
    if (time < nextPulseAt || pulses.length >= MAX_PULSES) return;
    var random = mulberry32((seed + Math.floor(time)) >>> 0);
    var edge = edges[Math.floor(random() * edges.length)];
    if (!edge) return;
    pulses.push({
      edge: edge,
      start: time,
      duration: PULSE_DURATION_MIN_MS + random() * (PULSE_DURATION_MAX_MS - PULSE_DURATION_MIN_MS)
    });
    nextPulseAt = time + PULSE_MIN_MS + random() * (PULSE_MAX_MS - PULSE_MIN_MS);
    updateState();
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, width, height);
  }

  function drawBase() {
    var gradient = ctx.createRadialGradient(width * 0.52, height * 0.32, 0, width * 0.52, height * 0.32, Math.max(width, height) * 0.9);
    gradient.addColorStop(0, 'rgba(8, 35, 52, 0.34)');
    gradient.addColorStop(0.52, 'rgba(5, 12, 20, 0.16)');
    gradient.addColorStop(1, 'rgba(5, 8, 13, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawEdges() {
    ctx.save();
    ctx.lineCap = 'round';
    for (var i = 0; i < edges.length; i++) {
      var e = edges[i];
      ctx.beginPath();
      ctx.moveTo(e.from.x, e.from.y);
      ctx.lineTo(e.to.x, e.to.y);
      ctx.lineWidth = e.width;
      ctx.strokeStyle = 'rgba(89, 177, 210, ' + e.alpha.toFixed(4) + ')';
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPulses(time) {
    if (!pulses.length) return;
    ctx.save();
    for (var i = pulses.length - 1; i >= 0; i--) {
      var p = pulses[i];
      var progress = (time - p.start) / p.duration;
      if (progress >= 1) {
        pulses.splice(i, 1);
        continue;
      }
      var e = p.edge;
      var x = e.from.x + (e.to.x - e.from.x) * progress;
      var y = e.from.y + (e.to.y - e.from.y) * progress;
      var alpha = Math.sin(progress * Math.PI) * 0.18 * profileConfig.opacity;
      ctx.beginPath();
      ctx.arc(x, y, 1.7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(116, 216, 238, ' + alpha.toFixed(4) + ')';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 3.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(72, 171, 210, ' + (alpha * 0.18).toFixed(4) + ')';
      ctx.fill();
    }
    ctx.restore();
    updateState();
  }

  function drawNodes(time) {
    ctx.save();
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var breath = 0.84 + Math.sin(time * 0.001 + n.phase) * 0.16;
      var alpha = n.alpha * profileConfig.opacity * breath;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(104, 194, 220, ' + alpha.toFixed(4) + ')';
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFrame(time, dt) {
    frameCount++;
    clearCanvas();
    drawBase();
    if (!reducedMotion && profileConfig.motion > 0) stepNodes(dt, time);
    updateConnections(false);
    schedulePulse(time);
    drawEdges();
    drawPulses(time);
    drawNodes(time);
  }

  function loop(time) {
    if (!ctx) return;
    if (!visible) {
      rafId = 0;
      updateState();
      return;
    }
    if (reducedMotion || profileConfig.motion === 0) {
      drawFrame(time, FRAME_INTERVAL);
      rafId = 0;
      updateState();
      return;
    }
    var elapsed = time - lastFrame;
    if (elapsed < FRAME_INTERVAL) {
      rafId = requestAnimationFrame(loop);
      return;
    }
    var dt = Math.min(elapsed, FRAME_INTERVAL * 2.5);
    lastFrame = time - (elapsed % FRAME_INTERVAL);
    drawFrame(time, dt);
    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (rafId) return;
    if (!reducedMotion && profileConfig.motion > 0 && visible) {
      lastFrame = performance.now();
      rafId = requestAnimationFrame(loop);
    } else if (ctx) {
      drawFrame(performance.now(), FRAME_INTERVAL);
      updateState();
    }
  }

  function handleProfileMaybeChanged(options) {
    var route = options && options.route;
    var next = detectProfile(route);
    if (next !== profile) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      rebuild();
    }
    startLoop();
    updateState();
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuild, RESIZE_DEBOUNCE_MS);
  }

  function logDebug() {
    if (window.NV_DEBUG_NEURAL_GALAXY || document.body.classList.contains('nv-debug-neural-galaxy')) {
      console.info('[NeuralVerse neural galaxy]', JSON.stringify(state));
    }
  }

  function init() {
    if (initialized) return;
    canvas = document.getElementById(CANVAS_ID);
    if (!canvas) return;
    ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = motionQuery.matches;
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', function () { rebuild(); startLoop(); });
    }

    var workspaceEl = document.querySelector('.nv-main-workspace');
    if (workspaceEl) {
      observer = new MutationObserver(function () { handleProfileMaybeChanged(); });
      observer.observe(workspaceEl, { attributes: true, attributeFilter: ['data-workspace-active-view'] });
    }

    window.addEventListener('hashchange', function () {
      handleProfileMaybeChanged({ route: window.location.hash || '#/' });
    }, { passive: true });
    window.addEventListener('nv:routerendered', function (event) {
      handleProfileMaybeChanged({ route: window.location.hash || '#/', routeId: event.detail && event.detail.routeId });
    }, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', function () {
      visible = document.visibilityState !== 'hidden';
      if (visible) startLoop();
      updateState();
    });

    initialized = true;
    rebuild();
    startLoop();
  }

  function setProfile(name) {
    if (!PROFILE[name]) return false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    profile = name;
    profileConfig = PROFILE[name];
    rebuild();
    startLoop();
    return true;
  }

  function refresh(options) {
    if (!initialized) init();
    handleProfileMaybeChanged(options || { route: window.location.hash || '#/' });
  }

  window.NeuralVerseBackground = window.NeuralVerseBackground || {};
  window.NeuralVerseBackground.neuralGalaxy = {
    getState: function () { updateState(); return Object.assign({}, state); },
    rebuild: rebuild,
    refresh: refresh,
    setProfile: setProfile,
    destroy: function () {
      if (rafId) cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
      nodes = [];
      edges = [];
      pulses = [];
      if (ctx) clearCanvas();
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
