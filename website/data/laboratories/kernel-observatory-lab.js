(function () {
  'use strict';

  window.NeuralVerse = window.NeuralVerse || {};

  var IMAGES = {
    verticalEdge: { label: 'Vertical Edge', generate: function () { var g = []; for (var y = 0; y < 16; y++) { var row = []; for (var x = 0; x < 16; x++) { row.push(x < 8 ? 0 : 255); } g.push(row); } return g; } },
    horizontalEdge: { label: 'Horizontal Edge', generate: function () { var g = []; for (var y = 0; y < 16; y++) { var row = []; for (var x = 0; x < 16; x++) { row.push(y < 8 ? 0 : 255); } g.push(row); } return g; } },
    diagonalEdge: { label: 'Diagonal Edge', generate: function () { var g = []; for (var y = 0; y < 16; y++) { var row = []; for (var x = 0; x < 16; x++) { row.push(x < y ? 0 : 255); } g.push(row); } return g; } },
    checkerboard: { label: 'Checkerboard', generate: function () { var g = []; for (var y = 0; y < 16; y++) { var row = []; for (var x = 0; x < 16; x++) { row.push(((Math.floor(x / 2) + Math.floor(y / 2)) % 2) ? 255 : 0); } g.push(row); } return g; } },
    gradient: { label: 'Horizontal Gradient', generate: function () { var g = []; for (var y = 0; y < 16; y++) { var row = []; for (var x = 0; x < 16; x++) { row.push(Math.round(255 * x / 15)); } g.push(row); } return g; } },
    centerImpulse: { label: 'Center Impulse', generate: function () { var g = []; for (var y = 0; y < 16; y++) { var row = []; for (var x = 0; x < 16; x++) { row.push((x === 8 && y === 8) ? 255 : 0); } g.push(row); } return g; } },
    noisy: { label: 'Seeded Noise', generate: function () { var s = 2800; function mulberry32() { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; } var g = []; for (var y = 0; y < 16; y++) { var row = []; for (var x = 0; x < 16; x++) { row.push(Math.round(255 * mulberry32())); } g.push(row); } return g; } },
    stripes: { label: 'Vertical Stripes', generate: function () { var g = []; for (var y = 0; y < 16; y++) { var row = []; for (var x = 0; x < 16; x++) { row.push((Math.floor(x / 2) % 2) ? 255 : 0); } g.push(row); } return g; } }
  };

  var KERNELS = {
    identity: { label: 'Identity', data: [[0,0,0],[0,1,0],[0,0,0]] },
    boxBlur: { label: 'Box Blur', data: [[1/9,1/9,1/9],[1/9,1/9,1/9],[1/9,1/9,1/9]] },
    gaussianBlur: { label: 'Gaussian Blur', data: [[1/16,2/16,1/16],[2/16,4/16,2/16],[1/16,2/16,1/16]] },
    sharpen: { label: 'Sharpen', data: [[0,-1,0],[-1,5,-1],[0,-1,0]] },
    sobelX: { label: 'Sobel X', data: [[-1,0,1],[-2,0,2],[-1,0,1]] },
    sobelY: { label: 'Sobel Y', data: [[-1,-2,-1],[0,0,0],[1,2,1]] },
    laplacian: { label: 'Laplacian', data: [[0,1,0],[1,-4,1],[0,1,0]] }
  };

  function convolve(image, kernel, stride, padding, mode) {
    var kh = kernel.length, kw = kernel[0].length;
    var ih = image.length, iw = image[0].length;
    if (mode === 'convolution') {
      kernel = kernel.slice().reverse().map(function (r) { return r.slice().reverse(); });
    }
    var padded = [];
    for (var y = 0; y < ih + 2 * padding; y++) {
      var row = [];
      for (var x = 0; x < iw + 2 * padding; x++) {
        if (y < padding || y >= ih + padding || x < padding || x >= iw + padding) {
          row.push(0);
        } else {
          row.push(image[y - padding][x - padding]);
        }
      }
      padded.push(row);
    }
    var oh = Math.floor((padded.length - kh) / stride) + 1;
    var ow = Math.floor((padded[0].length - kw) / stride) + 1;
    if (oh < 1 || ow < 1) return { output: [], oh: 0, ow: 0 };
    var out = [];
    for (var r = 0; r < oh; r++) {
      var row = [];
      for (var c = 0; c < ow; c++) {
        var sum = 0;
        for (var ky = 0; ky < kh; ky++) {
          for (var kx = 0; kx < kw; kx++) {
            sum += padded[r * stride + ky][c * stride + kx] * kernel[ky][kx];
          }
        }
        row.push(sum);
      }
      out.push(row);
    }
    return { output: out, oh: oh, ow: ow };
  }

  function computeMetrics(output) {
    if (!output || output.length === 0) return {};
    var flat = [];
    for (var y = 0; y < output.length; y++) for (var x = 0; x < output[y].length; x++) flat.push(output[y][x]);
    var n = flat.length;
    var sum = 0, sumSq = 0, max = -Infinity, min = Infinity, absSum = 0, posCount = 0;
    for (var i = 0; i < n; i++) {
      sum += flat[i]; sumSq += flat[i] * flat[i];
      if (flat[i] > max) max = flat[i]; if (flat[i] < min) min = flat[i];
      absSum += Math.abs(flat[i]); if (flat[i] !== 0) posCount++;
    }
    var mean = sum / n;
    var variance = sumSq / n - mean * mean;
    return {
      outputMean: Math.round(mean * 1000) / 1000,
      outputStd: Math.round(Math.sqrt(Math.max(0, variance)) * 1000) / 1000,
      responseEnergy: Math.round(sumSq * 1000) / 1000,
      edgeResponse: Math.round(absSum / n * 1000) / 1000,
      sparsity: Math.round((1 - posCount / n) * 1000) / 1000,
      maxResponse: Math.round(max * 1000) / 1000,
      minResponse: Math.round(min * 1000) / 1000,
      outputDims: output.length + 'x' + output[0].length,
      kernelApps: n
    };
  }

  var labDefinition = {
    id: 'lab-kernel-observatory',
    slug: 'kernel-observatory',
    title: 'Kernel Observatory',
    summary: 'Observe, predict, and inspect 2D image convolution. Manipulate kernels, inputs, and parameters in a deterministic environment.',
    category: 'Computer Vision',
    artifactReferences: ['artifact-convolution-computer-vision-explanatory-text'],
    conceptReferences: ['cnn.convolution', 'cnn.kernel', 'cnn.cross_correlation', 'cnn.feature_map', 'cnn.stride', 'cnn.padding'],
    parameterSchema: [
      { name: 'imagePreset', type: 'select', options: Object.keys(IMAGES), default: 'verticalEdge', label: 'Image Preset', description: 'Deterministic 16x16 grayscale fixture.', scientificMeaning: 'Input signal for convolution.', unitClassification: 'fixture' },
      { name: 'kernelPreset', type: 'select', options: Object.keys(KERNELS), default: 'sobelX', label: 'Kernel Preset', description: 'Fixed 3x3 convolution kernel.', scientificMeaning: 'Local operator applied to input.', unitClassification: 'kernel' },
      { name: 'stride', type: 'select', options: ['1', '2'], default: '1', label: 'Stride', description: 'Spacing between kernel placements.', scientificMeaning: 'Sampling interval for output grid.', unitClassification: 'integer' },
      { name: 'padding', type: 'select', options: ['valid', 'same-zero'], default: 'valid', label: 'Padding', description: 'Boundary extension strategy.', scientificMeaning: 'Border handling policy.', unitClassification: 'enum' },
      { name: 'mode', type: 'select', options: ['correlation', 'convolution'], default: 'correlation', label: 'Mode', description: 'Operation convention.', scientificMeaning: 'Whether kernel is flipped before sliding.', unitClassification: 'enum' }
    ],
    initialState: { imagePreset: 'verticalEdge', kernelPreset: 'sobelX', stride: '1', padding: 'valid', mode: 'correlation' },
    steps: [
      {
        label: 'Configure',
        log: 'Select image, kernel, stride, padding, and mode',
        state: function (p) {
          var img = IMAGES[p.imagePreset].generate();
          var ker = KERNELS[p.kernelPreset].data;
          var pad = p.padding === 'same-zero' ? 1 : 0;
          var str = parseInt(p.stride, 10);
          var res = convolve(img, ker, str, pad, p.mode);
          var metrics = computeMetrics(res.output);
          return {
            imagePreset: p.imagePreset,
            kernelPreset: p.kernelPreset,
            stride: str,
            padding: p.padding,
            mode: p.mode,
            outputDims: metrics.outputDims || '0x0',
            kernelApps: metrics.kernelApps || 0,
            outputMean: metrics.outputMean || 0,
            responseEnergy: metrics.responseEnergy || 0,
            maxResponse: metrics.maxResponse || 0,
            status: 'Configured'
          };
        },
        metrics: function (p) {
          var pad = p.padding === 'same-zero' ? 1 : 0;
          var str = parseInt(p.stride, 10);
          var img = IMAGES[p.imagePreset].generate();
          var ker = KERNELS[p.kernelPreset].data;
          var res = convolve(img, ker, str, pad, p.mode);
          var m = computeMetrics(res.output);
          return {
            'Image': IMAGES[p.imagePreset].label,
            'Kernel': KERNELS[p.kernelPreset].label,
            'Mode': p.mode,
            'Padding': p.padding,
            'Stride': str,
            'Output Dims': m.outputDims || '-',
            'Mean': String(m.outputMean || 0),
            'Energy': String(m.responseEnergy || 0),
            'Peak': String(m.maxResponse || 0)
          };
        },
        viz: function (p) {
          var pad = p.padding === 'same-zero' ? 1 : 0;
          var str = parseInt(p.stride, 10);
          var img = IMAGES[p.imagePreset].generate();
          var ker = KERNELS[p.kernelPreset].data;
          var res = convolve(img, ker, str, pad, p.mode);
          return {
            input: img,
            kernel: ker,
            output: res.output,
            oh: res.oh,
            ow: res.ow,
            stride: str,
            padding: p.padding,
            mode: p.mode,
            type: 'configure'
          };
        }
      }
    ],
    observations: [
      {
        id: 'input-output-pair',
        title: 'Input / Output',
        purpose: 'Compare input image and convolution result side by side.',
        defaultSize: 'large',
        render: function (container, params) {
          var pad = params.padding === 'same-zero' ? 1 : 0;
          var str = parseInt(params.stride, 10);
          var img = IMAGES[params.imagePreset].generate();
          var ker = KERNELS[params.kernelPreset].data;
          var res = convolve(img, ker, str, pad, params.mode);

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Input / Output';
          container.appendChild(title);

          var wrap = document.createElement('div');
          wrap.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;justify-content:center;';

          function renderGrid(data, label, maxVal) {
            var block = document.createElement('div');
            block.style.cssText = 'text-align:center;';
            var lbl = document.createElement('div');
            lbl.style.cssText = 'font-size:11px;color:var(--nv-text-secondary,#94a3b8);margin-bottom:4px;';
            lbl.textContent = label;
            block.appendChild(lbl);
            var grid = document.createElement('div');
            grid.style.cssText = 'display:inline-grid;grid-template-columns:repeat(' + data[0].length + ',18px);gap:1px;';
            grid.setAttribute('role', 'img');
            grid.setAttribute('aria-label', label + ' ' + data.length + 'x' + data[0].length);
            for (var y = 0; y < data.length; y++) {
              for (var x = 0; x < data[y].length; x++) {
                var cell = document.createElement('div');
                var v = data[y][x];
                var norm = maxVal > 0 ? Math.round(((v + maxVal) / (2 * maxVal)) * 255) : 128;
                cell.style.cssText = 'width:18px;height:18px;background:rgb(' + norm + ',' + norm + ',' + norm + ');border-radius:2px;';
                cell.title = '(' + y + ',' + x + '): ' + (Math.round(v * 100) / 100);
                grid.appendChild(cell);
              }
            }
            block.appendChild(grid);
            return block;
          }

          var inMax = 255;
          var outFlat = [];
          for (var y = 0; y < res.output.length; y++) for (var x = 0; x < res.output[y].length; x++) outFlat.push(Math.abs(res.output[y][x]));
          var outMax = outFlat.length > 0 ? Math.max.apply(null, outFlat) : 1;

          wrap.appendChild(renderGrid(img, IMAGES[params.imagePreset].label, inMax));
          if (res.output.length > 0) {
            var arrow = document.createElement('div');
            arrow.style.cssText = 'display:flex;align-items:center;font-size:20px;color:var(--nv-text-secondary,#94a3b8);';
            arrow.textContent = '\u2192';
            wrap.appendChild(arrow);
            wrap.appendChild(renderGrid(res.output, 'Output (' + res.oh + 'x' + res.ow + ')', outMax));
          }
          container.appendChild(wrap);
        },
        interpretation: function () { return 'The output grid shows the convolution response. Brighter cells indicate stronger response to the selected kernel.'; }
      },
      {
        id: 'kernel-view',
        title: 'Kernel',
        purpose: 'Inspect kernel values and sum.',
        defaultSize: 'small',
        render: function (container, params) {
          var ker = KERNELS[params.kernelPreset].data;
          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Kernel: ' + KERNELS[params.kernelPreset].label;
          container.appendChild(title);

          var table = document.createElement('div');
          table.style.cssText = 'display:inline-grid;grid-template-columns:repeat(3,48px);gap:2px;font-family:monospace;font-size:12px;text-align:center;';
          table.setAttribute('role', 'table');
          table.setAttribute('aria-label', 'Kernel values');
          var kSum = 0;
          for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
              var cell = document.createElement('div');
              cell.style.cssText = 'padding:6px 4px;background:var(--nv-surface-2,#1e293b);border-radius:3px;color:var(--nv-text-primary,#e2e8f0);';
              var v = Math.round(ker[y][x] * 1000) / 1000;
              cell.textContent = v;
              cell.setAttribute('role', 'cell');
              table.appendChild(cell);
              kSum += ker[y][x];
            }
          }
          container.appendChild(table);
          var info = document.createElement('div');
          info.style.cssText = 'margin-top:8px;font-size:12px;color:var(--nv-text-secondary,#94a3b8);';
          info.textContent = 'Sum: ' + (Math.round(kSum * 1000) / 1000) + ' | Size: 3x3';
          container.appendChild(info);
        },
        interpretation: function () { return 'The kernel weights define the local operation. Sum=1 preserves brightness; sum=0 produces edge-like responses.'; }
      },
      {
        id: 'metrics-view',
        title: 'Output Metrics',
        purpose: 'Quantitative summary of the convolution result.',
        defaultSize: 'small',
        render: function (container, params) {
          var pad = params.padding === 'same-zero' ? 1 : 0;
          var str = parseInt(params.stride, 10);
          var img = IMAGES[params.imagePreset].generate();
          var ker = KERNELS[params.kernelPreset].data;
          var res = convolve(img, ker, str, pad, params.mode);
          var m = computeMetrics(res.output);

          container.innerHTML = '';
          var title = document.createElement('h4');
          title.className = 'nv-lab-obs-title';
          title.textContent = 'Metrics';
          container.appendChild(title);

          var rows = [
            ['Output Dims', m.outputDims || '-'],
            ['Kernel Apps', String(m.kernelApps || 0)],
            ['Mean', String(m.outputMean || 0)],
            ['Std Dev', String(m.outputStd || 0)],
            ['Energy', String(m.responseEnergy || 0)],
            ['Edge Response', String(m.edgeResponse || 0)],
            ['Sparsity', String(m.sparsity || 0)],
            ['Max', String(m.maxResponse || 0)],
            ['Min', String(m.minResponse || 0)]
          ];

          var table = document.createElement('div');
          table.style.cssText = 'font-size:12px;';
          table.setAttribute('role', 'table');
          table.setAttribute('aria-label', 'Output metrics');
          for (var i = 0; i < rows.length; i++) {
            var row = document.createElement('div');
            row.style.cssText = 'display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--nv-border,#334155);';
            var lbl = document.createElement('span');
            lbl.style.cssText = 'color:var(--nv-text-secondary,#94a3b8);';
            lbl.textContent = rows[i][0];
            var val = document.createElement('span');
            val.style.cssText = 'font-family:monospace;color:var(--nv-text-primary,#e2e8f0);';
            val.textContent = rows[i][1];
            row.appendChild(lbl);
            row.appendChild(val);
            table.appendChild(row);
          }
          container.appendChild(table);
        },
        interpretation: function () { return 'Metrics quantify the overall response. Energy captures response magnitude; sparsity measures how many output cells are zero.'; }
      }
    ],
    inspector: {
      title: 'Convolution State',
      sections: [
        {
          label: 'Configuration',
          cards: [
            { key: 'imagePreset', label: 'Image', unit: '' },
            { key: 'kernelPreset', label: 'Kernel', unit: '' },
            { key: 'mode', label: 'Mode', unit: '' },
            { key: 'stride', label: 'Stride', unit: '' },
            { key: 'padding', label: 'Padding', unit: '' }
          ]
        },
        {
          label: 'Output',
          cards: [
            { key: 'outputDims', label: 'Dimensions', unit: '' },
            { key: 'kernelApps', label: 'Kernel Applications', unit: '' },
            { key: 'outputMean', label: 'Mean Response', unit: '' },
            { key: 'responseEnergy', label: 'Energy', unit: '' },
            { key: 'maxResponse', label: 'Peak', unit: '' }
          ]
        }
      ],
      computeState: function (params) {
        var pad = params.padding === 'same-zero' ? 1 : 0;
        var str = parseInt(params.stride, 10);
        var img = IMAGES[params.imagePreset].generate();
        var ker = KERNELS[params.kernelPreset].data;
        var res = convolve(img, ker, str, pad, params.mode);
        var m = computeMetrics(res.output);
        return {
          imagePreset: IMAGES[params.imagePreset].label,
          kernelPreset: KERNELS[params.kernelPreset].label,
          mode: params.mode,
          stride: str,
          padding: params.padding,
          outputDims: m.outputDims || '0x0',
          kernelApps: m.kernelApps || 0,
          outputMean: m.outputMean || 0,
          responseEnergy: m.responseEnergy || 0,
          maxResponse: m.maxResponse || 0
        };
      },
      changeDetector: function () { return []; }
    },
    execute: function (params) {
      var pad = params.padding === 'same-zero' ? 1 : 0;
      var str = parseInt(params.stride, 10);
      var img = IMAGES[params.imagePreset].generate();
      var ker = KERNELS[params.kernelPreset].data;
      var res = convolve(img, ker, str, pad, params.mode);
      var m = computeMetrics(res.output);
      return {
        input: IMAGES[params.imagePreset].label,
        kernel: KERNELS[params.kernelPreset].label,
        output: res.output,
        oh: res.oh,
        ow: res.ow,
        metrics: m,
        params: { stride: str, padding: params.padding, mode: params.mode }
      };
    },
    visualization: { type: 'numeric-summary', title: 'Kernel Observatory' },
    scientificStage: {
      title: '2D Image Convolution',
      scientificQuestion: 'How does a kernel transform local image neighborhoods?',
      evidence: [
        { key: 'outputDims', label: 'Output Dimensions' },
        { key: 'outputMean', label: 'Mean Response' },
        { key: 'responseEnergy', label: 'Response Energy' },
        { key: 'maxResponse', label: 'Peak Response' }
      ],
      interpretation: 'The convolution output and its metrics reveal how the selected kernel responds to the selected image structure.'
    },
    canonicalStatus: 'Draft',
    version: '0.1.0',
    reviewedBy: 'NV-2800 Pipeline',
    lastReviewed: '2026-07-15',
    estimatedDuration: '15-20 minutes'
  };

  if (window.NeuralVerse.LabRegistry && window.NeuralVerse.LabRegistry.register) {
    window.NeuralVerse.LabRegistry.register(labDefinition);
  }
})();
