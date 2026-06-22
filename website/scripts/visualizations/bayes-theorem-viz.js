import { BaseVisualization } from './base-visualization.js';

export class BayesTheoremViz extends BaseVisualization {
  onInitialize() {
    this.state = {
      prior: 0.2,       // P(A)
      likelihood: 0.8,  // P(B|A)
      falseAlarm: 0.1   // P(B|not A)
    };

    this.container.innerHTML = `
      <div class="nv-viz-layout nv-viz-bayes-layout">
        <div class="nv-viz-canvas-container">
          <canvas class="nv-viz-canvas" width="400" height="400"></canvas>
        </div>
        <div class="nv-viz-sidebar">
          <h3>Bayes' Theorem Visualizer</h3>
          
          <div class="nv-viz-control-group">
            <label for="bayes-prior-slider">Prior P(A) - Hypothesis: <span class="bayes-prior-val">20%</span></label>
            <input type="range" id="bayes-prior-slider" min="0.05" max="0.95" step="0.05" value="0.2" class="nv-slider" aria-label="Prior P of A">
          </div>

          <div class="nv-viz-control-group">
            <label for="bayes-likelihood-slider">Likelihood P(B|A) - True Positive: <span class="bayes-likelihood-val">80%</span></label>
            <input type="range" id="bayes-likelihood-slider" min="0.05" max="0.95" step="0.05" value="0.8" class="nv-slider" aria-label="Likelihood P of B given A">
          </div>

          <div class="nv-viz-control-group">
            <label for="bayes-false-slider">False Alarm P(B|not A): <span class="bayes-false-val">10%</span></label>
            <input type="range" id="bayes-false-slider" min="0.05" max="0.95" step="0.05" value="0.1" class="nv-slider" aria-label="False alarm rate P of B given not A">
          </div>

          <div class="nv-viz-metrics" aria-live="polite">
            <div class="nv-viz-metric-item">
              <span class="nv-viz-metric-label">Marginal P(B) [Total Evidence]:</span>
              <span class="nv-viz-metric-value nv-bayes-marginal">0.00%</span>
            </div>
            <div class="nv-viz-metric-item highlight-metric">
              <span class="nv-viz-metric-label">Posterior P(A|B) [Updated Belief]:</span>
              <span class="nv-viz-metric-value nv-bayes-posterior">0.00%</span>
            </div>
          </div>
          
          <button class="nv-btn nv-btn-reset">Reset Probabilities</button>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('.nv-viz-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Controls
    this.priorSlider = this.container.querySelector('#bayes-prior-slider');
    this.priorVal = this.container.querySelector('.bayes-prior-val');
    
    this.likeSlider = this.container.querySelector('#bayes-likelihood-slider');
    this.likeVal = this.container.querySelector('.bayes-likelihood-val');

    this.falseSlider = this.container.querySelector('#bayes-false-slider');
    this.falseVal = this.container.querySelector('.bayes-false-val');

    this.resetBtn = this.container.querySelector('.nv-btn-reset');

    const handleInput = () => {
      this.state.prior = parseFloat(this.priorSlider.value);
      this.state.likelihood = parseFloat(this.likeSlider.value);
      this.state.falseAlarm = parseFloat(this.falseSlider.value);

      this.priorVal.textContent = `${Math.round(this.state.prior * 100)}%`;
      this.likeVal.textContent = `${Math.round(this.state.likelihood * 100)}%`;
      this.falseVal.textContent = `${Math.round(this.state.falseAlarm * 100)}%`;

      this.render();
    };

    this.priorSlider.addEventListener('input', handleInput);
    this.likeSlider.addEventListener('input', handleInput);
    this.falseSlider.addEventListener('input', handleInput);

    this.resetBtn.addEventListener('click', () => this.reset());
  }

  onReset() {
    this.state.prior = 0.2;
    this.state.likelihood = 0.8;
    this.state.falseAlarm = 0.1;

    this.priorSlider.value = 0.2;
    this.likeSlider.value = 0.8;
    this.falseSlider.value = 0.1;

    this.priorVal.textContent = '20%';
    this.likeVal.textContent = '80%';
    this.falseVal.textContent = '10%';
  }

  render() {
    if (!this.ctx) return;
    const size = this.canvas.width;

    // Clear
    this.ctx.clearRect(0, 0, size, size);

    const prior = this.state.prior;
    const likelihood = this.state.likelihood;
    const falseAlarm = this.state.falseAlarm;

    // P(not A)
    const notPrior = 1 - prior;
    // P(B) = P(B|A)*P(A) + P(B|not A)*P(not A)
    const marginal = likelihood * prior + falseAlarm * notPrior;
    // P(A|B) = P(B|A)*P(A) / P(B)
    const posterior = marginal > 0 ? (likelihood * prior / marginal) : 0;

    // Update UI text
    this.container.querySelector('.nv-bayes-marginal').textContent = `${(marginal * 100).toFixed(2)}%`;
    this.container.querySelector('.nv-bayes-posterior').textContent = `${(posterior * 100).toFixed(2)}%`;

    // Draw Visual Venn Probability Space
    // Total area representing prior spaces as vertical columns
    const padding = 40;
    const innerWidth = size - padding * 2;
    const innerHeight = size - padding * 2;

    const ax = padding;
    const ay = padding;
    const aw = innerWidth * prior;
    const ah = innerHeight;

    const bx = ax + aw;
    const by = padding;
    const bw = innerWidth * notPrior;
    const bh = innerHeight;

    // Draw Column A (Prior Hypothesis)
    this.ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'; // Red P(A)
    this.ctx.fillRect(ax, ay, aw, ah);
    this.ctx.strokeStyle = '#ef4444';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(ax, ay, aw, ah);

    // Draw Column Not A (Prior alternative)
    this.ctx.fillStyle = 'rgba(107, 114, 128, 0.15)'; // Gray P(not A)
    this.ctx.fillRect(bx, by, bw, bh);
    this.ctx.strokeStyle = '#6b7280';
    this.ctx.strokeRect(bx, by, bw, bh);

    // Draw Event B region (likelihoods)
    // In column A, height of B is likelihood P(B|A)
    const bHeightInA = innerHeight * likelihood;
    const bYInA = padding + (innerHeight - bHeightInA);

    this.ctx.fillStyle = 'rgba(168, 85, 247, 0.5)'; // Purple overlapping B|A
    this.ctx.fillRect(ax, bYInA, aw, bHeightInA);

    // In column Not A, height of B is falseAlarm P(B|not A)
    const bHeightInNotA = innerHeight * falseAlarm;
    const bYInNotA = padding + (innerHeight - bHeightInNotA);

    this.ctx.fillStyle = 'rgba(168, 85, 247, 0.25)'; // Lighter purple B|not A
    this.ctx.fillRect(bx, bYInNotA, bw, bHeightInNotA);

    // Outline event B container boundary
    this.ctx.strokeStyle = '#a855f7';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(ax, bYInA);
    this.ctx.lineTo(ax + aw, bYInA);
    this.ctx.lineTo(ax + aw, bYInNotA);
    this.ctx.lineTo(bx + bw, bYInNotA);
    this.ctx.lineTo(bx + bw, padding + innerHeight);
    this.ctx.lineTo(ax, padding + innerHeight);
    this.ctx.closePath();
    this.ctx.stroke();

    // Labels
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px sans-serif';
    this.ctx.fillText('Hypothesis A', ax + 10, ay + 20);
    this.ctx.fillText('Alternative ¬A', bx + 10, by + 20);

    this.ctx.fillStyle = '#a855f7';
    this.ctx.fillText('Evidence B', ax + 10, padding + innerHeight - 15);
  }
}
