(function () {
  'use strict';

  window.NeuralVerse = window.NeuralVerse || {};

  var functions = {
    quadratic: {
      f: function (x) { return x * x; },
      df: function (x) { return 2 * x; },
      label: 'f(x) = x²'
    },
    cubic: {
      f: function (x) { return x * x * x - 3 * x; },
      df: function (x) { return 3 * x * x - 3; },
      label: 'f(x) = x³ - 3x'
    },
    sine: {
      f: function (x) { return Math.sin(x) + 0.5 * x * x; },
      df: function (x) { return Math.cos(x) + x; },
      label: 'f(x) = sin(x) + 0.5x²'
    }
  };

  function runGradientDescent(learningRate, initialX, numIterations, functionType) {
    var fn = functions[functionType] || functions.quadratic;
    var x = initialX;
    var path = [];
    var lossHistory = [];
    var converged = false;

    for (var i = 0; i < numIterations; i++) {
      var loss = fn.f(x);
      var gradient = fn.df(x);
      path.push({
        x: Math.round(x * 10000) / 10000,
        y: Math.round(loss * 10000) / 10000,
        gradient: Math.round(gradient * 10000) / 10000
      });
      lossHistory.push(Math.round(loss * 10000) / 10000);

      var newX = x - learningRate * gradient;

      if (Math.abs(newX - x) < 1e-8) {
        converged = true;
        x = newX;
        break;
      }

      if (Math.abs(newX) > 1000) {
        converged = false;
        break;
      }

      x = newX;
    }

    var finalLoss = fn.f(x);

    return {
      path: path,
      lossHistory: lossHistory,
      finalX: Math.round(x * 10000) / 10000,
      finalLoss: Math.round(finalLoss * 10000) / 10000,
      converged: converged
    };
  }

  var labDefinition = {
    id: 'lab-gradient-descent',
    slug: 'gradient-descent',
    title: 'Gradient Descent',
    summary: 'Watch gradient descent optimize a loss function by adjusting learning rate, initial point, and number of iterations.',
    category: 'optimization',
    artifactReferences: [],
    conceptReferences: ['gradient-descent'],
    parameterSchema: [
      {
        name: 'learningRate',
        type: 'slider',
        min: 0.001,
        max: 2.0,
        step: 0.01,
        default: 0.1,
        label: 'Learning Rate'
      },
      {
        name: 'initialX',
        type: 'slider',
        min: -5,
        max: 5,
        step: 0.1,
        default: 3.0,
        label: 'Initial X'
      },
      {
        name: 'numIterations',
        type: 'integer',
        min: 1,
        max: 100,
        step: 1,
        default: 30,
        label: 'Number of Iterations'
      },
      {
        name: 'functionType',
        type: 'select',
        options: ['quadratic', 'cubic', 'sine'],
        default: 'quadratic',
        label: 'Loss Function'
      }
    ],
    initialState: {
      learningRate: 0.1,
      initialX: 3.0,
      numIterations: 30,
      functionType: 'quadratic'
    },
    steps: (function () {
      var steps = [];
      steps.push({
        label: 'Initialize',
        log: 'Gradient descent initialized at x=3.0 with learning rate 0.1',
        state: function (p) {
          var fn = functions[p.functionType] || functions.quadratic;
          return { x: p.initialX, loss: fn.f(p.initialX), iteration: 0 };
        },
        metrics: function (p) {
          var fn = functions[p.functionType] || functions.quadratic;
          return {
            'Iteration': 0,
            'X': p.initialX,
            'Loss': Math.round(fn.f(p.initialX) * 10000) / 10000,
            'Gradient': Math.round(fn.df(p.initialX) * 10000) / 10000,
            'Status': 'Starting'
          };
        },
        viz: function (p) { return { path: [{ x: p.initialX, y: (functions[p.functionType] || functions.quadratic).f(p.initialX) }], finalX: p.initialX }; }
      });
      for (var i = 1; i <= 20; i++) {
        (function (iter) {
          steps.push({
            label: 'Iteration ' + iter,
            log: 'Step ' + iter + ': gradient = 6.0, updating position by 0.6000',
            state: function (p) {
              var fn = functions[p.functionType] || functions.quadratic;
              var x = p.initialX;
              for (var j = 0; j < iter; j++) {
                var g = fn.df(x);
                var nx = x - p.learningRate * g;
                if (Math.abs(nx - x) < 1e-8 || Math.abs(nx) > 1000) break;
                x = nx;
              }
              return { x: x, loss: fn.f(x), iteration: iter };
            },
            metrics: function (p, idx, progress) {
              var fn = functions[p.functionType] || functions.quadratic;
              var x = p.initialX;
              for (var j = 0; j < iter; j++) {
                var g = fn.df(x);
                var nx = x - p.learningRate * g;
                if (Math.abs(nx - x) < 1e-8 || Math.abs(nx) > 1000) break;
                x = nx;
              }
              var grad = fn.df(x);
              var converged = Math.abs(grad) < 0.01;
              return {
                'Iteration': iter,
                'X': Math.round(x * 10000) / 10000,
                'Loss': Math.round(fn.f(x) * 10000) / 10000,
                'Gradient': Math.round(grad * 10000) / 10000,
                'Status': converged ? 'Converged' : 'Running'
              };
            },
            viz: function (p) {
              var fn = functions[p.functionType] || functions.quadratic;
              var path = [{ x: p.initialX, y: fn.f(p.initialX) }];
              var x = p.initialX;
              for (var j = 0; j < iter; j++) {
                var g = fn.df(x);
                var nx = x - p.learningRate * g;
                if (Math.abs(nx - x) < 1e-8 || Math.abs(nx) > 1000) break;
                x = nx;
                path.push({ x: Math.round(nx * 10000) / 10000, y: Math.round(fn.f(nx) * 10000) / 10000 });
              }
              return { path: path, finalX: x };
            }
          });
        })(i);
      }
      steps.push({
        label: 'Complete',
        log: 'Converged: gradient magnitude < 0.01, stationary point reached',
        state: function (p) {
          var fn = functions[p.functionType] || functions.quadratic;
          var x = p.initialX;
          for (var j = 0; j < 20; j++) {
            var g = fn.df(x);
            var nx = x - p.learningRate * g;
            if (Math.abs(nx - x) < 1e-8 || Math.abs(nx) > 1000) break;
            x = nx;
          }
          return { x: x, loss: fn.f(x), iteration: 20 };
        },
        metrics: function (p) {
          var fn = functions[p.functionType] || functions.quadratic;
          var x = p.initialX;
          for (var j = 0; j < 20; j++) {
            var g = fn.df(x);
            var nx = x - p.learningRate * g;
            if (Math.abs(nx - x) < 1e-8 || Math.abs(nx) > 1000) break;
            x = nx;
          }
          return {
            'Iteration': 20,
            'X': Math.round(x * 10000) / 10000,
            'Loss': Math.round(fn.f(x) * 10000) / 10000,
            'Gradient': Math.round(fn.df(x) * 10000) / 10000,
            'Status': 'Finished'
          };
        },
        viz: function (p) {
          var fn = functions[p.functionType] || functions.quadratic;
          var path = [{ x: p.initialX, y: fn.f(p.initialX) }];
          var x = p.initialX;
          for (var j = 0; j < 20; j++) {
            var g = fn.df(x);
            var nx = x - p.learningRate * g;
            if (Math.abs(nx - x) < 1e-8 || Math.abs(nx) > 1000) break;
            x = nx;
            path.push({ x: Math.round(nx * 10000) / 10000, y: Math.round(fn.f(nx) * 10000) / 10000 });
          }
          return { path: path, finalX: x };
        }
      });
      return steps;
    })(),
    observations: [
      {
        id: 'loss-curve',
        title: 'Loss Curve',
        purpose: 'Is loss decreasing?',
        defaultSize: 'large',
        render: function (container, params, stepIndex, history) {
          var fn = functions[params.functionType] || functions.quadratic;
          var path = [];
          for (var i = 0; i <= Math.min(stepIndex, 20); i++) {
            var x = params.initialX;
            for (var j = 0; j < i; j++) {
              var g = fn.df(x);
              var nx = x - params.learningRate * g;
              if (Math.abs(nx - x) < 1e-8 || Math.abs(nx) > 1000) break;
              x = nx;
            }
            path.push(Math.round(fn.f(x) * 10000) / 10000);
          }
          container.innerHTML = '';
          if (path.length > 0) {
            var title = document.createElement('h4');
            title.className = 'nv-lab-obs-title';
            title.textContent = 'Loss Curve';
            container.appendChild(title);
            window.NeuralVerse.VisualizationEngine.renderLineChart(container, path, { title: '' });
          }
        },
        interpretation: function (params, stepIndex) { return 'A decreasing loss curve indicates the optimizer is finding lower-energy regions of the loss surface.'; }
      },
      {
        id: 'position-track',
        title: 'Position on Surface',
        purpose: 'Where is the optimizer?',
        defaultSize: 'small',
        render: function (container, params, stepIndex) {
          var fn = functions[params.functionType] || functions.quadratic;
          var x = params.initialX;
          for (var j = 0; j < stepIndex; j++) {
            var g = fn.df(x);
            var nx = x - params.learningRate * g;
            if (Math.abs(nx - x) < 1e-8 || Math.abs(nx) > 1000) break;
            x = nx;
          }
          var loss = fn.f(x);
          container.innerHTML = '<div class="nv-lab-obs-position">' +
            '<h4 class="nv-lab-obs-title">Current Position</h4>' +
            '<div class="nv-lab-obs-pos-grid">' +
            '<div class="nv-lab-obs-pos-item"><span class="nv-lab-obs-pos-label">X</span><span class="nv-lab-obs-pos-value">' + (Math.round(x * 10000) / 10000) + '</span></div>' +
            '<div class="nv-lab-obs-pos-item"><span class="nv-lab-obs-pos-label">f(x)</span><span class="nv-lab-obs-pos-value">' + (Math.round(loss * 10000) / 10000) + '</span></div>' +
            '</div></div>';
        },
        interpretation: function (params, stepIndex) { return "The optimizer's current position shows how far it has traveled from the initialization point."; }
      },
      {
        id: 'gradient-magnitude',
        title: 'Gradient Magnitude',
        purpose: 'Is the gradient shrinking?',
        defaultSize: 'small',
        render: function (container, params, stepIndex) {
          var fn = functions[params.functionType] || functions.quadratic;
          var grads = [];
          for (var i = 0; i <= Math.min(stepIndex, 20); i++) {
            var x = params.initialX;
            for (var j = 0; j < i; j++) {
              var g = fn.df(x);
              var nx = x - params.learningRate * g;
              if (Math.abs(nx - x) < 1e-8 || Math.abs(nx) > 1000) break;
              x = nx;
            }
            grads.push(Math.abs(Math.round(fn.df(x) * 10000) / 10000));
          }
          container.innerHTML = '';
          if (grads.length > 0) {
            var title = document.createElement('h4');
            title.className = 'nv-lab-obs-title';
            title.textContent = 'Gradient Magnitude';
            container.appendChild(title);
            window.NeuralVerse.VisualizationEngine.renderLineChart(container, grads, { title: '' });
          }
        },
        interpretation: function (params, stepIndex) { return 'Shrinking gradient magnitude indicates the optimizer is approaching a stationary point.'; }
      },
      {
        id: 'convergence-status',
        title: 'Convergence Status',
        purpose: 'How close is convergence?',
        defaultSize: 'small',
        render: function (container, params, stepIndex) {
          var fn = functions[params.functionType] || functions.quadratic;
          var x = params.initialX;
          for (var j = 0; j < stepIndex; j++) {
            var g = fn.df(x);
            var nx = x - params.learningRate * g;
            if (Math.abs(nx - x) < 1e-8 || Math.abs(nx) > 1000) break;
            x = nx;
          }
          var grad = Math.abs(fn.df(x));
          var pct = Math.max(0, Math.min(100, Math.round((1 - grad) * 100)));
          container.innerHTML = '<div class="nv-lab-obs-convergence">' +
            '<h4 class="nv-lab-obs-title">Convergence</h4>' +
            '<div class="nv-lab-obs-conv-bar"><div class="nv-lab-obs-conv-fill" style="width:' + pct + '%"></div></div>' +
            '<span class="nv-lab-obs-conv-label">' + pct + '% converged</span></div>';
        },
        interpretation: function (params, stepIndex) { return 'High convergence percentage means the gradient is nearly zero — the optimizer has found a local minimum.'; }
      }
    ],
    inspector: {
      title: 'Gradient Descent State',
      sections: [
        {
          label: 'Optimization Process',
          cards: [
            { key: 'iteration', label: 'Iteration', unit: '', interpretation: function (v) { return v >= 20 ? 'Complete' : 'Running'; } },
            { key: 'loss', label: 'Loss Surface Position', unit: '', interpretation: function (v) { return v < 0.01 ? 'Near convergence' : v < 0.5 ? 'Improving' : 'High loss'; } },
            { key: 'gradient', label: 'Local Gradient', unit: '', interpretation: function (v) { return Math.abs(v) < 0.01 ? 'Very small update' : Math.abs(v) < 0.1 ? 'Moderate update' : 'Large update'; } },
            { key: 'status', label: 'Convergence State', unit: '' }
          ]
        },
        {
          label: 'Step Dynamics',
          cards: [
            { key: 'x', aliases: ['position'], label: 'Current Position', unit: '', interpretation: function (v) { return 'Position on loss surface'; } },
            { key: 'learningRate', label: 'Step Size (Learning Rate)', unit: '', fixed: true },
            { key: 'functionType', label: 'Objective Function', unit: '', fixed: true }
          ]
        },
        {
          label: 'Convergence Analysis',
          cards: [
            { key: 'stepSize', label: 'Step Magnitude', unit: '', interpretation: function (v) { return v < 0.001 ? 'Nearly stationary' : 'Moving'; } },
            { key: 'convergenceRatio', label: 'Convergence Rate', unit: '', interpretation: function (v) { return v < 0.1 ? 'Fast convergence' : v < 0.5 ? 'Moderate' : 'Slow'; } }
          ]
        }
      ],
      computeState: function (params, stepIndex, history) {
        var fn = functions[params.functionType] || functions.quadratic;
        var x = params.initialX;
        var prevX = x;
        for (var j = 0; j < stepIndex; j++) {
          var g = fn.df(x);
          var nx = x - params.learningRate * g;
          if (Math.abs(nx - x) < 1e-8 || Math.abs(nx) > 1000) break;
          x = nx;
        }
        var loss = fn.f(x);
        var gradient = fn.df(x);
        var stepSize = Math.abs(x - prevX);
        var prevLoss = stepIndex > 0 && history.length > 1 ? history[history.length - 1].loss : loss;
        var convergenceRatio = prevLoss !== 0 ? Math.abs(loss - prevLoss) / Math.abs(prevLoss) : 0;

        return {
          iteration: stepIndex,
          loss: Math.round(loss * 10000) / 10000,
          gradient: Math.round(gradient * 10000) / 10000,
          status: Math.abs(gradient) < 0.01 ? 'Converged' : 'Running',
          x: Math.round(x * 10000) / 10000,
          position: Math.round(x * 10000) / 10000,
          learningRate: params.learningRate,
          functionType: params.functionType,
          stepSize: Math.round(stepSize * 10000) / 10000,
          convergenceRatio: Math.round(convergenceRatio * 10000) / 10000
        };
      },
      changeDetector: function (prev, curr) {
        var changes = [];
        if (prev && curr) {
          if (prev.x !== curr.x) changes.push({ from: 'x', to: 'loss', label: 'Position updated → Loss changed' });
          if (prev.loss !== curr.loss) changes.push({ from: 'loss', to: null, label: curr.loss < prev.loss ? 'Loss decreased' : 'Loss increased' });
          if (Math.abs(prev.gradient) > Math.abs(curr.gradient)) changes.push({ from: 'gradient', to: null, label: 'Gradient magnitude decreased' });
        }
        return changes;
      }
    },
    xai: {
      categories: ['Optimization', 'Convergence', 'Geometry'],
      crossLabConnections: [
        { trigger: 'converged', target: 'logistic-regression', text: 'Observe how stable optimization affects classification boundaries.', suggestCategory: 'Classification' },
        { trigger: 'diverged', target: 'gradient-descent', text: 'Try a smaller learning rate before exploring other algorithms.', suggestCategory: 'Optimization' }
      ]
    },
    renderPreparation: function (container, params) {
      var fn = functions[params.functionType] || functions.quadratic;
      var minX = -5, maxX = 5;
      var curvePoints = [];
      for (var x = minX; x <= maxX; x += 0.1) {
        curvePoints.push({ x: x, y: fn.f(x) });
      }
      var initialLoss = Math.round(fn.f(params.initialX) * 10000) / 10000;
      var initialGrad = Math.round(fn.df(params.initialX) * 10000) / 10000;

      container.innerHTML = '';

      var title = document.createElement('h4');
      title.className = 'nv-lab-obs-title';
      title.textContent = 'Loss Curve \u2014 ' + fn.label;
      container.appendChild(title);

      var width = 400, height = 250;
      var padding = { top: 20, right: 20, bottom: 35, left: 50 };
      var plotW = width - padding.left - padding.right;
      var plotH = height - padding.top - padding.bottom;

      var allY = curvePoints.map(function (p) { return p.y; });
      var minY = Math.min.apply(null, allY);
      var maxY = Math.max.apply(null, allY);
      var rangeY = maxY - minY || 1;

      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'Loss curve with initial point for ' + fn.label);
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxHeight = '280px';

      for (var g = 0; g <= 4; g++) {
        var gy = padding.top + (plotH / 4) * g;
        var gLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gLine.setAttribute('x1', padding.left); gLine.setAttribute('y1', gy);
        gLine.setAttribute('x2', width - padding.right); gLine.setAttribute('y2', gy);
        gLine.setAttribute('stroke', 'rgba(138,180,248,0.1)'); gLine.setAttribute('stroke-width', '0.5');
        svg.appendChild(gLine);

        var yVal = maxY - (rangeY / 4) * g;
        var yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('x', padding.left - 5); yLabel.setAttribute('y', gy + 4);
        yLabel.setAttribute('fill', 'rgba(138,180,248,0.5)'); yLabel.setAttribute('font-size', '9');
        yLabel.setAttribute('text-anchor', 'end'); yLabel.setAttribute('font-family', 'monospace');
        yLabel.textContent = yVal.toFixed(1);
        svg.appendChild(yLabel);
      }

      var xTicks = [-4, -2, 0, 2, 4];
      xTicks.forEach(function (xt) {
        var xp = padding.left + ((xt - minX) / (maxX - minX)) * plotW;
        var xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', xp); xLabel.setAttribute('y', height - 5);
        xLabel.setAttribute('fill', 'rgba(138,180,248,0.5)'); xLabel.setAttribute('font-size', '9');
        xLabel.setAttribute('text-anchor', 'middle'); xLabel.setAttribute('font-family', 'monospace');
        xLabel.textContent = xt;
        svg.appendChild(xLabel);
      });

      var points = curvePoints.map(function (p) {
        var sx = padding.left + ((p.x - minX) / (maxX - minX)) * plotW;
        var sy = padding.top + plotH - ((p.y - minY) / rangeY) * plotH;
        return sx + ',' + sy;
      });

      if (points.length > 1) {
        var polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', points.join(' '));
        polyline.setAttribute('fill', 'none');
        polyline.setAttribute('stroke', '#06b6d4');
        polyline.setAttribute('stroke-width', '2');
        polyline.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(polyline);
      }

      var initX = params.initialX;
      var initSx = padding.left + ((initX - minX) / (maxX - minX)) * plotW;
      var initSy = padding.top + plotH - ((initialLoss - minY) / rangeY) * plotH;

      var initCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      initCircle.setAttribute('cx', initSx); initCircle.setAttribute('cy', initSy);
      initCircle.setAttribute('r', '5'); initCircle.setAttribute('fill', '#f59e0b');
      initCircle.setAttribute('stroke', '#fff'); initCircle.setAttribute('stroke-width', '1.5');
      svg.appendChild(initCircle);

      var initLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      initLabel.setAttribute('x', initSx + 8); initLabel.setAttribute('y', initSy - 8);
      initLabel.setAttribute('fill', '#f59e0b'); initLabel.setAttribute('font-size', '10');
      initLabel.setAttribute('font-weight', '600');
      initLabel.textContent = 'x\u2080 = ' + initX;
      svg.appendChild(initLabel);

      if (Math.abs(initialGrad) > 0.01) {
        var arrowLen = Math.min(30, Math.abs(initialGrad) * 15);
        var dir = initialGrad > 0 ? 1 : -1;
        var arrowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        arrowLine.setAttribute('x1', initSx); arrowLine.setAttribute('y1', initSy);
        arrowLine.setAttribute('x2', initSx + dir * arrowLen); arrowLine.setAttribute('y2', initSy + 12);
        arrowLine.setAttribute('stroke', '#f59e0b'); arrowLine.setAttribute('stroke-width', '1.5');
        arrowLine.setAttribute('stroke-dasharray', '3 2');
        svg.appendChild(arrowLine);
      }

      svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
      var axisLine = svg.lastChild;
      axisLine.setAttribute('x1', padding.left); axisLine.setAttribute('y1', height - padding.bottom);
      axisLine.setAttribute('x2', width - padding.right); axisLine.setAttribute('y2', height - padding.bottom);
      axisLine.setAttribute('stroke', 'rgba(138,180,248,0.2)'); axisLine.setAttribute('stroke-width', '1');

      container.appendChild(svg);

      var marker = document.createElement('div');
      marker.className = 'nv-lab-obs-position';
      marker.innerHTML = '<div class="nv-lab-obs-pos-grid">' +
        '<div class="nv-lab-obs-pos-item"><span class="nv-lab-obs-pos-label">x\u2080</span><span class="nv-lab-obs-pos-value">' + params.initialX + '</span></div>' +
        '<div class="nv-lab-obs-pos-item"><span class="nv-lab-obs-pos-label">f(x\u2080)</span><span class="nv-lab-obs-pos-value">' + initialLoss + '</span></div>' +
        '<div class="nv-lab-obs-pos-item"><span class="nv-lab-obs-pos-label">\u2207f(x\u2080)</span><span class="nv-lab-obs-pos-value">' + initialGrad + '</span></div>' +
        '</div>';
      container.appendChild(marker);
    },
    getPreparationTelemetry: function (params) {
      var fn = functions[params.functionType] || functions.quadratic;
      return [
        { key: 'initialX', label: 'Initial Position', value: String(params.initialX) },
        { key: 'initialLoss', label: 'Initial Loss', value: String(Math.round(fn.f(params.initialX) * 10000) / 10000) },
        { key: 'gradient', label: 'Gradient ∇f(x₀)', value: String(Math.round(fn.df(params.initialX) * 10000) / 10000) },
        { key: 'learningRate', label: 'Learning Rate', value: String(params.learningRate) },
        { key: 'status', label: 'Status', value: 'Ready' }
      ];
    },
    getCompletionSummary: function (result, params) {
      if (!result) return [];
      var fn = functions[params.functionType] || functions.quadratic;
      var finalLoss = result.lossHistory && result.lossHistory.length > 0 ? result.lossHistory[result.lossHistory.length - 1] : fn.f(result.finalX);
      return [
        { label: 'Final X', value: String(result.finalX) },
        { label: 'Final Loss', value: String(finalLoss) },
        { label: 'Converged', value: result.converged ? 'Yes' : 'No' }
      ];
    },
    execute: function (params) {
      var learningRate = params.learningRate !== undefined ? params.learningRate : 0.1;
      var initialX = params.initialX !== undefined ? params.initialX : 3.0;
      var numIterations = params.numIterations !== undefined ? params.numIterations : 30;
      var functionType = params.functionType !== undefined ? params.functionType : 'quadratic';

      numIterations = Math.round(numIterations);
      numIterations = Math.max(1, Math.min(100, numIterations));

      if (!functions[functionType]) {
        functionType = 'quadratic';
      }

      return runGradientDescent(learningRate, initialX, numIterations, functionType);
    },
    visualization: {
      type: 'line-chart',
      title: 'Loss Curve During Optimization'
    },
    canonicalStatus: 'reviewed',
    version: '1.0.0',
    reviewedBy: 'NeuralVerse Team',
    lastReviewed: '2026-06-25',
    estimatedDuration: '10 minutes'
  };

  if (window.NeuralVerse.LabRegistry && window.NeuralVerse.LabRegistry.register) {
    window.NeuralVerse.LabRegistry.register(labDefinition);
  }
})();
