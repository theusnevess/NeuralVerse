/**
 * NeuralVerse Semantic Field Generator — NV-600.9-R7
 * Generates the inline SVG for the Living Semantic Atmosphere.
 * Run: node website/scripts/generate-semantic-field.js > output.svg
 */
const fs = require('fs');

// Deterministic PRNG (mulberry32)
function mulberry32(a) {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const VIEW_W = 1200;
const VIEW_H = 600;
const LEFT_MARGIN = 540; // SVG starts being visible from ~540
const EFFECTIVE_W = VIEW_W - LEFT_MARGIN;

const rng = mulberry32(739214);

function rand(min, max) { return min + rng() * (max - min); }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

// ============================================================
// 1. Micro Nodes (80-160)
// 80% → 1px, 18% → 2px, 2% → 3px
// ============================================================
const microNodes = [];
const MICRO_NODE_COUNT = randInt(120, 160);
for (let i = 0; i < MICRO_NODE_COUNT; i++) {
  const roll = rng();
  let r;
  if (roll < 0.80) r = 0.5;
  else if (roll < 0.98) r = 1.0;
  else r = 1.5;
  const x = rand(LEFT_MARGIN + 10, VIEW_W - 10);
  const y = rand(10, VIEW_H - 10);
  const opacity = rand(0.035, 0.09);
  microNodes.push({ x, y, r, opacity });
}

// ============================================================
// 2. Small Local Clusters (12-24)
// Each cluster: 3-7 nodes with edges between them
// ============================================================
const CLUSTER_COUNT = randInt(14, 22);
const clusters = [];

for (let c = 0; c < CLUSTER_COUNT; c++) {
  const cx = rand(LEFT_MARGIN + 20, VIEW_W - 20);
  const cy = rand(15, VIEW_H - 15);
  const nodeCount = randInt(3, 7);
  const spread = rand(18, 50);

  const nodes = [];
  for (let n = 0; n < nodeCount; n++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * spread;
    nodes.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      r: rand(0.5, 1.2),
      opacity: rand(0.06, 0.14),
    });
  }

  // Edges within cluster
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < spread * 1.2 && rng() < 0.7) {
        const fade = 1 - dist / (spread * 1.1);
        edges.push({
          x1: nodes[i].x, y1: nodes[i].y,
          x2: nodes[j].x, y2: nodes[j].y,
          opacity: rand(0.02, 0.06) * (0.4 + fade * 0.6),
        });
      }
    }
  }

  // Connect clusters with occasional long edges
  clusters.push({ nodes, edges });
}

// ============================================================
// 3. Inter-Cluster Edges (sparse, barely visible)
// ============================================================
const interEdges = [];
for (let i = 0; i < clusters.length; i++) {
  for (let j = i + 1; j < clusters.length; j++) {
    if (rng() < 0.25) {
      const a = clusters[i].nodes[randInt(0, clusters[i].nodes.length - 1)];
      const b = clusters[j].nodes[randInt(0, clusters[j].nodes.length - 1)];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 350) {
        interEdges.push({
          x1: a.x, y1: a.y,
          x2: b.x, y2: b.y,
          opacity: rand(0.008, 0.025),
          dash: rng() < 0.3 ? '1 4' : '',
        });
      }
    }
  }
}

// ============================================================
// 3b. Standalone Edges (between nearby micro nodes)
// ============================================================
const standaloneEdges = [];
const MICRO_CONNECT_RADIUS = 45;
for (let i = 0; i < microNodes.length; i++) {
  for (let j = i + 1; j < microNodes.length; j++) {
    const dx = microNodes[i].x - microNodes[j].x;
    const dy = microNodes[i].y - microNodes[j].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MICRO_CONNECT_RADIUS && rng() < 0.035) {
      const fade = 1 - dist / MICRO_CONNECT_RADIUS;
      standaloneEdges.push({
        x1: microNodes[i].x, y1: microNodes[i].y,
        x2: microNodes[j].x, y2: microNodes[j].y,
        opacity: rand(0.006, 0.02) * (0.3 + fade * 0.7),
      });
    }
  }
}

// ============================================================
// 4. Isolated Particles (40-80)
// ============================================================
const particles = [];
const PARTICLE_COUNT = randInt(45, 75);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push({
    x: rand(LEFT_MARGIN + 10, VIEW_W - 10),
    y: rand(10, VIEW_H - 10),
    r: rand(0.3, 0.7),
    opacity: rand(0.015, 0.045),
  });
}

// ============================================================
// 5. Drafting Elements (reduced further)
// ============================================================
const draftingElements = [];
// A few calibration ticks
for (let i = 0; i < 6; i++) {
  const x = rand(LEFT_MARGIN + 30, VIEW_W - 30);
  const y = rand(20, VIEW_H - 20);
  draftingElements.push({
    type: 'tick',
    x1: x, y1: y,
    x2: x + rand(6, 12), y2: y,
    opacity: rand(0.012, 0.03),
  });
  draftingElements.push({
    type: 'tick',
    x1: x, y1: y,
    x2: x, y2: y + rand(6, 12),
    opacity: rand(0.012, 0.03),
  });
}
// A few guide lines (very faint)
for (let i = 0; i < 4; i++) {
  const y = rand(40, VIEW_H - 40);
  draftingElements.push({
    type: 'guide',
    x1: LEFT_MARGIN + 10, y1: y,
    x2: VIEW_W - 10, y2: y,
    opacity: rand(0.006, 0.015),
  });
}

