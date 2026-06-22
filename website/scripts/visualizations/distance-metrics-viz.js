import { BaseVisualization } from './base-visualization.js';

export class DistanceMetricsViz extends BaseVisualization {
  onInitialize() {
    this.state = {
      ax: 3,
      ay: 2,
      bx: -2,
      by: 4,
      isDragging: null // 'a' or 'b'
    };

    // Build template
    this.container.innerHTML = `
      <div class="nv-viz-layout">
        <div class="nv-viz-canvas-container">
          <canvas class="nv-viz-canvas" width="400" height="400"></canvas>
        </div>
        <div class="nv-viz-sidebar">
          <h3>Distance Metrics</h3>
          <div class="nv-viz-control-group">
            <label>Vector A (Red):</label>
            <div class="nv-viz-inputs">
              <label>X: <input type="number" class="nv-input nv-input-ax" min="-5" max="5" step="0.5" value="3" aria-label="Vector A X coordinate"></label>
              <label>Y: <input type="number" class="nv-input nv-input-ay" min="-5" max="5" step="0.5" value="2" aria-label="Vector A Y coordinate"></label>
            </div>
          </div>
          <div class="nv-viz-control-group">
            <label>Vector B (Blue):</label>
            <div class="nv-viz-inputs">
              <label>X: <input type="number" class="nv-input nv-input-bx" min="-5" max="5" step="0.5" value="-2" aria-label="Vector B X coordinate"></label>
              <label>Y: <input type="number" class="nv-input nv-input-by" min="-5" max="5" step="0.5" value="4" aria-label="Vector B Y coordinate"></label>
            </div>
          </div>
          <div class="nv-viz-metrics" aria-live="polite">
            <div class="nv-viz-metric-item">
              <span class="nv-viz-metric-label">Euclidean Distance:</span>
              <span class="nv-viz-metric-value nv-metric-euclidean">0.00</span>
            </div>
            <div class="nv-viz-metric-item">
              <span class="nv-viz-metric-label">Cosine Similarity:</span>
              <span class="nv-viz-metric-value nv-metric-cosine">0.00</span>
            </div>
            <div class="nv-viz-metric-item">
              <span class="nv-viz-metric-label">Dot Product:</span>
              <span class="nv-viz-metric-value nv-metric-dot">0.00</span>
            </div>
          </div>
          <button class="nv-btn nv-btn-reset" aria-label="Reset coordinates">Reset Coordinates</button>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('.nv-viz-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Input elements
    this.inputAx = this.container.querySelector('.nv-input-ax');
    this.inputAy = this.container.querySelector('.nv-input-ay');
    this.inputBx = this.container.querySelector('.nv-input-bx');
    this.inputBy = this.container.querySelector('.nv-input-by');
    this.resetBtn = this.container.querySelector('.nv-btn-reset');

    // Bind inputs
    const handleInputChange = () => {
      this.state.ax = parseFloat(this.inputAx.value) || 0;
      this.state.ay = parseFloat(this.inputAy.value) || 0;
      this.state.bx = parseFloat(this.inputBx.value) || 0;
      this.state.by = parseFloat(this.inputBy.value) || 0;
      this.render();
    };

    this.inputAx.addEventListener('input', handleInputChange);
    this.inputAy.addEventListener('input', handleInputChange);
    this.inputBx.addEventListener('input', handleInputChange);
    this.inputBy.addEventListener('input', handleInputChange);

    this.resetBtn.addEventListener('click', () => this.reset());

    // Mouse and Touch handlers
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
    this.state.ax = 3;
    this.state.ay = 2;
    this.state.bx = -2;
    this.state.by = 4;
    this.inputAx.value = 3;
    this.inputAy.value = 2;
    this.inputBx.value = -2;
    this.inputBy.value = 4;
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
    const size = this.canvas.width;
    const center = size / 2;
    const scale = (size - 40) / 10; // -5 to 5 is 10 units

    const axPos = center + this.state.ax * scale;
    const ayPos = center - this.state.ay * scale;
    const bxPos = center + this.state.bx * scale;
    const byPos = center - this.state.by * scale;

    const distA = Math.hypot(x - axPos, y - ayPos);
    const distB = Math.hypot(x - bxPos, y - byPos);

    if (distA < 15 && distA < distB) {
      this.state.isDragging = 'a';
    } else if (distB < 15) {
      this.state.isDragging = 'b';
    }
  }

  onMouseMove(e) {
    if (!this.state.isDragging) return;
    if (e.type === 'touchmove') e.preventDefault();

    const { x, y } = this.getCanvasCoords(e);
    const size = this.canvas.width;
    const center = size / 2;
    const scale = (size - 40) / 10;

    let nx = (x - center) / scale;
    let ny = -(y - center) / scale;

    // Clamp coordinates to [-5, 5]
    nx = Math.max(-5, Math.min(5, Math.round(nx * 2) / 2));
    ny = Math.max(-5, Math.min(5, Math.round(ny * 2) / 2));

    if (this.state.isDragging === 'a') {
      this.state.ax = nx;
      this.state.ay = ny;
      this.inputAx.value = nx;
      this.inputAy.value = ny;
    } else {
      this.state.bx = nx;
      this.state.by = ny;
      this.inputBx.value = nx;
      this.inputBy.value = ny;
    }
    this.render();
  }

  onMouseUp() {
    this.state.isDragging = null;
  }

  render() {
    if (!this.ctx) return;
    const size = this.canvas.width;
    const center = size / 2;
    const scale = (size - 40) / 10;

    // Clear
    this.ctx.clearRect(0, 0, size, size);

    // Draw Grid
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
      if (i === 0) continue;
      const pos = center + i * scale;
      // Verticals
      this.ctx.beginPath();
      this.ctx.moveTo(pos, 20);
      this.ctx.lineTo(pos, size - 20);
      this.ctx.stroke();
      // Horizontals
      this.ctx.beginPath();
      this.ctx.moveTo(20, pos);
      this.ctx.lineTo(size - 20, pos);
      this.ctx.stroke();
    }

    // Draw Axes
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(center, 10);
    this.ctx.lineTo(center, size - 10);
    this.ctx.moveTo(10, center);
    this.ctx.lineTo(size - 10, center);
    this.ctx.stroke();

    // Calculations
    const ax = this.state.ax;
    const ay = this.state.ay;
    const bx = this.state.bx;
    const by = this.state.by;

    const magA = Math.hypot(ax, ay);
    const magB = Math.hypot(bx, by);

    const euclidean = Math.hypot(ax - bx, ay - by);
    const dot = ax * bx + ay * by;
    const cosine = (magA > 0 && magB > 0) ? (dot / (magA * magB)) : 0;

    // Update UI elements
    this.container.querySelector('.nv-metric-euclidean').textContent = euclidean.toFixed(3);
    this.container.querySelector('.nv-metric-cosine').textContent = cosine.toFixed(3);
    this.container.querySelector('.nv-metric-dot').textContent = dot.toFixed(3);

    // Draw Vector A (Red)
    const axPos = center + ax * scale;
    const ayPos = center - ay * scale;
    this.drawArrow(center, center, axPos, ayPos, '#ef4444', 'Vector A');

    // Draw Vector B (Blue)
    const bxPos = center + bx * scale;
    const byPos = center - by * scale;
    this.drawArrow(center, center, bxPos, byPos, '#3b82f6', 'Vector B');

    // Draw Distance line (Euclidean)
    this.ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(axPos, ayPos);
    this.ctx.lineTo(bxPos, byPos);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  drawArrow(fromx, fromy, tox, toy, color, label) {
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = 4;

    this.ctx.beginPath();
    this.ctx.moveTo(fromx, fromy);
    this.ctx.lineTo(tox, toy);
    this.ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(toy - fromy, tox - fromx);
    this.ctx.beginPath();
    this.ctx.moveTo(tox, toy);
    this.ctx.lineTo(tox - 12 * Math.cos(angle - Math.PI / 6), toy - 12 * Math.sin(angle - Math.PI / 6));
    this.ctx.lineTo(tox - 12 * Math.cos(angle + Math.PI / 6), toy - 12 * Math.sin(angle + Math.PI / 6));
    this.ctx.closePath();
    this.ctx.fill();

    // Draw interactive handle circle
    this.ctx.beginPath();
    this.ctx.arc(tox, toy, 8, 0, Math.PI * 2);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
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
