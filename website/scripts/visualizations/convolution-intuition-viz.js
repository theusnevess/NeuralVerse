import { BaseVisualization } from './base-visualization.js';

export class ConvolutionIntuitionViz extends BaseVisualization {
  onInitialize() {
    this.kernels = {
      sharpen: [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
      ],
      blur: [
        [1/9, 1/9, 1/9],
        [1/9, 1/9, 1/9],
        [1/9, 1/9, 1/9]
      ],
      edge: [
        [-1, -1, -1],
        [-1, 8, -1],
        [-1, -1, -1]
      ]
    };

    this.state = {
      activeKernel: 'edge',
      stride: 1,
      padding: 0,
      currentStep: 0,
      inputGrid: [
        [120, 150, 100, 80,  90],
        [140, 200, 220, 110, 80],
        [90,  180, 250, 160, 70],
        [60,  120, 220, 180, 90],
        [80,  90,  140, 150, 110]
      ],
      isPlaying: false
    };

    this.container.innerHTML = `
      <div class="nv-viz-layout nv-viz-conv-layout">
        <div class="nv-viz-conv-grids">
          <div class="nv-conv-grid-container">
            <h4>Input (5x5)</h4>
            <div class="nv-conv-grid nv-conv-grid-input"></div>
          </div>
          <div class="nv-conv-kernel-arrow">➔</div>
          <div class="nv-conv-grid-container">
            <h4>Output Map</h4>
            <div class="nv-conv-grid nv-conv-grid-output"></div>
          </div>
        </div>
        <div class="nv-viz-sidebar">
          <h3>Convolution Intuition</h3>
          
          <div class="nv-viz-control-group">
            <label>Filter Kernel:</label>
            <select class="nv-select nv-conv-kernel-select" aria-label="Select filter kernel">
              <option value="edge">Edge Detection</option>
              <option value="sharpen">Sharpen</option>
              <option value="blur">Box Blur</option>
            </select>
          </div>

          <div class="nv-viz-control-group">
            <label for="conv-stride-slider">Stride: <span class="conv-stride-val">1</span></label>
            <input type="range" id="conv-stride-slider" min="1" max="2" value="1" class="nv-slider" aria-label="Stride slider">
          </div>

          <div class="nv-viz-control-group">
            <label><input type="checkbox" class="nv-conv-padding-checkbox" aria-label="Padding checkbox"> Apply Padding (p=1)</label>
          </div>

          <div class="nv-conv-animation-controls">
            <button class="nv-btn nv-btn-conv-step">Next Step</button>
            <button class="nv-btn nv-btn-conv-play">Play</button>
            <button class="nv-btn nv-btn-reset">Reset</button>
          </div>

          <div class="nv-conv-calculation-box" aria-live="polite">
            <h4>Kernel Calculation</h4>
            <div class="nv-conv-formula">Select step to compute...</div>
          </div>
        </div>
      </div>
    `;

    this.kernelSelect = this.container.querySelector('.nv-conv-kernel-select');
    this.strideSlider = this.container.querySelector('#conv-stride-slider');
    this.strideVal = this.container.querySelector('.conv-stride-val');
    this.paddingCheck = this.container.querySelector('.nv-conv-padding-checkbox');
    
    this.inputContainer = this.container.querySelector('.nv-conv-grid-input');
    this.outputContainer = this.container.querySelector('.nv-conv-grid-output');
    this.formulaBox = this.container.querySelector('.nv-conv-formula');

    this.stepBtn = this.container.querySelector('.nv-btn-conv-step');
    this.playBtn = this.container.querySelector('.nv-btn-conv-play');
    this.resetBtn = this.container.querySelector('.nv-btn-reset');

    // Bind event handlers
    this.kernelSelect.addEventListener('change', (e) => {
      this.state.activeKernel = e.target.value;
      this.resetAnimation();
    });

    this.strideSlider.addEventListener('input', () => {
      this.state.stride = parseInt(this.strideSlider.value);
      this.strideVal.textContent = this.state.stride;
      this.resetAnimation();
    });

    this.paddingCheck.addEventListener('change', () => {
      this.state.padding = this.paddingCheck.checked ? 1 : 0;
      this.resetAnimation();
    });

    this.stepBtn.addEventListener('click', () => this.step());
    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.resetBtn.addEventListener('click', () => this.reset());

    this.resetAnimation();
  }

  resetAnimation() {
    this.state.currentStep = 0;
    this.state.isPlaying = false;
    this.playBtn.textContent = 'Play';
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
    this.render();
  }

