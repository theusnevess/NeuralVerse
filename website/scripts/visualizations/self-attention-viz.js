import { BaseVisualization } from './base-visualization.js';

export class SelfAttentionViz extends BaseVisualization {
  onInitialize() {
    this.tokens = ['The', 'bank', 'of', 'the', 'river'];
    
    // Fixed attention matrices representing two different contexts of "bank"
    // (river bank vs financial bank)
    this.contexts = {
      river: [
        [0.4, 0.1, 0.1, 0.1, 0.3], // The -> bank, river
        [0.1, 0.5, 0.1, 0.1, 0.2], // bank -> bank, river
        [0.1, 0.2, 0.4, 0.1, 0.2], // of -> of, bank, river
        [0.1, 0.1, 0.1, 0.5, 0.2], // the -> the, river
        [0.2, 0.3, 0.1, 0.1, 0.3]  // river -> bank, river
      ],
      finance: [
        [0.3, 0.4, 0.1, 0.1, 0.1], // The -> bank, finance
        [0.1, 0.6, 0.1, 0.1, 0.1], // bank -> bank
        [0.1, 0.4, 0.3, 0.1, 0.1], // of -> bank, of
        [0.1, 0.2, 0.1, 0.5, 0.1], // the -> the
        [0.1, 0.3, 0.1, 0.1, 0.4]  // river/money -> bank, money
      ]
    };

    this.state = {
      selectedTokenIdx: 1, // "bank"
      currentContext: 'river'
    };

    this.container.innerHTML = `
      <div class="nv-viz-layout">
        <div class="nv-viz-attention-space">
          <h4>Attention Matrix Heatmap</h4>
          <div class="nv-attention-matrix-grid"></div>
        </div>
        <div class="nv-viz-sidebar">
          <h3>Self-Attention Explorer</h3>
          
          <div class="nv-viz-control-group">
            <label>Context Paradigm:</label>
            <select class="nv-select nv-context-select" aria-label="Select context paradigm">
              <option value="river">River Bank (Nature)</option>
              <option value="finance">Financial Institution (Money)</option>
            </select>
          </div>

          <div class="nv-viz-control-group">
            <label>Target Token (Select to view query relations):</label>
            <div class="nv-token-chips-container" role="listbox" aria-label="Tokens select"></div>
          </div>

          <div class="nv-attention-weights-results" aria-live="polite">
            <h4>Attention Weights from <span class="selected-token-name">bank</span></h4>
            <div class="nv-attention-weights-bars"></div>
          </div>
          
          <button class="nv-btn nv-btn-reset">Reset Explorer</button>
        </div>
      </div>
    `;

    this.contextSelect = this.container.querySelector('.nv-context-select');
    this.chipsContainer = this.container.querySelector('.nv-token-chips-container');
    this.matrixGrid = this.container.querySelector('.nv-attention-matrix-grid');
    this.weightsBars = this.container.querySelector('.nv-attention-weights-bars');
    this.resetBtn = this.container.querySelector('.nv-btn-reset');

    this.contextSelect.addEventListener('change', (e) => {
      this.state.currentContext = e.target.value;
      this.render();
    });

    this.resetBtn.addEventListener('click', () => this.reset());

    // Build chip triggers
    this.tokens.forEach((token, idx) => {
      const chip = document.createElement('button');
      chip.className = `nv-token-chip ${idx === this.state.selectedTokenIdx ? 'active' : ''}`;
      chip.textContent = `"${token}"`;
      chip.setAttribute('role', 'option');
      chip.setAttribute('aria-selected', idx === this.state.selectedTokenIdx);
      chip.addEventListener('click', () => {
        this.selectToken(idx);
      });
      this.chipsContainer.appendChild(chip);
    });
  }

  selectToken(idx) {
    this.state.selectedTokenIdx = idx;
    const chips = this.chipsContainer.querySelectorAll('.nv-token-chip');
    chips.forEach((c, index) => {
      const active = index === idx;
      c.classList.toggle('active', active);
      c.setAttribute('aria-selected', active);
    });
    this.render();
  }

  onReset() {
    this.state.selectedTokenIdx = 1;
    this.state.currentContext = 'river';
    this.contextSelect.value = 'river';
    this.selectToken(1);
  }

  render() {
    const context = this.state.currentContext;
    const matrix = this.contexts[context];
    const targetIdx = this.state.selectedTokenIdx;
    
    this.container.querySelector('.selected-token-name').textContent = `"${this.tokens[targetIdx]}"`;

    // Render Matrix Heatmap
    this.matrixGrid.innerHTML = '';
    // Headers
    const corner = document.createElement('div');
    corner.className = 'nv-matrix-header';
    this.matrixGrid.appendChild(corner);
    this.tokens.forEach(t => {
      const th = document.createElement('div');
      th.className = 'nv-matrix-header nv-matrix-header-col';
      th.textContent = t;
      this.matrixGrid.appendChild(th);
    });

    for (let r = 0; r < this.tokens.length; r++) {
      const rh = document.createElement('div');
      rh.className = 'nv-matrix-header nv-matrix-header-row';
      rh.textContent = this.tokens[r];
      this.matrixGrid.appendChild(rh);

      for (let c = 0; c < this.tokens.length; c++) {
        const val = matrix[r][c];
        const cell = document.createElement('div');
        cell.className = 'nv-matrix-cell';
        cell.style.backgroundColor = `rgba(168, 85, 247, ${val})`; // scale purple
        cell.title = `Attention from ${this.tokens[r]} to ${this.tokens[c]}: ${val.toFixed(2)}`;
        
        // Highlight active row/col
        if (r === targetIdx) {
          cell.classList.add('active-row');
        }
        
        const span = document.createElement('span');
        span.textContent = val.toFixed(2);
        cell.appendChild(span);
        this.matrixGrid.appendChild(cell);
      }
    }

    // Render weights bars for active query
    const activeWeights = matrix[targetIdx];
    this.weightsBars.innerHTML = this.tokens.map((token, idx) => {
      const weight = activeWeights[idx];
      const pct = (weight * 100).toFixed(0);
      return `
        <div class="nv-attention-bar-item">
          <span class="nv-attention-bar-token">"${token}"</span>
          <div class="nv-attention-bar-track">
            <div class="nv-attention-bar-fill" style="width: ${pct}%"></div>
          </div>
          <span class="nv-attention-bar-value">${weight.toFixed(2)}</span>
        </div>
      `;
    }).join('');
  }
}