// ============================================================
// 6. Signal Path (for animation - only 1, as spec requires)
// ============================================================
const signalPaths = [];
const allEdges = [];
clusters.forEach((cl, ci) => {
  cl.edges.forEach(e => allEdges.push({ ...e, clusterIdx: ci }));
});
if (allEdges.length >= 1) {
  const e = allEdges[randInt(0, allEdges.length - 1)];
  signalPaths.push({
    x1: e.x1, y1: e.y1,
    x2: e.x2, y2: e.y2,
  });
}

// ============================================================
// Generate SVG
// ============================================================
let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" aria-hidden="true" focusable="false">
  <defs>
    <style>
      .sf-micro-dot{fill:var(--nv-semantic-node-color, #1e2c3e)}
      .sf-cluster-node{fill:var(--nv-semantic-node-color, #1e2c3e)}
      .sf-cluster-edge{fill:none;stroke:var(--nv-semantic-edge-color, #0e7490);vector-effect:non-scaling-stroke}
      .sf-inter-edge{fill:none;stroke:var(--nv-semantic-edge-color, #0e7490);vector-effect:non-scaling-stroke}
      .sf-particle{fill:var(--nv-semantic-node-color, #1e2c3e)}
      .sf-draft-tick{fill:none;stroke:var(--nv-semantic-edge-color, #0e7490);vector-effect:non-scaling-stroke}
      .sf-draft-guide{fill:none;stroke:var(--nv-semantic-edge-color, #0e7490);vector-effect:non-scaling-stroke}
      .sf-signal-path{fill:none;stroke:var(--nv-semantic-signal-color, #06b6d4);vector-effect:non-scaling-stroke}
      
      @keyframes sf-signal-pulse{
        0%,82%{opacity:0;stroke-dashoffset:280}
        88%{opacity:0.08}
        94%{opacity:0.1}
        100%{opacity:0;stroke-dashoffset:-40}
      }
      @keyframes sf-node-breathe{
        0%,100%{opacity:var(--sf-breathe-from,0.08)}
        50%{opacity:var(--sf-breathe-to,0.14)}
      }
      @keyframes sf-micro-breathe{
        0%,100%{opacity:var(--sf-micro-from,0.04)}
        50%{opacity:var(--sf-micro-to,0.07)}
      }
      @keyframes sf-cluster-activate{
        0%,100%{opacity:1}
        5%,15%{opacity:1.06}
      }
      @keyframes sf-drift{
        0%,100%{transform:translate(0,0)}
        50%{transform:translate(1.2,-0.8)}
      }
      @keyframes sf-drift-b{
        0%,100%{transform:translate(0,0)}
        50%{transform:translate(-0.7,1.0)}
      }
      @keyframes sf-drift-c{
        0%,100%{transform:translate(0,0)}
        50%{transform:translate(0.9,0.6)}
      }
      
      .sf-signal{stroke-dasharray:10 300;stroke-dashoffset:300;animation:sf-signal-pulse 8s ease-in-out infinite;animation-delay:-2s}
      .sf-node-breathe{animation-duration:16s}
      .sf-micro-breathe{animation-duration:14s}
      .sf-cluster-activate{animation-duration:90s}
      .sf-drift,.sf-drift-b,.sf-drift-c{animation-duration:45s}
      
      @media(prefers-reduced-motion:reduce){
        .sf-signal{animation:none;opacity:0}
        [class*="sf-breathe"]{animation:none}
        [class*="sf-drift"]{animation:none}
        [class*="sf-cluster-activate"]{animation:none}
      }
    </style>
  </defs>
`;

// Layer: Micro Nodes
svg += '  <g>\n';
microNodes.forEach((n, i) => {
  const breatheClass = rng() < 0.12 ? ' class="sf-micro-breathe"' : '';
    const mc = breatheClass ? 'sf-micro-dot sf-micro-breathe' : 'sf-micro-dot';
    svg += `    <circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r}" class="${mc}" style="opacity:${n.opacity.toFixed(4)};--sf-micro-from:${n.opacity.toFixed(4)};--sf-micro-to:${Math.min(n.opacity + 0.03, 0.12).toFixed(4)}"/>\n`;
});
svg += '  </g>\n';

// Layer: Cluster Edges
svg += '  <g>\n';
clusters.forEach((cl, ci) => {
  cl.edges.forEach((e, ei) => {
    const strokeW = rand(0.25, 0.45).toFixed(2);
    svg += `    <path class="sf-cluster-edge" d="M${e.x1.toFixed(1)} ${e.y1.toFixed(1)} L${e.x2.toFixed(1)} ${e.y2.toFixed(1)}" style="opacity:${e.opacity.toFixed(4)};stroke-width:${strokeW}"/>\n`;
  });
});
svg += '  </g>\n';

// Layer: Inter-Cluster Edges
svg += '  <g>\n';
interEdges.forEach(e => {
  const style = `opacity:${e.opacity.toFixed(4)};stroke-width:${rand(0.2, 0.35).toFixed(2)}`;
  if (e.dash) {
    svg += `    <path class="sf-inter-edge" d="M${e.x1.toFixed(1)} ${e.y1.toFixed(1)} L${e.x2.toFixed(1)} ${e.y2.toFixed(1)}" stroke-dasharray="${e.dash}" style="${style}"/>\n`;
  } else {
    svg += `    <path class="sf-inter-edge" d="M${e.x1.toFixed(1)} ${e.y1.toFixed(1)} L${e.x2.toFixed(1)} ${e.y2.toFixed(1)}" style="${style}"/>\n`;
  }
});
svg += '  </g>\n';

// Layer: Standalone Edges
svg += '  <g>\n';
standaloneEdges.forEach(e => {
  svg += `    <path class="sf-cluster-edge" d="M${e.x1.toFixed(1)} ${e.y1.toFixed(1)} L${e.x2.toFixed(1)} ${e.y2.toFixed(1)}" style="opacity:${e.opacity.toFixed(4)};stroke-width:${rand(0.15, 0.3).toFixed(2)}"/>\n`;
});
svg += '  </g>\n';

// Layer: Cluster Nodes
svg += '  <g>\n';
clusters.forEach((cl, ci) => {
  const activateClass = rng() < 0.2 ? ' class="sf-cluster-activate"' : '';
  const driftClass = rng() < 0.15 ? ` class="sf-drift${['', '-b', '-c'][randInt(0, 2)]}"` : '';
  const groupClasses = [];
  if (driftClass) groupClasses.push(driftClass.replace('class="', '').replace('"', '').trim());
  if (activateClass) groupClasses.push(activateClass.replace('class="', '').replace('"', '').trim());
  const gc = groupClasses.length ? ` class="${groupClasses.join(' ')}"` : '';
  svg += `    <g${gc}>\n`;
  cl.nodes.forEach(n => {
    const nc = rng() < 0.15 ? 'sf-cluster-node sf-node-breathe' : 'sf-cluster-node';
    svg += `      <circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r.toFixed(2)}" class="${nc}" style="opacity:${n.opacity.toFixed(4)};--sf-breathe-from:${n.opacity.toFixed(4)};--sf-breathe-to:${Math.min(n.opacity + 0.04, 0.18).toFixed(4)}"/>\n`;
  });
  svg += `    </g>\n`;
});
svg += '  </g>\n';

// Layer: Isolated Particles
svg += '  <g>\n';
particles.forEach(p => {
  svg += `    <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(2)}" class="sf-particle" style="opacity:${p.opacity.toFixed(4)}"/>\n`;
});
svg += '  </g>\n';

// Layer: Drafting Elements
svg += '  <g>\n';
draftingElements.forEach(d => {
  if (d.type === 'tick') {
    svg += `    <path class="sf-draft-tick" d="M${d.x1.toFixed(1)} ${d.y1.toFixed(1)} L${d.x2.toFixed(1)} ${d.y2.toFixed(1)}" style="opacity:${d.opacity.toFixed(4)};stroke-width:${rand(0.25, 0.4).toFixed(2)}"/>\n`;
  } else if (d.type === 'guide') {
    svg += `    <path class="sf-draft-guide" d="M${d.x1.toFixed(1)} ${d.y1.toFixed(1)} L${d.x2.toFixed(1)} ${d.y2.toFixed(1)}" style="opacity:${d.opacity.toFixed(4)};stroke-width:${rand(0.2, 0.3).toFixed(2)};stroke-dasharray:3 10"/>\n`;
  }
});
svg += '  </g>\n';

// Signal Path (single pulse track)
svg += '  <g>\n';
signalPaths.forEach(sp => {
  svg += `    <path class="sf-cluster-edge sf-signal" d="M${sp.x1.toFixed(1)} ${sp.y1.toFixed(1)} L${sp.x2.toFixed(1)} ${sp.y2.toFixed(1)}" style="stroke-width:0.5"/>\n`;
});
svg += '  </g>\n';

svg += '</svg>';

// Print stats
const stats = {
  microNodes: microNodes.length,
  clusters: clusters.length,
  clusterNodes: clusters.reduce((s, c) => s + c.nodes.length, 0),
  clusterEdges: clusters.reduce((s, c) => s + c.edges.length, 0),
  interEdges: interEdges.length,
  standaloneEdges: standaloneEdges.length,
  particles: particles.length,
  draftingElements: draftingElements.length,
  signalPaths: signalPaths.length,
  reducedMotionAt: 'prefers-reduced-motion:reduce',
  totalNodes: microNodes.length + clusters.reduce((s, c) => s + c.nodes.length, 0) + particles.length,
  totalEdges: clusters.reduce((s, c) => s + c.edges.length, 0) + interEdges.length + standaloneEdges.length,
};
console.error('Semantic Field Stats:', JSON.stringify(stats, null, 2));
console.log(svg);
