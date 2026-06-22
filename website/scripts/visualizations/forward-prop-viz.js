import { BaseVisualization } from './base-visualization.js';

export class ForwardPropViz extends BaseVisualization {
  onInitialize() {
    this.state = {
      activation: 'relu', // 'relu', 'sigmoid', 'tanh'
      input1: 0.8,
      input2: -0.4,
      // Fixed weights
      w11: 0.5, w12: -0.8,
      w21: 0.9, w22: 0.3,
      wHiddenOut: 0.7,
      animationStep: 0, // 0: Idle, 1: Inputs->Hidden, 2: Hidden Activated, 3: Hidden->Output, 4: Finished
      animPercent: 0,
      isPlaying: false
    };

    this.container.innerHTML = `
      <div class="nv-viz-layout nv-viz-forward-prop-layout">
        <div class="nv-viz-canvas-container">
          <canvas class="nv-viz-canvas" width="400" height="400"></canvas>
        </div>
        <div class="nv-viz-sidebar">
          <h3>Forward Propagation Flow</h3>
          
          <div class="nv-viz-control-group">
            <label>Activation Function:</label>
            <select class="nv-select nv-activation-select" aria-label="Activation function select">
              <option value="relu">ReLU</option>
              <option value="sigmoid">Sigmoid</option>
              <option value="tanh">Tanh</option>
            </select>
          </div>

          <div class="nv-viz-control-group">
            <label for="fprop-in1-slider">Input X1: <span class="fprop-in1-val">0.8</span></label>
            <input type="range" id="fprop-in1-slider" min="-1" max="1" step="0.1" value="0.8" class="nv-slider" aria-label="Input X1 value">
          </div>

          <div class="nv-viz-control-group">
            <label for="fprop-in2-slider">Input X2: <span class="fprop-in2-val">-0.4</span></label>
            <input type="range" id="fprop-in2-slider" min="-1" max="1" step="0.1" value="-0.4" class="nv-slider" aria-label="Input X2 value">
          </div>

          <div class="nv-forward-prop-controls">
            <button class="nv-btn nv-btn-fprop-forward">Step Forward</button>
            <button class="nv-btn nv-btn-reset">Reset</button>
          </div>

          <div class="nv-fprop-calculation-box" aria-live="polite">
            <h4>Calculation Details</h4>
            <div class="nv-fprop-formula">Click "Step Forward" to trace values...</div>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('.nv-viz-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Controls
    this.actSelect = this.container.querySelector('.nv-activation-select');
    this.in1Slider = this.container.querySelector('#fprop-in1-slider');
    this.in1Val = this.container.querySelector('.fprop-in1-val');
    this.in2Slider = this.container.querySelector('#fprop-in2-slider');
    this.in2Val = this.container.querySelector('.fprop-in2-val');

    this.fwdBtn = this.container.querySelector('.nv-btn-fprop-forward');
    this.resetBtn = this.container.querySelector('.nv-btn-reset');
    this.formulaBox = this.container.querySelector('.nv-fprop-formula');

    // Events
    const handleInput = () => {
      this.state.input1 = parseFloat(this.in1Slider.value);
      this.state.input2 = parseFloat(this.in2Slider.value);
      this.in1Val.textContent = this.state.input1.toFixed(1);
      this.in2Val.textContent = this.state.input2.toFixed(1);
      this.resetAnimation();
    };

    this.in1Slider.addEventListener('input', handleInput);
    this.in2Slider.addEventListener('input', handleInput);
    
    this.actSelect.addEventListener('change', (e) => {
      this.state.activation = e.target.value;
      this.resetAnimation();
    });

    this.fwdBtn.addEventListener('click', () => this.stepForward());
    this.resetBtn.addEventListener('click', () => this.reset());

    this.resetAnimation();
  }

  resetAnimation() {
    this.state.animationStep = 0;
    this.state.animPercent = 0;
    this.state.isPlaying = false;
    if (this.animTimer) {
      clearInterval(this.animTimer);
      this.animTimer = null;
    }
    this.render();
  }

  onReset() {
    this.state.activation = 'relu';
    this.state.input1 = 0.8;
    this.state.input2 = -0.4;
    this.actSelect.value = 'relu';
    this.in1Slider.value = 0.8;
    this.in2Slider.value = -0.4;
    this.in1Val.textContent = '0.8';
    this.in2Val.textContent = '-0.4';
    this.resetAnimation();
  }

  stepForward() {
    if (this.state.animationStep >= 4) {
      this.resetAnimation();
    }
    this.state.animationStep = (this.state.animationStep + 1) % 5;
    
    if (this.state.animationStep === 1 || this.state.animationStep === 3) {
      // Trigger animation flow
      this.state.animPercent = 0;
      if (this.animTimer) clearInterval(this.animTimer);
      
      const stepSize = this.reducedMotion ? 20 : 5;
      const intervalMs = this.reducedMotion ? 20 : 30;

      this.animTimer = setInterval(() => {
        this.state.animPercent += stepSize;
        if (this.state.animPercent >= 100) {
          this.state.animPercent = 100;
          clearInterval(this.animTimer);
          this.animTimer = null;
          // auto step further if needed
        }
        this.render();
      }, intervalMs);
    } else {
      this.render();
    }
  }

  evalActivation(x) {
    const act = this.state.activation;
    if (act === 'relu') {
      return Math.max(0, x);
    } else if (act === 'sigmoid') {
      return 1 / (1 + Math.exp(-x));
    } else if (act === 'tanh') {
      return Math.tanh(x);
    }
    return x;
  }

  render() {
    if (!this.ctx) return;
    const size = this.canvas.width;

    // Clear
    this.ctx.clearRect(0, 0, size, size);

    const x1 = this.state.input1;
    const x2 = this.state.input2;
    const w11 = this.state.w11;
    const w12 = this.state.w12;
    const w21 = this.state.w21;
    const w22 = this.state.w22;
    const wHiddenOut = this.state.wHiddenOut;

    // Calculate node states
    // Hidden Net Input
    const h1Net = x1 * w11 + x2 * w21;
    const h2Net = x1 * w12 + x2 * w22;

    // Hidden Activated Output
    const h1Out = this.evalActivation(h1Net);
    const h2Out = this.evalActivation(h2Net);

    // Final output Net input
    const outNet = h1Out * wHiddenOut + h2Out * wHiddenOut;
    // Final output Activated output
    const outVal = this.evalActivation(outNet);

    // Node Positions
    const inputX = 60;
    const hiddenX = 200;
    const outputX = 340;

    const in1Y = 120;
    const in2Y = 280;

    const hid1Y = 120;
    const hid2Y = 280;

    const outY = 200;

    // Update calculations panel text
    let formulaText = '';
    if (this.state.animationStep === 0) {
      formulaText = 'Input Values ready. Click "Step Forward" to trigger forward propagation.';
    } else if (this.state.animationStep === 1) {
      formulaText = 'Signals traveling from inputs to hidden layer nodes...';
    } else if (this.state.animationStep === 2) {
      formulaText = `
        <strong>Hidden Node Inputs (Net):</strong><br>
        H1 = x1*w11 + x2*w21 = ${x1.toFixed(1)}*${w11.toFixed(1)} + (${x2.toFixed(1)})*${w21.toFixed(1)} = <strong>${h1Net.toFixed(3)}</strong><br>
        H2 = x1*w12 + x2*w22 = ${x1.toFixed(1)}*${w12.toFixed(1)} + (${x2.toFixed(1)})*${w22.toFixed(1)} = <strong>${h2Net.toFixed(3)}</strong><br><br>
        <strong>Hidden Node Outputs (Activated):</strong><br>
        Out H1 = f(H1) = <strong>${h1Out.toFixed(3)}</strong><br>
        Out H2 = f(H2) = <strong>${h2Out.toFixed(3)}</strong>
      `;
    } else if (this.state.animationStep === 3) {
      formulaText = 'Signals traveling from hidden layer to output node...';
    } else if (this.state.animationStep === 4) {
      formulaText = `
        <strong>Output Node Input (Net):</strong><br>
        Out Net = H1*w1 + H2*w2 = ${h1Out.toFixed(2)}*${wHiddenOut.toFixed(1)} + ${h2Out.toFixed(2)}*${wHiddenOut.toFixed(1)} = <strong>${outNet.toFixed(3)}</strong><br><br>
        <strong>Final Output Value (Activated):</strong><br>
        Output = f(Out Net) = <strong>${outVal.toFixed(3)}</strong>
      `;
    }
    this.formulaBox.innerHTML = formulaText;

    // Drawing connections
    const drawConnection = (fx, fy, tx, ty, wVal, valIn, isActive, animPct) => {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(fx, fy);
      this.ctx.lineTo(tx, ty);
      this.ctx.stroke();

      if (isActive) {
        // Draw moving energy signal dot
        const dx = tx - fx;
        const dy = ty - fy;
        const currX = fx + dx * (animPct / 100);
        const currY = fy + dy * (animPct / 100);

        this.ctx.fillStyle = '#a855f7'; // Purple energy dot
        this.ctx.beginPath();
        this.ctx.arc(currX, currY, 6, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Draw weight label in the middle
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.font = '10px sans-serif';
      this.ctx.fillText(`w:${wVal.toFixed(1)}`, fx + (tx - fx) * 0.4, fy + (ty - fy) * 0.4 - 5);
    };

    // Draw lines inputs to hidden
    const step = this.state.animationStep;
    const animPct = this.state.animPercent;

    drawConnection(inputX, in1Y, hiddenX, hid1Y, w11, x1, step === 1, animPct);
    drawConnection(inputX, in1Y, hiddenX, hid2Y, w12, x1, step === 1, animPct);
    drawConnection(inputX, in2Y, hiddenX, hid1Y, w21, x2, step === 1, animPct);
    drawConnection(inputX, in2Y, hiddenX, hid2Y, w22, x2, step === 1, animPct);

    // Draw lines hidden to output
    drawConnection(hiddenX, hid1Y, outputX, outY, wHiddenOut, h1Out, step === 3, animPct);
    drawConnection(hiddenX, hid2Y, outputX, outY, wHiddenOut, h2Out, step === 3, animPct);

    // Draw Nodes
    const drawNode = (nx, ny, label, valStr, color) => {
      this.ctx.beginPath();
      this.ctx.arc(nx, ny, 22, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Node label
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 11px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(label, nx, ny - 3);

      this.ctx.font = '9px monospace';
      this.ctx.fillText(valStr, nx, ny + 9);
    };

    // Inputs
    drawNode(inputX, in1Y, 'X1', x1.toFixed(1), '#3b82f6');
    drawNode(inputX, in2Y, 'X2', x2.toFixed(1), '#3b82f6');

    // Hidden layer
    const hColor = step >= 2 ? '#a855f7' : '#6b7280';
    drawNode(hiddenX, hid1Y, 'H1', step >= 2 ? h1Out.toFixed(2) : '?', hColor);
    drawNode(hiddenX, hid2Y, 'H2', step >= 2 ? h2Out.toFixed(2) : '?', hColor);

    // Output
    const oColor = step >= 4 ? '#10b981' : '#6b7280';
    drawNode(outputX, outY, 'Out', step >= 4 ? outVal.toFixed(2) : '?', oColor);
  }

  onDestroy() {
    if (this.animTimer) clearInterval(this.animTimer);
  }
}
