import { BaseVisualization } from './base-visualization.js';

export class NearestNeighborViz extends BaseVisualization {
  onInitialize() {
    this.state = {
      qx: 0,
      qy: 0,
      k: 3,
      metric: 'cosine', // 'cosine' or 'euclidean'
      isDragging: false,
      // Random fixed points for documents
      documents: [
        { id: 'Doc 1', x: 2.5, y: 1.5 },
        { id: 'Doc 2', x: -1.8, y: 3.2 },
        { id: 'Doc 3', x: 3.5, y: -2.0 },
        { id: 'Doc 4', x: -3.0, y: -2.5 },
        { id: 'Doc 5', x: 0.5, y: 4.0 },
        { id: 'Doc 6', x: 1.8, y: 2.8 },
        { id: 'Doc 7', x: -2.5, y: 1.2 },
        { id: 'Doc 8', x: 4.2, y: 3.0 }
      ]
    };

    this.container.innerHTML = `
      <div class="nv-viz-layout">
        <div class="nv-viz-canvas-container">
          <canvas class="nv-viz-canvas" width="400" height="400"></canvas>
        </div>
        <div class="nv-viz-sidebar">
          <h3>K-Nearest Neighbors</h3>
          
          <div class="nv-viz-control-group">
            <label>Distance Metric:</label>
            <div class="nv-viz-radio-group">
              <label><input type="radio" name="metric" value="cosine" checked> Cosine Similarity</label>
              <label><input type="radio" name="metric" value="euclidean"> Euclidean Distance</label>
            </div>
          </div>

          <div class="nv-viz-control-group">
            <label for="k-range">K Neighbors: <span class="k-val">3</span></label>
            <input type="range" id="k-range" min="1" max="8" value="3" class="nv-slider" aria-label="K neighbors">
          </div>

          <div class="nv-viz-control-group">
            <label>Query (Purple Dot):</label>
            <div class="nv-viz-inputs">
              <label>X: <input type="number" class="nv-input nv-input-qx" min="-5" max="5" step="0.5" value="0"></label>
              <label>Y: <input type="number" class="nv-input nv-input-qy" min="-5" max="5" step="0.5" value="0"></label>
            </div>
          </div>

          <div class="nv-viz-metrics" aria-live="polite">
            <h4>Nearest Neighbors Result</h4>
            <ul class="nv-nn-list"></ul>
          </div>
          
          <button class="nv-btn nv-btn-reset">Reset Query</button>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('.nv-viz-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Controls
    this.kRange = this.container.querySelector('#k-range');
    this.kVal = this.container.querySelector('.k-val');
    this.inputQx = this.container.querySelector('.nv-input-qx');
    this.inputQy = this.container.querySelector('.nv-input-qy');
    this.resetBtn = this.container.querySelector('.nv-btn-reset');
    this.radios = this.container.querySelectorAll('input[name="metric"]');

    // Events
    this.kRange.addEventListener('input', () => {
      this.state.k = parseInt(this.kRange.value);
      this.kVal.textContent = this.state.k;
      this.render();
    });

    const handleInputChange = () => {
      this.state.qx = parseFloat(this.inputQx.value) || 0;
      this.state.qy = parseFloat(this.inputQy.value) || 0;
      this.render();
    };
    this.inputQx.addEventListener('input', handleInputChange);
    this.inputQy.addEventListener('input', handleInputChange);

    this.radios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.state.metric = e.target.value;
        this.render();
      });
    });

    this.resetBtn.addEventListener('click', () => this.reset());

    // Drag handlers
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
    this.state.qx = 0;
    this.state.qy = 0;
    this.state.k = 3;
    this.state.metric = 'cosine';
    this.kRange.value = 3;
    this.kVal.textContent = 3;
    this.inputQx.value = 0;
    this.inputQy.value = 0;
    this.container.querySelector('input[value="cosine"]').checked = true;
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
    const scale = (size - 40) / 10;

    const qxPos = center + this.state.qx * scale;
    const qyPos = center - this.state.qy * scale;

    const dist = Math.hypot(x - qxPos, y - qyPos);
    if (dist < 15) {
      this.state.isDragging = true;
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

    nx = Math.max(-5, Math.min(5, Math.round(nx * 10) / 10));
    ny = Math.max(-5, Math.min(5, Math.round(ny * 10) / 10));

    this.state.qx = nx;
    this.state.qy = ny;
    this.inputQx.value = nx;
    this.inputQy.value = ny;

    this.render();
  }

  onMouseUp() {
    this.state.isDragging = false;
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
      this.ctx.beginPath();
      this.ctx.moveTo(pos, 20);
      this.ctx.lineTo(pos, size - 20);
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

    // Query point
    const qx = this.state.qx;
    const qy = this.state.qy;
    const qmag = Math.hypot(qx, qy);

    // Compute similarities/distances
    const scoredDocs = this.state.documents.map(doc => {
      const dmag = Math.hypot(doc.x, doc.y);
      const dot = qx * doc.x + qy * doc.y;
      const cosineSim = (qmag > 0 && dmag > 0) ? (dot / (qmag * dmag)) : 0;
      const eucDist = Math.hypot(qx - doc.x, qy - doc.y);

      return {
        ...doc,
        cosineSim,
        eucDist,
        score: this.state.metric === 'cosine' ? cosineSim : eucDist
      };
    });

    // Sort documents
    if (this.state.metric === 'cosine') {
      // Larger is better (closer)
      scoredDocs.sort((a, b) => b.score - a.score);
    } else {
      // Smaller is better (closer)
      scoredDocs.sort((a, b) => a.score - b.score);
    }

    // Neighbors set
    const neighbors = new Set(scoredDocs.slice(0, this.state.k).map(d => d.id));

    // Render list
    const listContainer = this.container.querySelector('.nv-nn-list');
    listContainer.innerHTML = scoredDocs.slice(0, this.state.k).map(d => {
      const valStr = this.state.metric === 'cosine' ? `Similarity: ${d.cosineSim.toFixed(3)}` : `Distance: ${d.eucDist.toFixed(3)}`;
      return `<li><strong>${d.id}</strong> (${valStr})</li>`;
    }).join('');

    // Draw documents
    scoredDocs.forEach(doc => {
      const xPos = center + doc.x * scale;
      const yPos = center - doc.y * scale;
      const isNeighbor = neighbors.has(doc.id);

      this.ctx.beginPath();
      this.ctx.arc(xPos, yPos, isNeighbor ? 10 : 7, 0, Math.PI * 2);
      this.ctx.fillStyle = isNeighbor ? '#10b981' : '#6b7280'; // Emerald vs Gray
      this.ctx.fill();

      // Border for neighbor
      if (isNeighbor) {
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '10px monospace';
      this.ctx.fillText(doc.id, xPos + 12, yPos + 4);
    });

    // Draw Query point
    const qxPos = center + qx * scale;
    const qyPos = center - qy * scale;

    // Draw Vector line to query
    this.ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(center, center);
    this.ctx.lineTo(qxPos, qyPos);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(qxPos, qyPos, 9, 0, Math.PI * 2);
    this.ctx.fillStyle = '#a855f7'; // Purple query
    this.ctx.fill();
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
