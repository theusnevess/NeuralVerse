/**
 * NeuralVerse Dense Micro-Neural Field Background — NV-600.8-R2
 * =========================================================
 * Dynamic Canvas-based deterministic synaptic neural network.
 * Fully token-compliant, responsive, and lightweight.
 */
(function() {
  const canvasId = 'nv-neural-field-canvas';
  let canvas, ctx;
  let nodes = [];
  let pulses = [];
  let rgbColor = '14, 116, 144';
  let panelRects = [];
  let colorCheckTimer = null;

  // Linear Congruential Generator for seeded deterministic randoms
  function createPRNG(seed) {
    let s = seed;
    return function() {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  }

  // Dynamically resolve `--sys-color-accent-primary` color to RGB values
  function resolveThemeColor() {
    const temp = document.createElement('div');
    temp.style.color = 'var(--sys-color-accent-primary)';
    document.body.appendChild(temp);
    const style = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    const match = style.match(/\d+/g);
    if (match && match.length >= 3) {
      rgbColor = `${match[0]}, ${match[1]}, ${match[2]}`;
    }
  }

  // Update panel coordinates to apply negative-space biasing & attenuation
  function updatePanelRects() {
    const elements = document.querySelectorAll(
      '.nv-workspace__surface, .nv-card, .nv-panel, .retrieval-header, ' +
      '.search-console, .results-panel, .inspector-space, .memory-layer, ' +
      '.nv-context-panel, .nv-global-header, .nv-navigation-rail'
    );
    panelRects = Array.from(elements).map(el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    });
  }

  function isPointUnderPanel(x, y) {
    for (let i = 0; i < panelRects.length; i++) {
      const rect = panelRects[i];
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return true;
      }
    }
    return false;
  }

  // Sparse emerge connectivity with degree limits and path verification (no cycles/polygons)
  function buildSparseConnections(nodesList) {
    const maxDistance = 90;
    const maxDegree = 2; // Keep connectivity sparse (degree 2 or 3)

    // Helper BFS to check if there is an existing path within depth of 4 steps (prevents loops/polygons)
    function hasPath(start, target, maxDepth) {
      const visited = new Set();
      const queue = [[start, 0]];
      visited.add(start);

      while (queue.length > 0) {
        const [curr, depth] = queue.shift();
        if (curr === target) return true;
        if (depth >= maxDepth) continue;

        const currNode = nodesList[curr];
        for (let i = 0; i < currNode.connections.length; i++) {
          const neighborId = currNode.connections[i];
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push([neighborId, depth + 1]);
          }
        }
      }
      return false;
    }

    for (let i = 0; i < nodesList.length; i++) {
      const nodeA = nodesList[i];
      if (!nodeA.participates) continue;
      if (nodeA.connections.length >= maxDegree) continue;

      const targets = [];
      for (let j = 0; j < nodesList.length; j++) {
        if (i === j) continue;
        const nodeB = nodesList[j];
        if (!nodeB.participates) continue;
        if (nodeB.connections.length >= maxDegree) continue;

        const dx = nodeA.x0 - nodeB.x0;
        const dy = nodeA.y0 - nodeB.y0;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          targets.push({ id: j, dist });
        }
      }

      // Sort neighbors by distance
      targets.sort((a, b) => a.dist - b.dist);

      for (let k = 0; k < targets.length; k++) {
        if (nodeA.connections.length >= maxDegree) break;
        const targetId = targets[k].id;
        const nodeB = nodesList[targetId];
        if (nodeB.connections.length >= maxDegree) continue;

        // Verify path depth to prevent cycles/pentagons/hexagons/triangles
        if (hasPath(i, targetId, 4)) {
          continue;
        }

        nodeA.connections.push(targetId);
        nodeB.connections.push(i);
      }
    }
  }

  function generateNodes(width, height) {
    const rand = createPRNG(42); // Fixed deterministic seed
    const nodesList = [];
    
    // Scale node density relative to resolution (target: 120-300 nodes visible)
    const totalNodes = Math.max(120, Math.min(300, Math.floor((width * height) / 5400)));

    for (let i = 0; i < totalNodes; i++) {
      let x = rand() * width;
      let y = rand() * height;

      // 60% chance to relocate coordinates generated inside cards/panels
      let attempts = 0;
      while (attempts < 5) {
        let inside = false;
        for (let j = 0; j < panelRects.length; j++) {
          const rect = panelRects[j];
          if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            inside = true;
            break;
          }
        }
        if (!inside || rand() < 0.35) {
          break;
        }
        x = rand() * width;
        y = rand() * height;
        attempts++;
      }

      nodesList.push({
        id: i,
        x0: x,
        y0: y,
        x: x,
        y: y,
        sizeType: rand() < 0.5 ? 0 : (rand() < 0.85 ? 1 : 2), // 0: tiny (~1px), 1: normal (~1.8px), 2: anchor (~2.6px)
        driftPhaseX: rand() * Math.PI * 2,
        driftPhaseY: rand() * Math.PI * 2,
        driftSpeedX: 0.0003 + rand() * 0.0005,
        driftSpeedY: 0.0003 + rand() * 0.0005,
        driftRange: 1 + rand() * 2, // 1 to 3 px slow positional drift
        breathingPhase: rand() * Math.PI * 2,
        breathingSpeed: 0.0006 + rand() * 0.0008,
        participates: rand() < 0.3, // ~30% connection rate (70% isolated nodes)
        connections: []
      });
    }

    buildSparseConnections(nodesList);
    return nodesList;
  }

  // OCCASIONAL PULSE: trigger a moving light along a random active connection
  function triggerPulse() {
    const edges = [];
    const seen = new Set();
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      for (let j = 0; j < node.connections.length; j++) {
        const neighborId = node.connections[j];
        const key = i < neighborId ? `${i}-${neighborId}` : `${neighborId}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push([i, neighborId]);
        }
      }
    }
    if (edges.length === 0) return;
    const [startId, endId] = edges[Math.floor(Math.random() * edges.length)];
    pulses.push({
      startId,
      endId,
      progress: 0,
      speed: 0.006 + Math.random() * 0.009 // very slow pulse
    });
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updatePanelRects();
    nodes = generateNodes(canvas.width, canvas.height);
    pulses = [];
  }

  function init() {
    canvas = document.getElementById(canvasId);
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    
    resolveThemeColor();
    updatePanelRects();
    resizeCanvas();

    // Responsive listeners
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    });

    // Pulse trigger: every 6 seconds
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        triggerPulse();
      }
    }, 6000);

    // Periodically sync theme color variables
    colorCheckTimer = setInterval(resolveThemeColor, 5000);

    // Periodically update panel layout positions to handle page adjustments
    setInterval(updatePanelRects, 1000);

    // Animation Loop
    requestAnimationFrame(loop);
  }

  function loop(time) {
    if (!canvas || !ctx) return;
    requestAnimationFrame(loop);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDebug = window.NV_DEBUG;
    const nodeOpacityMultiplier = isDebug ? 0.7 : 0.25;
    const edgeOpacityMultiplier = isDebug ? 0.35 : 0.08;
    const sizeMap = [0.8, 1.6, 2.5];

    // 1. Update positions (drift)
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      node.x = node.x0 + Math.sin(time * node.driftSpeedX + node.driftPhaseX) * node.driftRange;
      node.y = node.y0 + Math.cos(time * node.driftSpeedY + node.driftPhaseY) * node.driftRange;
    }

    // 2. Draw connections (edges) - barely visible
    ctx.lineWidth = 0.8;
    const drawnEdges = new Set();
    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i];
      for (let j = 0; j < nodeA.connections.length; j++) {
        const neighborId = nodeA.connections[j];
        const key = i < neighborId ? `${i}-${neighborId}` : `${neighborId}-${i}`;
        if (drawnEdges.has(key)) continue;
        drawnEdges.add(key);

        const nodeB = nodes[neighborId];
        
        // Edge opacity is determined by both nodes' opacities and whether they are under panels
        const underPanelA = isPointUnderPanel(nodeA.x, nodeA.y);
        const underPanelB = isPointUnderPanel(nodeB.x, nodeB.y);
        
        let edgeOpacity = 0.12 * edgeOpacityMultiplier;
        if (underPanelA || underPanelB) {
          edgeOpacity *= 0.15; // heavily attenuated under panels
        }

        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.strokeStyle = `rgba(${rgbColor}, ${edgeOpacity})`;
        ctx.stroke();
      }
    }

    // 3. Draw active pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.progress += p.speed;
      if (p.progress >= 1) {
        pulses.splice(i, 1);
        continue;
      }

      const nodeStart = nodes[p.startId];
      const nodeEnd = nodes[p.endId];
      if (!nodeStart || !nodeEnd) continue;

      const px = nodeStart.x + (nodeEnd.x - nodeStart.x) * p.progress;
      const py = nodeStart.y + (nodeEnd.y - nodeStart.y) * p.progress;

      const underPanel = isPointUnderPanel(px, py);
      let pulseOpacity = isDebug ? 0.6 : 0.28;
      if (underPanel) pulseOpacity *= 0.15;

      ctx.beginPath();
      ctx.arc(px, py, 1.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgbColor}, ${pulseOpacity})`;
      ctx.fill();
    }

    // 4. Draw nodes (scale variations, breathing, panel attenuation)
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const size = sizeMap[node.sizeType];
      
      let baseOpacity = 0.12;
      if (node.sizeType === 1) baseOpacity = 0.22;
      else if (node.sizeType === 2) baseOpacity = 0.35;

      let opacity = baseOpacity * nodeOpacityMultiplier;

      // Breathing opacity variation
      const breathing = 0.85 + 0.15 * Math.sin(time * node.breathingSpeed + node.breathingPhase);
      opacity *= breathing;

      // Under panel attenuation
      if (isPointUnderPanel(node.x, node.y)) {
        opacity *= 0.15; // 85% attenuation under panels
      }

      // Draw soft glow for normal/anchor nodes
      if (node.sizeType > 0) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgbColor}, ${opacity * 0.22})`;
        ctx.fill();
      }

      // Draw core node
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgbColor}, ${opacity})`;
      ctx.fill();
    }
  }

  // Hook initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
