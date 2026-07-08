(function () {
  'use strict';

  window.NeuralVerse = window.NeuralVerse || {};

  var VECTORS = {
    'retrieval': { values: [0.9, 0.1, 0.8, 0.2, 0.1, 0.05], label: 'Retrieval' },
    'search': { values: [0.85, 0.15, 0.75, 0.25, 0.12, 0.08], label: 'Search' },
    'embedding': { values: [0.3, 0.8, 0.2, 0.7, 0.6, 0.4], label: 'Embedding' },
    'vector': { values: [0.25, 0.75, 0.3, 0.65, 0.55, 0.45], label: 'Vector' },
    'loss': { values: [0.1, 0.2, 0.1, 0.1, 0.9, 0.8], label: 'Loss' },
    'gradient': { values: [0.15, 0.25, 0.12, 0.15, 0.85, 0.75], label: 'Gradient' },
    'angle': { values: [0.05, 0.05, 0.05, 0.05, 0.1, 0.1], label: 'Angle' },
    'projection': { values: [0.8, 0.3, 0.7, 0.4, 0.2, 0.15], label: 'Projection' }
  };

  function dot(a, b) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }

  function norm(v) {
    return Math.sqrt(dot(v, v));
  }

  function normalize(v) {
    var n = norm(v);
    if (n < 1e-10) return v.slice();
    return v.map(function (x) { return x / n; });
  }

  function cosine(a, b) {
    var na = norm(a), nb = norm(b);
    if (na < 1e-10 || nb < 1e-10) return 0;
    return Math.max(-1, Math.min(1, dot(a, b) / (na * nb)));
  }

  function angle(a, b) {
    return Math.acos(Math.max(-1, Math.min(1, cosine(a, b)))) * 180 / Math.PI;
  }

  function projection(a, b) {
    var nb2 = dot(b, b);
    if (nb2 < 1e-10) return { scalar: 0, vector: b.map(function () { return 0; }) };
    var scalar = dot(a, b) / nb2;
    return { scalar: scalar, vector: b.map(function (x) { return x * scalar; }) };
  }

  function project2D(v1, v2) {
    var scale = 80;
    var maxComp = 0;
    for (var i = 0; i < Math.min(v1.length, 2); i++) {
      maxComp = Math.max(maxComp, Math.abs(v1[i]), Math.abs(v2[i]));
    }
    if (maxComp < 0.01) maxComp = 1;
    var s = scale / maxComp;
    return {
      x1: v1[0] * s, y1: -v1[1] * s,
      x2: v2[0] * s, y2: -v2[1] * s
    };
  }

  function computeAll(v1, v2, keys) {
    var n1 = norm(v1), n2 = norm(v2);
    var dp = dot(v1, v2);
    var cos = cosine(v1, v2);
    var ang = angle(v1, v2);
    var proj = projection(v1, v2);
    var n1n = normalize(v1), n2n = normalize(v2);
    var cosN = cosine(n1n, n2n);

    var rankings = [];
    for (var i = 0; i < keys.length; i++) {
      var v = VECTORS[keys[i]].values;
      var c = cosine(v1, v);
      rankings.push({ key: keys[i], label: VECTORS[keys[i]].label, cosine: c, angle: angle(v1, v) });
    }
    rankings.sort(function (a, b) { return b.cosine - a.cosine; });

    return {
      v1: v1, v2: v2, n1: n1, n2: n2,
      dp: dp, cos: cos, cosN: cosN, ang: ang,
      proj: proj, n1n: n1n, n2n: n2n,
      rankings: rankings
    };
  }

  function buildSteps(v1, v2, keys) {
    var steps = [];
    var all = computeAll(v1, v2, keys);

    steps.push({
      label: 'Generate Vectors',
      log: 'Loaded semantic vectors for ' + keys.length + ' terms',
      state: function () { return { v1: v1, v2: v2, phase: 'generate' }; },
      metrics: function () { return { 'Vector A': '[' + v1.slice(0, 3).map(function (x) { return x.toFixed(2); }).join(', ') + '...]', 'Vector B': '[' + v2.slice(0, 3).map(function (x) { return x.toFixed(2); }).join(', ') + '...]', 'Phase': 'Generate', 'Status': 'Ready' }; },
      viz: function () { return { v1: v1, v2: v2, phase: 'generate' }; }
    });

    steps.push({
      label: 'Inspect Norms',
      log: '||A|| = ' + all.n1.toFixed(4) + ', ||B|| = ' + all.n2.toFixed(4),
      state: function () { return { n1: all.n1, n2: all.n2, phase: 'norms' }; },
      metrics: function () { return { '||A||': all.n1.toFixed(4), '||B||': all.n2.toFixed(4), 'Phase': 'Norms', 'Status': 'Computed' }; },
      viz: function () { return { v1: v1, v2: v2, n1: all.n1, n2: all.n2, phase: 'norms' }; }
    });

    steps.push({
      label: 'Normalize',
      log: 'Normalized vectors to unit length',
      state: function () { return { n1n: all.n1n, n2n: all.n2n, phase: 'normalize' }; },
      metrics: function () { return { '||A\'||': norm(all.n1n).toFixed(4), '||B\'||': norm(all.n2n).toFixed(4), 'Phase': 'Normalize', 'Status': 'Done' }; },
      viz: function () { return { v1: v1, v2: v2, n1n: all.n1n, n2n: all.n2n, phase: 'normalize' }; }
    });

    steps.push({
      label: 'Dot Product',
      log: 'A · B = ' + all.dp.toFixed(4),
      state: function () { return { dp: all.dp, phase: 'dot' }; },
      metrics: function () { return { 'Dot Product': all.dp.toFixed(4), 'Phase': 'Dot Product', 'Status': 'Computed' }; },
      viz: function () { return { v1: v1, v2: v2, dp: all.dp, phase: 'dot' }; }
    });

    steps.push({
      label: 'Compute Angle',
      log: 'θ = ' + all.ang.toFixed(2) + '°',
      state: function () { return { ang: all.ang, phase: 'angle' }; },
      metrics: function () { return { 'Angle': all.ang.toFixed(2) + '°', 'Phase': 'Angle', 'Status': 'Computed' }; },
      viz: function () { return { v1: v1, v2: v2, ang: all.ang, phase: 'angle' }; }
    });

    steps.push({
      label: 'Compute Cosine',
      log: 'cos(θ) = ' + all.cos.toFixed(4),
      state: function () { return { cos: all.cos, phase: 'cosine' }; },
      metrics: function () { return { 'Cosine': all.cos.toFixed(4), 'Phase': 'Cosine', 'Status': 'Computed' }; },
      viz: function () { return { v1: v1, v2: v2, cos: all.cos, ang: all.ang, phase: 'cosine' }; }
    });

    steps.push({
      label: 'Compute Projection',
      log: 'Projection of A onto B: scalar = ' + all.proj.scalar.toFixed(4),
      state: function () { return { proj: all.proj, phase: 'projection' }; },
      metrics: function () { return { 'Proj Scalar': all.proj.scalar.toFixed(4), 'Phase': 'Projection', 'Status': 'Computed' }; },
      viz: function () { return { v1: v1, v2: v2, proj: all.proj, phase: 'projection' }; }
    });

    steps.push({
      label: 'Rank Neighbors',
      log: 'Ranked ' + all.rankings.length + ' vectors by cosine similarity',
      state: function () { return { rankings: all.rankings, phase: 'rank' }; },
      metrics: function () { return { 'Neighbors': all.rankings.length, 'Top': all.rankings[0] ? all.rankings[0].label : '—', 'Phase': 'Rank', 'Status': 'Ranked' }; },
      viz: function () { return { v1: v1, v2: v2, rankings: all.rankings, phase: 'rank' }; }
    });

    steps.push({
      label: 'Analyze',
      log: 'Geometric analysis complete. Cosine: ' + all.cos.toFixed(4) + ', Angle: ' + all.ang.toFixed(2) + '°',
      state: function () { return { cos: all.cos, ang: all.ang, proj: all.proj, rankings: all.rankings, phase: 'analyze' }; },
      metrics: function () { return { 'Cosine': all.cos.toFixed(4), 'Angle': all.ang.toFixed(2) + '°', 'Phase': 'Analyze', 'Status': 'Done' }; },
      viz: function () { return { v1: v1, v2: v2, cos: all.cos, ang: all.ang, proj: all.proj, rankings: all.rankings, phase: 'analyze' }; }
    });

    steps.push({
      label: 'Finished',
      log: 'Geometric similarity analysis complete',
      state: function () { return { phase: 'finished' }; },
      metrics: function () { return { 'Phase': 'Complete', 'Status': 'Done' }; },
      viz: function () { return { v1: v1, v2: v2, cos: all.cos, ang: all.ang, proj: all.proj, phase: 'finished' }; }
    });

    return steps;
  }

  var labDefinition = {
    id: 'lab-cosine-similarity',
    slug: 'cosine-similarity',
    title: 'Cosine Similarity',
    summary: 'Explore geometric similarity in vector spaces by watching cosine similarity decompose into norm, dot product, angle, and projection.',
    category: 'mathematics',
    artifactReferences: [],
    conceptReferences: ['vector-similarity'],
    parameterSchema: [
      { name: 'vectorA', type: 'select', options: ['retrieval', 'search', 'embedding', 'vector', 'loss', 'gradient', 'angle', 'projection'], default: 'retrieval', label: 'Vector A' },
      { name: 'vectorB', type: 'select', options: ['retrieval', 'search', 'embedding', 'vector', 'loss', 'gradient', 'angle', 'projection'], default: 'search', label: 'Vector B' }
    ],
    initialState: { vectorA: 'retrieval', vectorB: 'search' },
    steps: (function () {
      return buildSteps(VECTORS['retrieval'].values, VECTORS['search'].values, Object.keys(VECTORS));
    })(),
    inspector: {
      title: 'Cosine Similarity State',
      sections: [
        {
          label: 'Geometry',
          cards: [
            { key: 'normA', label: 'Vector A Norm', interpretation: function (v) { return '||A|| = ' + v; } },
            { key: 'normB', label: 'Vector B Norm', interpretation: function (v) { return '||B|| = ' + v; } },
            { key: 'angle', label: 'Angle', interpretation: function (v) { var a = parseFloat(v); return a < 30 ? 'Highly aligned' : a < 90 ? 'Moderately aligned' : a < 150 ? 'Divergent' : 'Opposite direction'; } },
            { key: 'normalized', label: 'Normalized', interpretation: function (v) { return v ? 'Unit vectors — magnitude removed' : 'Raw vectors — magnitude present'; } }
          ]
        },
        {
          label: 'Similarity',
          cards: [
            { key: 'dotProduct', label: 'Dot Product', interpretation: function (v) { return v > 0 ? 'Positive alignment' : v < 0 ? 'Negative alignment' : 'Orthogonal'; } },
            { key: 'cosine', label: 'Cosine', interpretation: function (v) { return v > 0.9 ? 'Very similar' : v > 0.5 ? 'Similar' : v > 0 ? 'Weakly similar' : 'Dissimilar'; } },
            { key: 'projLength', label: 'Projection Length', interpretation: function (v) { return Math.abs(v) > 0.8 ? 'Large shared component' : 'Small shared component'; } },
            { key: 'rank', label: 'Similarity Rank', interpretation: function (v) { return v === 1 ? 'Most similar vector' : 'Rank ' + v + ' in similarity'; } }
          ]
        },
        {
          label: 'Interpretation',
          cards: [
            { key: 'alignment', label: 'Alignment', interpretation: function (v) { return v; } },
            { key: 'directionAgreement', label: 'Direction Agreement', interpretation: function (v) { return v; } },
            { key: 'magnitudeEffect', label: 'Magnitude Effect', interpretation: function (v) { return v; } }
          ]
        }
      ],
      computeState: function (params) {
        var kA = params.vectorA || 'retrieval';
        var kB = params.vectorB || 'search';
        var v1 = VECTORS[kA] ? VECTORS[kA].values : [1, 0];
        var v2 = VECTORS[kB] ? VECTORS[kB].values : [0, 1];
        var all = computeAll(v1, v2, Object.keys(VECTORS));
        var rankIdx = 1;
        for (var i = 0; i < all.rankings.length; i++) {
          if (all.rankings[i].key === kB) { rankIdx = i + 1; break; }
        }
        return {
          normA: all.n1.toFixed(4), normB: all.n2.toFixed(4),
          angle: all.ang.toFixed(2) + '°',
          normalized: false,
          dotProduct: all.dp.toFixed(4),
          cosine: all.cos.toFixed(4),
          projLength: all.proj.scalar.toFixed(4),
          rank: rankIdx,
          alignment: all.cos > 0.8 ? 'Strong alignment' : all.cos > 0.4 ? 'Moderate alignment' : 'Weak alignment',
          directionAgreement: all.ang < 45 ? 'Same general direction' : all.ang < 135 ? 'Partially opposite' : 'Opposite directions',
          magnitudeEffect: Math.abs(all.n1 - all.n2) > 1 ? 'Different magnitudes — cosine removes this effect' : 'Similar magnitudes'
        };
      },
      changeDetector: function (prev, curr) {
        var changes = [];
        if (prev && curr) {
          if (prev.cosine !== curr.cosine) changes.push({ from: 'cosine', to: null, label: 'Cosine: ' + curr.cosine });
          if (prev.angle !== curr.angle) changes.push({ from: 'angle', to: null, label: 'Angle: ' + curr.angle });
        }
        return changes;
      }
    },
    observations: [
      {
        id: 'vector-geometry',
        title: 'Vector Geometry',
        purpose: 'How are the vectors positioned?',
        defaultSize: 'large',
        render: function (container, params) {
          var kA = params.vectorA || 'retrieval';
          var kB = params.vectorB || 'search';
          var v1 = VECTORS[kA] ? VECTORS[kA].values : [1, 0];
          var v2 = VECTORS[kB] ? VECTORS[kB].values : [0, 1];
          var p = project2D(v1, v2);
          var ang = angle(v1, v2);

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Vector Geometry';
          container.appendChild(title);

          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 400 300');
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', 'Vector geometry with angle');
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.maxHeight = '250px';

          var cx = 200, cy = 200;

          // Grid
          for (var g = -200; g <= 200; g += 40) {
            var vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            vLine.setAttribute('x1', cx + g); vLine.setAttribute('y1', 0);
            vLine.setAttribute('x2', cx + g); vLine.setAttribute('y2', 300);
            vLine.setAttribute('stroke', 'rgba(138,180,248,0.06)'); vLine.setAttribute('stroke-width', '0.5');
            svg.appendChild(vLine);
          }

          // Angle arc
          if (ang > 1 && ang < 179) {
            var arcR = 40;
            var startAngle = Math.atan2(-p.y1, p.x1);
            var endAngle = Math.atan2(-p.y2, p.x2);
            var arcPath = 'M ' + (cx + arcR * Math.cos(startAngle)) + ' ' + (cy + arcR * Math.sin(startAngle));
            arcPath += ' A ' + arcR + ' ' + arcR + ' 0 0 1 ' + (cx + arcR * Math.cos(endAngle)) + ' ' + (cy + arcR * Math.sin(endAngle));
            var arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            arc.setAttribute('d', arcPath);
            arc.setAttribute('fill', 'none');
            arc.setAttribute('stroke', '#f59e0b');
            arc.setAttribute('stroke-width', '1.5');
            arc.setAttribute('stroke-dasharray', '3 2');
            svg.appendChild(arc);

            var midAngle = (startAngle + endAngle) / 2;
            var lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            lbl.setAttribute('x', cx + (arcR + 12) * Math.cos(midAngle));
            lbl.setAttribute('y', cy + (arcR + 12) * Math.sin(midAngle));
            lbl.setAttribute('fill', '#f59e0b');
            lbl.setAttribute('font-size', '10');
            lbl.setAttribute('text-anchor', 'middle');
            lbl.textContent = ang.toFixed(1) + '°';
            svg.appendChild(lbl);
          }

          // Vector A
          var lineA = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          lineA.setAttribute('x1', cx); lineA.setAttribute('y1', cy);
          lineA.setAttribute('x2', cx + p.x1); lineA.setAttribute('y2', cy + p.y1);
          lineA.setAttribute('stroke', '#06b6d4');
          lineA.setAttribute('stroke-width', '2');
          svg.appendChild(lineA);

          var tipA = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          tipA.setAttribute('cx', cx + p.x1); tipA.setAttribute('cy', cy + p.y1);
          tipA.setAttribute('r', '5'); tipA.setAttribute('fill', '#06b6d4');
          svg.appendChild(tipA);

          var lblA = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          lblA.setAttribute('x', cx + p.x1 + 8); lblA.setAttribute('y', cy + p.y1 - 5);
          lblA.setAttribute('fill', '#06b6d4'); lblA.setAttribute('font-size', '11');
          lblA.setAttribute('font-weight', '600');
          lblA.textContent = 'A';
          svg.appendChild(lblA);

          // Vector B
          var lineB = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          lineB.setAttribute('x1', cx); lineB.setAttribute('y1', cy);
          lineB.setAttribute('x2', cx + p.x2); lineB.setAttribute('y2', cy + p.y2);
          lineB.setAttribute('stroke', '#f59e0b');
          lineB.setAttribute('stroke-width', '2');
          svg.appendChild(lineB);

          var tipB = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          tipB.setAttribute('cx', cx + p.x2); tipB.setAttribute('cy', cy + p.y2);
          tipB.setAttribute('r', '5'); tipB.setAttribute('fill', '#f59e0b');
          svg.appendChild(tipB);

          var lblB = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          lblB.setAttribute('x', cx + p.x2 + 8); lblB.setAttribute('y', cy + p.y2 - 5);
          lblB.setAttribute('fill', '#f59e0b'); lblB.setAttribute('font-size', '11');
          lblB.setAttribute('font-weight', '600');
          lblB.textContent = 'B';
          svg.appendChild(lblB);

          container.appendChild(svg);
        }
      },
      {
        id: 'similarity-breakdown',
        title: 'Similarity Breakdown',
        purpose: 'Where does cosine come from?',
        defaultSize: 'small',
        render: function (container, params) {
          var kA = params.vectorA || 'retrieval';
          var kB = params.vectorB || 'search';
          var v1 = VECTORS[kA] ? VECTORS[kA].values : [1, 0];
          var v2 = VECTORS[kB] ? VECTORS[kB].values : [0, 1];
          var all = computeAll(v1, v2, Object.keys(VECTORS));

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Similarity Breakdown';
          container.appendChild(title);

          var html = '<div class="nv-lab-obs-breakdown">';
          html += '<div class="nv-lab-obs-breakdown-row"><span class="nv-lab-obs-breakdown-label">Dot Product</span><span class="nv-lab-obs-breakdown-value">' + all.dp.toFixed(4) + '</span></div>';
          html += '<div class="nv-lab-obs-breakdown-row"><span class="nv-lab-obs-breakdown-label">||A||</span><span class="nv-lab-obs-breakdown-value">' + all.n1.toFixed(4) + '</span></div>';
          html += '<div class="nv-lab-obs-breakdown-row"><span class="nv-lab-obs-breakdown-label">||B||</span><span class="nv-lab-obs-breakdown-value">' + all.n2.toFixed(4) + '</span></div>';
          html += '<div class="nv-lab-obs-breakdown-row"><span class="nv-lab-obs-breakdown-label">Angle</span><span class="nv-lab-obs-breakdown-value">' + all.ang.toFixed(2) + '°</span></div>';
          html += '<div class="nv-lab-obs-breakdown-row nv-lab-obs-breakdown-row--highlight"><span class="nv-lab-obs-breakdown-label">Cosine</span><span class="nv-lab-obs-breakdown-value">' + all.cos.toFixed(4) + '</span></div>';
          html += '</div>';
          container.innerHTML = html;
        }
      },
      {
        id: 'neighbor-ranking',
        title: 'Neighbor Ranking',
        purpose: 'Which vectors are closest?',
        defaultSize: 'small',
        render: function (container, params) {
          var kA = params.vectorA || 'retrieval';
          var v1 = VECTORS[kA] ? VECTORS[kA].values : [1, 0];
          var all = computeAll(v1, v1, Object.keys(VECTORS));

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Nearest Neighbors';
          container.appendChild(title);

          var html = '<div class="nv-lab-obs-ranking">';
          all.rankings.slice(0, 5).forEach(function (r, i) {
            var bar = Math.round(Math.max(0, r.cosine) * 100);
            html += '<div class="nv-lab-obs-rank-row">';
            html += '<span class="nv-lab-obs-rank-pos">' + (i + 1) + '</span>';
            html += '<span class="nv-lab-obs-rank-label">' + r.label + '</span>';
            html += '<div class="nv-lab-obs-rank-bar"><div class="nv-lab-obs-rank-fill" style="width:' + bar + '%"></div></div>';
            html += '<span class="nv-lab-obs-rank-val">' + r.cosine.toFixed(3) + '</span>';
            html += '</div>';
          });
          html += '</div>';
          container.innerHTML = html;
        }
      },
      {
        id: 'projection-analysis',
        title: 'Projection Analysis',
        purpose: 'How much of one vector lies along another?',
        defaultSize: 'small',
        render: function (container, params) {
          var kA = params.vectorA || 'retrieval';
          var kB = params.vectorB || 'search';
          var v1 = VECTORS[kA] ? VECTORS[kA].values : [1, 0];
          var v2 = VECTORS[kB] ? VECTORS[kB].values : [0, 1];
          var all = computeAll(v1, v2, Object.keys(VECTORS));
          var p = project2D(v1, v2);
          var proj2d = project2D(all.proj.vector, [0, 0]);

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Projection';
          container.appendChild(title);

          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 400 200');
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', 'Vector projection decomposition');
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.maxHeight = '180px';

          var cx = 100, cy = 150;
          var scale = 60;
          var maxC = Math.max(Math.abs(p.x1), Math.abs(p.y1), Math.abs(p.x2), Math.abs(p.y2), 1);
          var s = scale / maxC;

          // Vector B line
          var lineB = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          lineB.setAttribute('x1', cx); lineB.setAttribute('y1', cy);
          lineB.setAttribute('x2', cx + p.x2 * s / maxC * scale); lineB.setAttribute('y2', cy + p.y2 * s / maxC * scale);
          lineB.setAttribute('stroke', '#f59e0b'); lineB.setAttribute('stroke-width', '2');
          svg.appendChild(lineB);

          // Vector A line
          var lineA = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          lineA.setAttribute('x1', cx); lineA.setAttribute('y1', cy);
          lineA.setAttribute('x2', cx + p.x1 * s / maxC * scale); lineA.setAttribute('y2', cy + p.y1 * s / maxC * scale);
          lineA.setAttribute('stroke', '#06b6d4'); lineA.setAttribute('stroke-width', '2');
          svg.appendChild(lineA);

          // Projection line (dashed)
          var projScale = all.proj.scalar * scale / maxC;
          var bx = p.x2 / maxC * scale;
          var by = p.y2 / maxC * scale;
          var bLen = Math.sqrt(bx * bx + by * by);
          if (bLen > 0.01) {
            var px = (bx / bLen) * projScale;
            var py = (by / bLen) * projScale;
            var projLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            projLine.setAttribute('x1', cx); projLine.setAttribute('y1', cy);
            projLine.setAttribute('x2', cx + px); projLine.setAttribute('y2', cy + py);
            projLine.setAttribute('stroke', '#10b981'); projLine.setAttribute('stroke-width', '2');
            projLine.setAttribute('stroke-dasharray', '4 2');
            svg.appendChild(projLine);

            var projDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            projDot.setAttribute('cx', cx + px); projDot.setAttribute('cy', cy + py);
            projDot.setAttribute('r', '4'); projDot.setAttribute('fill', '#10b981');
            svg.appendChild(projDot);
          }

          // Labels
          var lblA = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          lblA.setAttribute('x', 10); lblA.setAttribute('y', 20);
          lblA.setAttribute('fill', '#06b6d4'); lblA.setAttribute('font-size', '10'); lblA.setAttribute('font-weight', '600');
          lblA.textContent = 'A (blue)';
          svg.appendChild(lblA);

          var lblB = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          lblB.setAttribute('x', 10); lblB.setAttribute('y', 35);
          lblB.setAttribute('fill', '#f59e0b'); lblB.setAttribute('font-size', '10'); lblB.setAttribute('font-weight', '600');
          lblB.textContent = 'B (orange)';
          svg.appendChild(lblB);

          var lblP = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          lblP.setAttribute('x', 10); lblP.setAttribute('y', 50);
          lblP.setAttribute('fill', '#10b981'); lblP.setAttribute('font-size', '10'); lblP.setAttribute('font-weight', '600');
          lblP.textContent = 'Projection (green)';
          svg.appendChild(lblP);

          container.appendChild(svg);
        }
      }
    ],
    execute: function (params) {
      var kA = params.vectorA || 'retrieval';
      var kB = params.vectorB || 'search';
      var v1 = VECTORS[kA] ? VECTORS[kA].values : [1, 0];
      var v2 = VECTORS[kB] ? VECTORS[kB].values : [0, 1];
      var all = computeAll(v1, v2, Object.keys(VECTORS));
      return {
        vector1: v1, vector2: v2,
        cosineSimilarity: all.cos,
        angleDegrees: all.ang,
        dotProduct: all.dp,
        projection: all.proj
      };
    },
    visualization: { type: 'svg-diagram', title: 'Vector Similarity' },
    canonicalStatus: 'reviewed',
    version: '1.0.0',
    reviewedBy: 'NeuralVerse Team',
    lastReviewed: '2026-07-07',
    estimatedDuration: '8 minutes'
  };

  if (window.NeuralVerse.LabRegistry && window.NeuralVerse.LabRegistry.register) {
    window.NeuralVerse.LabRegistry.register(labDefinition);
  }
})();
