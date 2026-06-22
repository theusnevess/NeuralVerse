import { BaseVisualization } from './base-visualization.js';

export class ObjectDetectionViz extends BaseVisualization {
  onInitialize() {
    this.state = {
      // Ground Truth Box (Red)
      gt: { x: 80, y: 80, w: 120, h: 120 },
      // Prediction Box (Blue)
      pred: { x: 120, y: 120, w: 120, h: 120 },
      isDragging: null, // { box: 'gt'|'pred', handle: 'center'|'br' }
      dragStart: { x: 0, y: 0 }
    };

    this.container.innerHTML = `
      <div class="nv-viz-layout">
        <div class="nv-viz-canvas-container">
          <canvas class="nv-viz-canvas" width="400" height="400"></canvas>
        </div>
        <div class="nv-viz-sidebar">
          <h3>Intersection over Union (IoU)</h3>
          
          <div class="nv-viz-control-group">
            <label>Guide:</label>
            <p class="nv-muted">Drag the center of the boxes to move them. Drag the bottom-right handle of a box to resize it.</p>
          </div>

          <div class="nv-viz-control-group">
            <label>Ground Truth Box (Red):</label>
            <div class="nv-viz-inputs">
              <label>X: <input type="number" class="nv-input nv-gt-x" min="10" max="300" step="5" value="80"></label>
              <label>Y: <input type="number" class="nv-input nv-gt-y" min="10" max="300" step="5" value="80"></label>
              <label>W: <input type="number" class="nv-input nv-gt-w" min="30" max="250" step="5" value="120"></label>
              <label>H: <input type="number" class="nv-input nv-gt-h" min="30" max="250" step="5" value="120"></label>
            </div>
          </div>

          <div class="nv-viz-control-group">
            <label>Prediction Box (Blue):</label>
            <div class="nv-viz-inputs">
              <label>X: <input type="number" class="nv-input nv-pred-x" min="10" max="300" step="5" value="120"></label>
              <label>Y: <input type="number" class="nv-input nv-pred-y" min="10" max="300" step="5" value="120"></label>
              <label>W: <input type="number" class="nv-input nv-pred-w" min="30" max="250" step="5" value="120"></label>
              <label>H: <input type="number" class="nv-input nv-pred-h" min="30" max="250" step="5" value="120"></label>
            </div>
          </div>

          <div class="nv-viz-metrics" aria-live="polite">
            <div class="nv-viz-metric-item">
              <span class="nv-viz-metric-label">Intersection Area:</span>
              <span class="nv-viz-metric-value nv-iou-intersection">0</span>
            </div>
            <div class="nv-viz-metric-item">
              <span class="nv-viz-metric-label">Union Area:</span>
              <span class="nv-viz-metric-value nv-iou-union">0</span>
            </div>
            <div class="nv-viz-metric-item">
              <span class="nv-viz-metric-label">IoU Score:</span>
              <span class="nv-viz-metric-value nv-iou-score">0.00%</span>
            </div>
          </div>
          
          <button class="nv-btn nv-btn-reset">Reset Boxes</button>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('.nv-viz-canvas');
    this.ctx = this.canvas.getContext('2d');

    // inputs
    this.gtX = this.container.querySelector('.nv-gt-x');
    this.gtY = this.container.querySelector('.nv-gt-y');
    this.gtW = this.container.querySelector('.nv-gt-w');
    this.gtH = this.container.querySelector('.nv-gt-h');

    this.predX = this.container.querySelector('.nv-pred-x');
    this.predY = this.container.querySelector('.nv-pred-y');
    this.predW = this.container.querySelector('.nv-pred-w');
    this.predH = this.container.querySelector('.nv-pred-h');

    this.resetBtn = this.container.querySelector('.nv-btn-reset');

    const handleInputChange = () => {
      this.state.gt.x = parseInt(this.gtX.value) || 0;
      this.state.gt.y = parseInt(this.gtY.value) || 0;
      this.state.gt.w = parseInt(this.gtW.value) || 30;
      this.state.gt.h = parseInt(this.gtH.value) || 30;

      this.state.pred.x = parseInt(this.predX.value) || 0;
      this.state.pred.y = parseInt(this.predY.value) || 0;
      this.state.pred.w = parseInt(this.predW.value) || 30;
      this.state.pred.h = parseInt(this.predH.value) || 30;

      this.render();
    };

    const inputs = [this.gtX, this.gtY, this.gtW, this.gtH, this.predX, this.predY, this.predW, this.predH];
    inputs.forEach(input => input.addEventListener('input', handleInputChange));

    this.resetBtn.addEventListener('click', () => this.reset());

    // Mouse events
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
    this.state.gt = { x: 80, y: 80, w: 120, h: 120 };
    this.state.pred = { x: 120, y: 120, w: 120, h: 120 };
    this.syncInputs();
  }

  syncInputs() {
    this.gtX.value = this.state.gt.x;
    this.gtY.value = this.state.gt.y;
    this.gtW.value = this.state.gt.w;
    this.gtH.value = this.state.gt.h;

    this.predX.value = this.state.pred.x;
    this.predY.value = this.state.pred.y;
    this.predW.value = this.state.pred.w;
    this.predH.value = this.state.pred.h;
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

    // Check handles
    const handleSize = 10;
    
    // Pred box handle
    const predBrX = this.state.pred.x + this.state.pred.w;
    const predBrY = this.state.pred.y + this.state.pred.h;
    if (Math.hypot(x - predBrX, y - predBrY) < handleSize * 2) {
      this.state.isDragging = { box: 'pred', handle: 'br' };
      this.state.dragStart = { x, y };
      return;
    }

    // Gt box handle
    const gtBrX = this.state.gt.x + this.state.gt.w;
    const gtBrY = this.state.gt.y + this.state.gt.h;
    if (Math.hypot(x - gtBrX, y - gtBrY) < handleSize * 2) {
      this.state.isDragging = { box: 'gt', handle: 'br' };
      this.state.dragStart = { x, y };
      return;
    }

    // Check center of Pred (prioritize prediction)
    if (x >= this.state.pred.x && x <= this.state.pred.x + this.state.pred.w &&
        y >= this.state.pred.y && y <= this.state.pred.y + this.state.pred.h) {
      this.state.isDragging = { box: 'pred', handle: 'center' };
      this.state.dragStart = { x: x - this.state.pred.x, y: y - this.state.pred.y };
      return;
    }

    // Check center of GT
    if (x >= this.state.gt.x && x <= this.state.gt.x + this.state.gt.w &&
        y >= this.state.gt.y && y <= this.state.gt.y + this.state.gt.h) {
      this.state.isDragging = { box: 'gt', handle: 'center' };
      this.state.dragStart = { x: x - this.state.gt.x, y: y - this.state.gt.y };
      return;
    }
  }

  onMouseMove(e) {
    if (!this.state.isDragging) return;
    if (e.type === 'touchmove') e.preventDefault();

    const { x, y } = this.getCanvasCoords(e);
    const boxKey = this.state.isDragging.box;
    const handleKey = this.state.isDragging.handle;
    const box = this.state[boxKey];

    if (handleKey === 'center') {
      box.x = Math.max(0, Math.min(this.canvas.width - box.w, x - this.state.dragStart.x));
      box.y = Math.max(0, Math.min(this.canvas.height - box.h, y - this.state.dragStart.y));
    } else if (handleKey === 'br') {
      box.w = Math.max(30, Math.min(this.canvas.width - box.x, x - box.x));
      box.h = Math.max(30, Math.min(this.canvas.height - box.y, y - box.y));
    }

    this.syncInputs();
    this.render();
  }

  onMouseUp() {
    this.state.isDragging = null;
  }

  render() {
    if (!this.ctx) return;
    
    // Clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Compute IoU
    const gt = this.state.gt;
    const pred = this.state.pred;

    // Intersection coordinates
    const x1 = Math.max(gt.x, pred.x);
    const y1 = Math.max(gt.y, pred.y);
    const x2 = Math.min(gt.x + gt.w, pred.x + pred.w);
    const y2 = Math.min(gt.y + gt.h, pred.y + pred.h);

    const interW = Math.max(0, x2 - x1);
    const interH = Math.max(0, y2 - y1);
    const interArea = interW * interH;

    const gtArea = gt.w * gt.h;
    const predArea = pred.w * pred.h;
    const unionArea = gtArea + predArea - interArea;

    const iou = unionArea > 0 ? (interArea / unionArea) : 0;

    // Update UI text
    this.container.querySelector('.nv-iou-intersection').textContent = `${interArea} px²`;
    this.container.querySelector('.nv-iou-union').textContent = `${unionArea} px²`;
    this.container.querySelector('.nv-iou-score').textContent = `${(iou * 100).toFixed(2)}%`;

    // Draw grid board pattern under boxes
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    for (let pos = 20; pos < 400; pos += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(pos, 0);
      this.ctx.lineTo(pos, 400);
      this.ctx.moveTo(0, pos);
      this.ctx.lineTo(400, pos);
      this.ctx.stroke();
    }

    // Draw Intersection shading
    if (interArea > 0) {
      this.ctx.fillStyle = 'rgba(168, 85, 247, 0.4)'; // Purple transparent intersection
      this.ctx.fillRect(x1, y1, interW, interH);
    }

    // Draw Ground Truth (Red)
    this.ctx.strokeStyle = '#ef4444';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(gt.x, gt.y, gt.w, gt.h);
    this.ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
    this.ctx.fillRect(gt.x, gt.y, gt.w, gt.h);

    // Draw Prediction (Blue)
    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(pred.x, pred.y, pred.w, pred.h);
    this.ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
    this.ctx.fillRect(pred.x, pred.y, pred.w, pred.h);

    // Draw handles (dots at bottom right)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(gt.x + gt.w, gt.y + gt.h, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#ef4444';
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(pred.x + pred.w, pred.y + pred.h, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.stroke();

    // Labels
    this.ctx.fillStyle = '#ef4444';
    this.ctx.font = '12px sans-serif';
    this.ctx.fillText('Ground Truth', gt.x + 5, gt.y + 18);

    this.ctx.fillStyle = '#3b82f6';
    this.ctx.fillText('Prediction', pred.x + 5, pred.y + 18);
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
