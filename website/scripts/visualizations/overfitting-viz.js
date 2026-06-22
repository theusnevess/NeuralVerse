import { BaseVisualization } from './base-visualization.js';

export class OverfittingViz extends BaseVisualization {
  onInitialize() {
    this.state = {
      degree: 1, // 1 (Linear), 3 (Balanced), 9 (Overfitting)
      points: [
        { x: 50, y: 320 },
        { x: 100, y: 280 },
        { x: 150, y: 180 },
        { x: 200, y: 220 },
        { x: 250, y: 140 },
        { x: 300, y: 100 },
        { x: 350, y: 120 }
      ],
      isDraggingIdx: null
    };

    this.container.innerHTML = `
      <div class="nv-viz-layout nv-viz-overfitting-layout">
        <div class="nv-viz-canvas-container">
          <canvas class="nv-viz-canvas" width="400" height="400"></canvas>
        </div>
        <div class="nv-viz-sidebar">
          <h3>Overfitting vs. Underfitting</h3>
          
          <div class="nv-viz-control-group">
            <label>Guide:</label>
            <p class="nv-muted">Drag the data points to watch the regression curve bend. Change the polynomial degree to observe the model complexity change.</p>
          </div>

          <div class="nv-viz-control-group">
            <label for="overfit-degree-slider">Polynomial Degree (Model Complexity): <span class="overfit-deg-val">1</span></label>
            <input type="range" id="overfit-degree-slider" min="1" max="9" step="1" value="1" class="nv-slider" aria-label="Polynomial degree">
          </div>

          <div class="nv-viz-metrics" aria-live="polite">
            <div class="nv-viz-metric-item">
              <span class="nv-viz-metric-label">Model State:</span>
              <span class="nv-viz-metric-value nv-overfit-status">Underfitting</span>
            </div>
            <div class="nv-viz-metric-item">
              <span class="nv-viz-metric-label">Training Error (MSE):</span>
              <span class="nv-viz-metric-value nv-overfit-mse">0.00</span>
            </div>
          </div>
          
          <button class="nv-btn nv-btn-reset">Reset Points & Degree</button>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('.nv-viz-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.degreeSlider = this.container.querySelector('#overfit-degree-slider');
    this.degreeVal = this.container.querySelector('.overfit-deg-val');
    this.statusVal = this.container.querySelector('.nv-overfit-status');
    this.mseVal = this.container.querySelector('.nv-overfit-mse');
    this.resetBtn = this.container.querySelector('.nv-btn-reset');

    this.degreeSlider.addEventListener('input', () => {
      this.state.degree = parseInt(this.degreeSlider.value);
      this.degreeVal.textContent = this.state.degree;
      this.render();
    });

    this.resetBtn.addEventListener('click', () => this.reset());

    // Mouse and touch
    this.boundOnMouseDown = this.onMouseDown.bind(this);
    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnMouseUp = this.onMouseUp.bind(this);

    this.canvas.addEventListener('mousedown', this.boundOnMouseDown);
    window.addEventListener('mousemove', this.boundOnMouseMove);
    window.addEventListener('mouseup', this.boundOnMouseUp);

    this.canvas.addEventListener('touchstart', this.boundOnMouseDown, { passive: false });
    window.addEventListener('touchmove', this.boundOnMouseMove, { passive: false });
    window.addEventListener('touchend', this.boundOnMouseUp);
  }

  onReset() {
    this.state.degree = 1;
    this.state.points = [
      { x: 50, y: 320 },
      { x: 100, y: 280 },
      { x: 150, y: 180 },
      { x: 200, y: 220 },
      { x: 250, y: 140 },
      { x: 300, y: 100 },
      { x: 350, y: 120 }
    ];
    this.degreeSlider.value = 1;
    this.degreeVal.textContent = 1;
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  onMouseDown(e) {
    if (e.type === 'touchstart') e.preventDefault();
    const { x, y } = this.getCanvasCoords(e);

    // Find nearest point
    let minD = 15;
    let foundIdx = null;

    this.state.points.forEach((p, idx) => {
      const d = Math.hypot(x - p.x, y - p.y);
      if (d < minD) {
        minD = d;
        foundIdx = idx;
      }
    });

    if (foundIdx !== null) {
      this.state.isDraggingIdx = foundIdx;
    }
  }

  onMouseMove(e) {
    if (this.state.isDraggingIdx === null) return;
    if (e.type === 'touchmove') e.preventDefault();

    const { x, y } = this.getCanvasCoords(e);
    
    // Clamp to canvas borders
    const p = this.state.points[this.state.isDraggingIdx];
    p.x = Math.max(10, Math.min(this.canvas.width - 10, x));
    p.y = Math.max(10, Math.min(this.canvas.height - 10, y));

    this.render();
  }

  onMouseUp() {
    this.state.isDraggingIdx = null;
  }

  // Solves standard Least Squares polynomial regression: y = X * beta
  solvePolynomialRegression(points, degree) {
    const n = points.length;
    const m = degree + 1;

    // Create Vandermonde matrix X and target y
    // Normal Equation: (X^T * X) * beta = X^T * y
    const X = Array(n).fill(0).map((_, i) => {
      const row = [];
      const xNorm = points[i].x / 400; // normalize coordinates to prevent matrix overflow
      for (let j = 0; j < m; j++) {
        row.push(Math.pow(xNorm, j));
      }
      return row;
    });

    const y = points.map(p => p.y / 400);

    // Compute X^T
    const XT = Array(m).fill(0).map((_, r) => {
      return Array(n).fill(0).map((_, c) => X[c][r]);
    });

    // Compute XT * X
    const XTX = Array(m).fill(0).map((_, r) => {
      return Array(m).fill(0).map((_, c) => {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += XT[r][k] * X[k][c];
        }
        return sum;
      });
    });

    // Compute XT * y
    const XTy = Array(m).fill(0).map((_, r) => {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += XT[r][k] * y[k];
      }
      return sum;
    });

    // Solve XTX * beta = XTy using basic Gaussian elimination (with small ridge regularization)
    const lambda = 1e-4; // ridge regularization to ensure positive-definite matrix
    for (let i = 0; i < m; i++) {
      XTX[i][i] += lambda;
    }

    const beta = this.solveGaussian(XTX, XTy);
    return beta;
  }

  solveGaussian(A, b) {
    const n = b.length;
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxEl = Math.abs(A[i][i]);
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(A[k][i]) > maxEl) {
          maxEl = Math.abs(A[k][i]);
          maxRow = k;
        }
      }

      // Swap rows
      for (let k = i; k < n; k++) {
        const tmp = A[maxRow][k];
        A[maxRow][k] = A[i][k];
        A[i][k] = tmp;
      }
      const tmp = b[maxRow];
      b[maxRow] = b[i];
      b[i] = tmp;

      // Eliminate
      for (let k = i + 1; k < n; k++) {
        const c = -A[k][i] / A[i][i];
        for (let j = i; j < n; j++) {
          if (i === j) {
            A[k][j] = 0;
          } else {
            A[k][j] += c * A[i][j];
          }
        }
        b[k] += c * b[i];
      }
    }

    // Back substitution
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = b[i] / A[i][i];
      for (let k = i - 1; k >= 0; k--) {
        b[k] -= A[k][i] * x[i];
      }
    }
    return x;
  }

  render() {
    if (!this.ctx) return;
    const size = this.canvas.width;

    // Clear
    this.ctx.clearRect(0, 0, size, size);

    // Compute coefficients
    const deg = Math.min(this.state.degree, this.state.points.length - 1);
    const beta = this.solvePolynomialRegression(this.state.points, deg);

    // Calculate polynomial value y for normalized x
    const evalPoly = (xNorm) => {
      let sum = 0;
      for (let j = 0; j < beta.length; j++) {
        sum += beta[j] * Math.pow(xNorm, j);
      }
      return sum * 400;
    };

    // Calculate MSE
    let totalSqError = 0;
    this.state.points.forEach(p => {
      const yPred = evalPoly(p.x / 400);
      totalSqError += Math.pow(p.y - yPred, 2);
    });
    const mse = totalSqError / this.state.points.length;

    // Update metrics
    this.mseVal.textContent = mse.toFixed(2);
    
    // Status text
    let statusText = 'Balanced Fit';
    let statusColor = '#10b981';
    if (this.state.degree <= 2) {
      statusText = 'Underfitting (Bias)';
      statusColor = '#ef4444';
    } else if (this.state.degree >= 6) {
      statusText = 'Overfitting (Variance)';
      statusColor = '#ea580c';
    }
    this.statusVal.textContent = statusText;
    this.statusVal.style.color = statusColor;

    // Draw grid
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    for (let i = 40; i < size; i += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, size);
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(size, i);
      this.ctx.stroke();
    }

    // Draw Regression Curve
    this.ctx.strokeStyle = '#a855f7'; // Purple line
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    
    for (let x = 0; x <= size; x += 2) {
      const y = evalPoly(x / 400);
      if (x === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();

    // Draw Points
    this.state.points.forEach((p, idx) => {
      const isDragging = idx === this.state.isDraggingIdx;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, isDragging ? 10 : 7, 0, Math.PI * 2);
      this.ctx.fillStyle = '#3b82f6'; // Blue points
      this.ctx.fill();

      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    });
  }

  onDestroy() {
    this.canvas.removeEventListener('mousedown', this.boundOnMouseDown);
    window.removeEventListener('mousemove', this.boundOnMouseMove);
    window.removeEventListener('mouseup', this.boundOnMouseUp);

    this.canvas.removeEventListener('touchstart', this.boundOnMouseDown);
    window.removeEventListener('touchmove', this.boundOnMouseMove);
    window.removeEventListener('touchend', this.boundOnMouseUp);
  }
}
