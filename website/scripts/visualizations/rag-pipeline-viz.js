import { BaseVisualization } from './base-visualization.js';

export class RagPipelineViz extends BaseVisualization {
  onInitialize() {
    this.state = {
      activeStage: 'retrieve', // 'retrieve', 'augment', 'generate'
      selectedQuery: 'How do CNNs work?',
      queries: [
        'How do CNNs work?',
        'What is Cosine Similarity?',
        'Explain Bayes Theorem'
      ],
      documents: {
        'How do CNNs work?': [
          'CNNs use convolutional layers to extract spatial features from input images.',
          'Pooling layers in CNNs reduce dimensions and compute spatial invariants.',
          'Feature maps are convolved with sliding filter kernels.'
        ],
        'What is Cosine Similarity?': [
          'Cosine similarity measures the angle between two non-zero vectors in a space.',
          'It is bounded between -1 and 1, where 1 means identical orientation.',
          'Formula: cos(theta) = (A . B) / (||A|| * ||B||).'
        ],
        'Explain Bayes Theorem': [
          'Bayes Theorem computes posterior probability P(A|B) from prior and likelihood.',
          'Formula: P(A|B) = P(B|A) * P(A) / P(B).',
          'It is a fundamental tool for updating beliefs given new evidence.'
        ]
      },
      simulatedResponse: {
        'How do CNNs work?': 'CNNs extract spatial features using sliding filters (convolutions) and compress them via pooling layers to construct hierarchical representations.',
        'What is Cosine Similarity?': 'Cosine similarity evaluates directional alignment rather than magnitude, calculating the dot product of normalized vectors.',
        'Explain Bayes Theorem': 'Bayes Theorem updates the probability of a hypothesis (prior) as new evidence arrives, scaling likelihood by marginal likelihood.'
      }
    };

    this.container.innerHTML = `
      <div class="nv-viz-rag">
        <h3>RAG Pipeline Step-by-Step Explorer</h3>
        
        <div class="nv-viz-rag-queries">
          <label>1. Select User Query:</label>
          <select class="nv-select nv-rag-query-select" aria-label="Select RAG query">
            ${this.state.queries.map(q => `<option value="${q}" ${q === this.state.selectedQuery ? 'selected' : ''}>${q}</option>`).join('')}
          </select>
        </div>

        <div class="nv-viz-rag-tabs" role="tablist">
          <button class="nv-rag-tab active" data-stage="retrieve" role="tab" aria-selected="true" aria-controls="panel-retrieve">Retrieve</button>
          <button class="nv-rag-tab" data-stage="augment" role="tab" aria-selected="false" aria-controls="panel-augment">Augment</button>
          <button class="nv-rag-tab" data-stage="generate" role="tab" aria-selected="false" aria-controls="panel-generate">Generate</button>
        </div>

        <div class="nv-viz-rag-body">
          <div id="panel-retrieve" class="nv-rag-panel" role="tabpanel">
            <h4>Stage 1: Document Retrieval</h4>
            <p class="nv-muted">Vector search queries database. Top-3 most semantically similar chunks retrieved:</p>
            <ul class="nv-rag-docs-list"></ul>
          </div>

          <div id="panel-augment" class="nv-rag-panel nv-hidden" role="tabpanel">
            <h4>Stage 2: Context Augmentation</h4>
            <p class="nv-muted">Constructs the prompt by infusing retrieved content into a system template:</p>
            <pre class="nv-rag-prompt-preview"></pre>
          </div>

          <div id="panel-generate" class="nv-rag-panel nv-hidden" role="tabpanel">
            <h4>Stage 3: LLM Generation</h4>
            <p class="nv-muted">The LLM processes the augmented prompt and synthesizes a grounded response:</p>
            <div class="nv-rag-generation-box">
              <div class="nv-rag-response-text"></div>
            </div>
            <button class="nv-btn nv-btn-run-gen">Generate Response</button>
          </div>
        </div>
      </div>
    `;

    this.querySelect = this.container.querySelector('.nv-rag-query-select');
    this.tabs = this.container.querySelectorAll('.nv-rag-tab');
    this.panels = this.container.querySelectorAll('.nv-rag-panel');
    this.docsList = this.container.querySelector('.nv-rag-docs-list');
    this.promptPreview = this.container.querySelector('.nv-rag-prompt-preview');
    this.responseText = this.container.querySelector('.nv-rag-response-text');
    this.genBtn = this.container.querySelector('.nv-btn-run-gen');

    // Query select handler
    this.querySelect.addEventListener('change', (e) => {
      this.state.selectedQuery = e.target.value;
      this.render();
    });

    // Tab switcher
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchStage(tab.dataset.stage);
      });
    });

    this.genBtn.addEventListener('click', () => {
      this.runGeneration();
    });
  }

  switchStage(stage) {
    this.state.activeStage = stage;
    this.tabs.forEach(t => {
      const active = t.dataset.stage === stage;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active);
    });
    this.panels.forEach(p => {
      const active = p.id === `panel-${stage}`;
      p.classList.toggle('nv-hidden', !active);
    });
    this.render();
  }

  runGeneration() {
    this.responseText.textContent = '';
    const fullText = this.state.simulatedResponse[this.state.selectedQuery];
    let i = 0;
    this.genBtn.disabled = true;

    if (this.reducedMotion) {
      this.responseText.textContent = fullText;
      this.genBtn.disabled = false;
      return;
    }

    const typeWriter = () => {
      if (i < fullText.length) {
        this.responseText.textContent += fullText.charAt(i);
        i++;
        this.animationFrame = requestAnimationFrame(typeWriter);
      } else {
        this.genBtn.disabled = false;
      }
    };
    typeWriter();
  }

  onReset() {
    this.state.activeStage = 'retrieve';
    this.state.selectedQuery = 'How do CNNs work?';
    this.querySelect.value = 'How do CNNs work?';
    this.switchStage('retrieve');
  }

  render() {
    const q = this.state.selectedQuery;
    const docs = this.state.documents[q] || [];

    // Stage 1 rendering
    this.docsList.innerHTML = docs.map(d => `<li><span class="nv-bullet"></span>${d}</li>`).join('');

    // Stage 2 rendering
    const systemPrompt = `System: You are a grounded helper. Use only context to reply.\n\nContext:\n${docs.map((d, idx) => `[Doc ${idx+1}] ${d}`).join('\n')}\n\nUser Query: ${q}\n\nResponse:`;
    this.promptPreview.textContent = systemPrompt;

    // Stage 3 rendering
    if (this.state.activeStage !== 'generate') {
      this.responseText.textContent = 'Click "Generate Response" to see the output simulation...';
    }
  }

  onDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}