  onReset() {
    this.state.activeKernel = 'edge';
    this.state.stride = 1;
    this.state.padding = 0;
    this.kernelSelect.value = 'edge';
    this.strideSlider.value = 1;
    this.strideVal.textContent = 1;
    this.paddingCheck.checked = false;
    this.resetAnimation();
  }

  // Get padded version of input grid
  getPaddedGrid() {
    const p = this.state.padding;
    if (p === 0) return this.state.inputGrid;

    const rows = this.state.inputGrid.length;
    const cols = this.state.inputGrid[0].length;
    const padded = Array(rows + 2).fill(0).map(() => Array(cols + 2).fill(0));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        padded[r + 1][c + 1] = this.state.inputGrid[r][c];
      }
    }
    return padded;
  }

  // List all possible top-left positions of kernel window
  getKernelSteps() {
    const grid = this.getPaddedGrid();
    const size = grid.length;
    const stride = this.state.stride;
    const steps = [];

    // Kernel size is 3x3
    for (let r = 0; r <= size - 3; r += stride) {
      for (let c = 0; c <= size - 3; c += stride) {
        steps.push({ r, c });
      }
    }
    return steps;
  }

  step() {
    const steps = this.getKernelSteps();
    if (steps.length === 0) return;
    this.state.currentStep = (this.state.currentStep + 1) % steps.length;
    this.render();
  }

  togglePlay() {
    if (this.state.isPlaying) {
      this.state.isPlaying = false;
      this.playBtn.textContent = 'Play';
      clearInterval(this.playInterval);
      this.playInterval = null;
    } else {
      this.state.isPlaying = true;
      this.playBtn.textContent = 'Pause';
      
      const intervalMs = this.reducedMotion ? 100 : 800;
      this.playInterval = setInterval(() => {
        this.step();
      }, intervalMs);
    }
  }

  render() {
    const steps = this.getKernelSteps();
    const activeStep = steps[this.state.currentStep] || { r: 0, c: 0 };
    const grid = this.getPaddedGrid();
    const size = grid.length;
    const kernel = this.kernels[this.state.activeKernel];

    // Calculate outputs for each step
    const outputs = steps.map((s, idx) => {
      let sum = 0;
      for (let kr = 0; kr < 3; kr++) {
        for (let kc = 0; kc < 3; kc++) {
          sum += grid[s.r + kr][s.c + kc] * kernel[kr][kc];
        }
      }
      return sum;
    });

    // Render Input grid
    this.inputContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    this.inputContainer.innerHTML = '';
    
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        cell.className = 'nv-conv-cell';
        cell.textContent = grid[r][c];

        // Is it inside the active kernel window?
        const isKernelWindow = r >= activeStep.r && r < activeStep.r + 3 && c >= activeStep.c && c < activeStep.c + 3;
        if (isKernelWindow) {
          cell.classList.add('in-kernel');
          // Add color overlay or border
        }
        this.inputContainer.appendChild(cell);
      }
    }

    // Render Output grid
    // Dimensions of output map: sqrt(steps.length)
    const outDim = Math.sqrt(steps.length);
    this.outputContainer.style.gridTemplateColumns = `repeat(${outDim}, 1fr)`;
    this.outputContainer.innerHTML = '';

    for (let i = 0; i < steps.length; i++) {
      const cell = document.createElement('div');
      cell.className = 'nv-conv-cell';
      cell.textContent = outputs[i].toFixed(0);

      if (i === this.state.currentStep) {
        cell.classList.add('active-output');
      } else if (i < this.state.currentStep) {
        cell.classList.add('computed-output');
      }
      this.outputContainer.appendChild(cell);
    }

    // Calculate formula for formulaBox
    let calculationText = '';
    let sumVal = 0;
    const formulaParts = [];
    for (let kr = 0; kr < 3; kr++) {
      for (let kc = 0; kc < 3; kc++) {
        const val = grid[activeStep.r + kr][activeStep.c + kc];
        const w = kernel[kr][kc];
        formulaParts.push(`(${val} × ${w.toFixed(1)})`);
        sumVal += val * w;
      }
    }
    calculationText = `${formulaParts.join(' + ')} = <strong>${sumVal.toFixed(0)}</strong>`;
    this.formulaBox.innerHTML = calculationText;
  }

  onDestroy() {
    if (this.playInterval) {
      clearInterval(this.playInterval);
    }
  }
}
