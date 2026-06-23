/**
 * NV-1000-A0/A1 — Agent Panel Controller
 *
 * Manages the Agent Assist panel UI shell within the NeuralVerse workspace.
 * Enhanced with explanation modes, structured sections, action buttons,
 * quick actions, and local persistence for NV-1000-A1.
 */

const STORAGE_KEY_PREFIX = 'nv_agent_panel_';

const QUICK_ACTIONS = [
  { id: 'explain-simply', label: 'Explain Simply', prompt: 'Explain this concept in simple terms', mode: 'beginner' },
  { id: 'explain-deeply', label: 'Explain Deeply', prompt: 'Give me a deep technical explanation', mode: 'advanced' },
  { id: 'give-analogy', label: 'Give Analogy', prompt: 'Give me an analogy for this concept', intent: 'analogy' },
  { id: 'compare', label: 'Compare', prompt: 'Compare this with related concepts', intent: 'compare' },
  { id: 'find-misconceptions', label: 'Find Misconceptions', prompt: 'What are common misconceptions about this?', intent: 'misconception' },
  { id: 'socratic-mode', label: 'Socratic Mode', prompt: 'Guide me through this with questions', intent: 'socratic' },
  { id: 'reflection-prompts', label: 'Reflection Prompts', prompt: 'Give me reflection prompts for this topic', intent: 'reflection' },
  { id: 'connect-concepts', label: 'Connect Concepts', prompt: 'How does this connect to other concepts?', intent: 'connect' },
  { id: 'summarize', label: 'Summarize', prompt: 'Summarize this concept', intent: 'summarize' }
];

const CURRICULUM_ACTIONS = [
  { id: 'show-prereqs', label: 'Show Prerequisites', prompt: 'What should I study before this?' },
  { id: 'show-next', label: 'Show Next Steps', prompt: 'What comes next?' },
  { id: 'explain-position', label: 'Explain Position', prompt: 'Where am I in the curriculum?' },
  { id: 'dependency-chain', label: 'Dependency Chain', prompt: 'Show me the dependency chain' },
  { id: 'can-i-skip', label: 'Can I Skip This?', prompt: 'Can I skip this lesson?' },
  { id: 'curriculum-summary', label: 'Curriculum Summary', prompt: 'Summarize this curriculum item' },
  { id: 'learning-route', label: 'Learning Route', prompt: 'Show me the learning route' },
  { id: 'related-concepts', label: 'Related Concepts', prompt: 'What are the neighbor lessons?' },
  { id: 'parent-hierarchy', label: 'Parent Hierarchy', prompt: 'Show me the parent hierarchy' },
  { id: 'neighbor-lessons', label: 'Neighbor Lessons', prompt: 'Show me the neighbor lessons' }
];

const VISUAL_ACTIONS = [
  { id: 'visualize-concept', label: 'Visualize Concept', prompt: 'Can you visualize this concept?' },
  { id: 'generate-diagram', label: 'Generate Diagram', prompt: 'Show me the best diagram for this concept' },
  { id: 'interactive-spec', label: 'Interactive Specification', prompt: 'Create an interactive visualization specification' },
  { id: 'compare-visually', label: 'Compare Visually', prompt: 'Compare visually the key concepts' },
  { id: 'build-timeline', label: 'Build Timeline', prompt: 'Build a timeline for this process' },
  { id: 'explain-geometrically', label: 'Explain Geometrically', prompt: 'Explain this geometrically' },
  { id: 'suggest-animation', label: 'Suggest Animation', prompt: 'Suggest an educational animation' },
  { id: 'visualization-strategy', label: 'Visualization Strategy', prompt: 'What visualization strategy should teach this best?' },
  { id: 'scientific-illustration', label: 'Scientific Illustration', prompt: 'Give scientific illustration guidance' },
  { id: 'best-teaching-medium', label: 'Best Teaching Medium', prompt: 'What is the best teaching medium for this concept?' }
];

const CODE_LAB_ACTIONS = [
  { id: 'generate-code-example', label: 'Generate Code Example', prompt: 'Show me how this works in code' },
  { id: 'explain-code', label: 'Explain Code', prompt: 'Walk through this implementation step by step' },
  { id: 'build-mini-lab', label: 'Build Mini Lab', prompt: 'Give me a mini laboratory exercise' },
  { id: 'simulation-spec', label: 'Simulation Specification', prompt: 'Can we simulate this algorithm?' },
  { id: 'step-execution', label: 'Step-by-Step Execution', prompt: 'Explain the execution flow step by step' },
  { id: 'debug-common-errors', label: 'Debug Common Errors', prompt: 'What common implementation mistakes should I debug?' },
  { id: 'analyze-complexity', label: 'Analyze Complexity', prompt: 'Analyze the time and space complexity' },
  { id: 'build-pipeline', label: 'Build Pipeline', prompt: 'Build an educational pipeline for this concept' },
  { id: 'explore-parameters', label: 'Explore Parameters', prompt: 'Explore the important parameters and trade-offs' },
  { id: 'design-experiment', label: 'Design Experiment', prompt: 'Design a reproducible experiment for this concept' }
];

const RESEARCH_ACTIONS = [
  { id: 'historical-context', label: 'Historical Context', prompt: 'Give historical context for this concept' },
  { id: 'landmark-papers', label: 'Landmark Papers', prompt: 'What are the landmark papers behind this concept?' },
  { id: 'benchmark-landscape', label: 'Benchmark Landscape', prompt: 'What benchmarks are commonly used in this area?' },
  { id: 'research-trends', label: 'Research Trends', prompt: 'What are the current research trends?' },
  { id: 'open-problems', label: 'Open Problems', prompt: 'What limitations remain unsolved?' },
  { id: 'compare-directions', label: 'Compare Research Directions', prompt: 'Compare competing research directions' },
  { id: 'reading-roadmap', label: 'Reading Roadmap', prompt: 'What should I read after mastering this lesson?' },
  { id: 'frontier-topics', label: 'Frontier Topics', prompt: 'What frontier topics connect to this concept?' },
  { id: 'evidence-confidence', label: 'Evidence Confidence', prompt: 'How mature is the evidence for this topic?' },
  { id: 'connect-research', label: 'Connect to Research', prompt: 'Connect this curriculum item to broader research' }
];

const TRANSFER_ACTIONS = [
  { id: 'real-world-applications', label: 'Real-World Applications', prompt: 'Where is this concept applied in the real world?' },
  { id: 'production-architecture', label: 'Production Architecture', prompt: 'Show the production architecture mapping for this concept' },
  { id: 'engineering-trade-offs', label: 'Engineering Trade-Offs', prompt: 'What are the engineering trade-offs of this approach?' },
  { id: 'mlops-perspective', label: 'MLOps Perspective', prompt: 'Explain the MLOps and operational perspective for this concept' },
  { id: 'decision-framework', label: 'Decision Framework', prompt: 'Provide a structured decision framework for this topic' },
  { id: 'failure-modes', label: 'Failure Modes', prompt: 'What are the failure modes in production and how do we mitigate them?' },
  { id: 'scaling-strategy', label: 'Scaling Strategy', prompt: 'What are the scaling considerations for this system?' },
  { id: 'industry-case-study', label: 'Industry Case Study', prompt: 'Generate an industry case study template for this concept' },
  { id: 'career-context', label: 'Career Context', prompt: 'How does this concept relate to professional engineering roles?' },
  { id: 'design-review', label: 'Design Review', prompt: 'Conduct a professional design review for this concept' }
];

const ASSESSMENT_ACTIONS = [
  { id: 'practice-questions', label: 'Generate Practice Questions', prompt: 'Generate practice questions for this concept' },
  { id: 'flashcards', label: 'Build Flashcards', prompt: 'Build flashcards for this concept' },
  { id: 'retrieval-practice', label: 'Retrieval Practice', prompt: 'Create a retrieval practice exercise for this concept' },
  { id: 'self-assessment', label: 'Guided Self-Assessment', prompt: 'Provide a guided self-assessment for this concept' },
  { id: 'mini-challenge', label: 'Mini Challenge', prompt: 'Create a mini challenge for this concept' },
  { id: 'reinforcement-plan', label: 'Reinforcement Plan', prompt: 'Generate a reinforcement plan for this concept' },
  { id: 'misconception-check', label: 'Misconception Check', prompt: 'Create a misconception check for this concept' },
  { id: 'reflection-journal', label: 'Reflection Journal', prompt: 'Generate a reflection journal prompt for this concept' },
  { id: 'connect-concepts', label: 'Connect Concepts', prompt: 'Generate concept connection exercises for this concept' },
  { id: 'review-session', label: 'Build Review Session', prompt: 'Build a structured review session for this concept' }
];

const OBSIDIAN_ACTIONS = [
  { id: 'permanent-note', label: 'Create Permanent Note', prompt: 'Create permanent note template for this concept' },
  { id: 'suggest-backlinks', label: 'Suggest Backlinks', prompt: 'Suggest backlinks for this concept' },
  { id: 'recommend-tags', label: 'Recommend Tags', prompt: 'Recommend tags for this concept' },
  { id: 'organize-collections', label: 'Organize Collections', prompt: 'Organize collections for this concept' },
  { id: 'build-concept-map', label: 'Build Concept Map', prompt: 'Build concept map for this concept' },
  { id: 'explore-neighbor-concepts', label: 'Explore Neighbor Concepts', prompt: 'Explore neighbor concepts for this concept' },
  { id: 'refine-note', label: 'Refine Note', prompt: 'Refine note for this concept' },
  { id: 'split-into-atomic-notes', label: 'Split Into Atomic Notes', prompt: 'Split into atomic notes for this concept' },
  { id: 'plan-knowledge-review', label: 'Plan Knowledge Review', prompt: 'Plan knowledge review for this concept' },
  { id: 'obsidian-strategy', label: 'Obsidian Strategy', prompt: 'Provide Obsidian strategy for this concept' }
];

function createAgentPanelController(options = {}) {
  const root = options.root || document;
  const orchestrator = options.orchestrator || window.NeuralVerse?.didacticOrchestrator;
  const contextBuilder = options.contextBuilder || window.NeuralVerse?.contextBuilder;
  const guardrails = options.guardrails || window.NeuralVerse?.agentGuardrails;

  let panelElement = null;
  let isOpen = false;
  let selectedAgentId = null;
  let currentMode = loadPreference('mode', 'default');
  let lastResult = null;
  let lastQuery = '';
  let interactionHistory = [];
  let collapsedSections = new Set(loadPreference('collapsed', []));

  const EXPLANATION_MODES = [
    { id: 'default', label: 'Default' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'mathematical', label: 'Mathematical' },
    { id: 'engineering', label: 'Engineering' },
    { id: 'research', label: 'Research' },
    { id: 'visual-intuition', label: 'Visual Intuition' },
    { id: 'analogy-first', label: 'Analogy First' },
    { id: 'step-by-step', label: 'Step-by-Step' },
    { id: 'executive-summary', label: 'Executive Summary' },
    { id: 'socratic', label: 'Socratic' }
  ];

  function init() {
    injectPanelMarkup();
    bindEvents();
    renderAgentList();
    restoreMode();
  }

  function injectPanelMarkup() {
    if (root.querySelector('#nv-agent-panel')) return;

    const panel = document.createElement('aside');
    panel.id = 'nv-agent-panel';
    panel.className = 'nv-agent-panel';
    panel.setAttribute('role', 'complementary');
    panel.setAttribute('aria-label', 'Didactic Agent Assist');
    panel.setAttribute('aria-hidden', 'true');

    panel.innerHTML = `
      <div class="nv-agent-panel__header">
        <div class="nv-agent-panel__header-title">
          <span class="nv-agent-panel__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </span>
          <h2 class="nv-agent-panel__title">Didactic Agent Assist</h2>
        </div>
        <button class="nv-agent-panel__close" aria-label="Close agent panel" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="nv-agent-panel__context" data-agent-context>
        <div class="nv-agent-panel__context-label">Current Context</div>
        <div class="nv-agent-panel__context-value" data-agent-context-value>No context loaded.</div>
      </div>

      <div class="nv-agent-panel__selector">
        <label class="nv-agent-panel__selector-label" for="nv-agent-select">Select Agent</label>
        <select id="nv-agent-select" class="nv-input nv-agent-select">
          <option value="">-- Choose an agent --</option>
        </select>
      </div>

      <div class="nv-agent-panel__mode-row" data-agent-mode-row style="display: none;">
        <label class="nv-agent-panel__selector-label" for="nv-agent-mode">Explanation Mode</label>
        <select id="nv-agent-mode" class="nv-input nv-agent-select">
          ${EXPLANATION_MODES.map(m => `<option value="${m.id}" ${m.id === currentMode ? 'selected' : ''}>${m.label}</option>`).join('')}
        </select>
      </div>

      <div class="nv-agent-panel__quick-actions" data-agent-quick-actions style="display: none;">
        <div class="nv-agent-panel__quick-actions-label">Quick Actions</div>
        <div class="nv-agent-panel__quick-actions-grid">
          ${QUICK_ACTIONS.map(a => `
            <button class="nv-agent-quick-action-btn" data-quick-action="${a.id}" data-prompt="${a.prompt}" ${a.mode ? `data-mode="${a.mode}"` : ''} ${a.intent ? `data-intent="${a.intent}"` : ''} type="button" aria-label="${a.label}">
              ${a.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="nv-agent-panel__quick-actions" data-agent-curriculum-actions style="display: none;">
        <div class="nv-agent-panel__quick-actions-label">Curriculum Actions</div>
        <div class="nv-agent-panel__quick-actions-grid">
          ${CURRICULUM_ACTIONS.map(a => `
            <button class="nv-agent-quick-action-btn nv-agent-quick-action-btn--curriculum" data-quick-action="${a.id}" data-prompt="${a.prompt}" type="button" aria-label="${a.label}">
              ${a.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="nv-agent-panel__quick-actions" data-agent-visual-actions style="display: none;">
        <div class="nv-agent-panel__quick-actions-label">Visual Media Actions</div>
        <div class="nv-agent-panel__quick-actions-grid">
          ${VISUAL_ACTIONS.map(a => `
            <button class="nv-agent-quick-action-btn nv-agent-quick-action-btn--visual" data-quick-action="${a.id}" data-prompt="${a.prompt}" type="button" aria-label="${a.label}">
              ${a.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="nv-agent-panel__quick-actions" data-agent-code-lab-actions style="display: none;">
        <div class="nv-agent-panel__quick-actions-label">Code Lab Actions</div>
        <div class="nv-agent-panel__quick-actions-grid">
          ${CODE_LAB_ACTIONS.map(a => `
            <button class="nv-agent-quick-action-btn nv-agent-quick-action-btn--code-lab" data-quick-action="${a.id}" data-prompt="${a.prompt}" type="button" aria-label="${a.label}">
              ${a.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="nv-agent-panel__quick-actions" data-agent-research-actions style="display: none;">
        <div class="nv-agent-panel__quick-actions-label">Research Actions</div>
        <div class="nv-agent-panel__quick-actions-grid">
          ${RESEARCH_ACTIONS.map(a => `
            <button class="nv-agent-quick-action-btn nv-agent-quick-action-btn--research" data-quick-action="${a.id}" data-prompt="${a.prompt}" type="button" aria-label="${a.label}">
              ${a.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="nv-agent-panel__quick-actions" data-agent-transfer-actions style="display: none;">
        <div class="nv-agent-panel__quick-actions-label">Transfer Actions</div>
        <div class="nv-agent-panel__quick-actions-grid">
          ${TRANSFER_ACTIONS.map(a => `
            <button class="nv-agent-quick-action-btn nv-agent-quick-action-btn--transfer" data-quick-action="${a.id}" data-prompt="${a.prompt}" type="button" aria-label="${a.label}">
              ${a.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="nv-agent-panel__quick-actions" data-agent-assessment-actions style="display: none;">
        <div class="nv-agent-panel__quick-actions-label">Assessment Actions</div>
        <div class="nv-agent-panel__quick-actions-grid">
          ${ASSESSMENT_ACTIONS.map(a => `
            <button class="nv-agent-quick-action-btn nv-agent-quick-action-btn--assessment" data-quick-action="${a.id}" data-prompt="${a.prompt}" type="button" aria-label="${a.label}">
              ${a.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="nv-agent-panel__quick-actions" data-agent-obsidian-actions style="display: none;">
        <div class="nv-agent-panel__quick-actions-label">Obsidian & Knowledge Actions</div>
        <div class="nv-agent-panel__quick-actions-grid">
          ${OBSIDIAN_ACTIONS.map(a => `
            <button class="nv-agent-quick-action-btn nv-agent-quick-action-btn--obsidian" data-quick-action="${a.id}" data-prompt="${a.prompt}" type="button" aria-label="${a.label}">
              ${a.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="nv-agent-panel__input-area">
        <label class="nv-agent-panel__input-label" for="nv-agent-input">Your Query</label>
        <div class="nv-agent-panel__input-row">
          <textarea id="nv-agent-input" class="nv-input nv-agent-textarea" rows="3" placeholder="Ask a didactic agent..." aria-label="Agent query input"></textarea>
        </div>
        <div class="nv-agent-panel__input-actions">
          <button class="nv-button nv-agent-submit" data-variant="primary" type="button" disabled>
            Send to Agent
          </button>
        </div>
      </div>

      <div class="nv-agent-panel__response" data-agent-response>
        <div class="nv-agent-panel__response-header">
          <span class="nv-agent-panel__response-label">Agent Response</span>
          <div class="nv-agent-panel__response-actions" data-agent-response-actions style="display: none;">
            <button class="nv-agent-action-btn" data-action="copy" title="Copy response" aria-label="Copy response">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            </button>
            <button class="nv-agent-action-btn" data-action="regenerate" title="Regenerate response" aria-label="Regenerate response">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
            </button>
            <button class="nv-agent-action-btn" data-action="simplify" title="Simplify explanation" aria-label="Simplify">Aa\u2193</button>
            <button class="nv-agent-action-btn" data-action="deepen" title="Deepen explanation" aria-label="Deepen">Aa\u2191</button>
          </div>
        </div>
        <div class="nv-agent-panel__response-content" data-agent-response-content>
          <div class="nv-agent-panel__empty-state">Select an agent and send a query to see a response.</div>
        </div>
        <div class="nv-agent-panel__reasoning" data-agent-reasoning style="display: none;">
          <div class="nv-agent-panel__reasoning-label">Reasoning Strategy</div>
          <div class="nv-agent-panel__reasoning-value" data-agent-reasoning-value></div>
        </div>
      </div>

      <div class="nv-agent-panel__guardrail-notice" data-agent-guardrail-notice style="display: none;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span data-agent-guardrail-text></span>
      </div>

      <div class="nv-agent-panel__history">
        <button class="nv-agent-panel__history-toggle" type="button" aria-expanded="false" aria-controls="nv-agent-history-list">
          Invocation History
          <span class="nv-agent-panel__history-count" data-agent-history-count>0</span>
        </button>
        <ul id="nv-agent-history-list" class="nv-agent-panel__history-list" data-agent-history-list style="display: none;"></ul>
      </div>

      <div class="nv-agent-panel__footer">
        <button class="nv-button nv-agent-clear" data-variant="ghost" type="button">Clear History</button>
      </div>
    `;

    document.body.appendChild(panel);
    panelElement = panel;
  }

  function bindEvents() {
    if (!panelElement) return;

    const closeBtn = panelElement.querySelector('.nv-agent-panel__close');
    const submitBtn = panelElement.querySelector('.nv-agent-submit');
    const clearBtn = panelElement.querySelector('.nv-agent-clear');
    const selectEl = panelElement.querySelector('#nv-agent-select');
    const modeEl = panelElement.querySelector('#nv-agent-mode');
    const inputEl = panelElement.querySelector('#nv-agent-input');
    const historyToggle = panelElement.querySelector('.nv-agent-panel__history-toggle');
    const responseActions = panelElement.querySelector('[data-agent-response-actions]');
    const quickActionContainers = panelElement.querySelectorAll('[data-agent-quick-actions], [data-agent-curriculum-actions], [data-agent-visual-actions], [data-agent-code-lab-actions], [data-agent-research-actions], [data-agent-transfer-actions], [data-agent-assessment-actions], [data-agent-obsidian-actions]');

    closeBtn?.addEventListener('click', closePanel);
    submitBtn?.addEventListener('click', handleSubmit);
    clearBtn?.addEventListener('click', handleClearHistory);
    selectEl?.addEventListener('change', handleAgentSelect);
    modeEl?.addEventListener('change', handleModeChange);
    historyToggle?.addEventListener('click', handleToggleHistory);

    inputEl?.addEventListener('input', () => {
      const hasText = inputEl.value.trim().length > 0;
      const hasAgent = selectEl?.value;
      if (submitBtn) submitBtn.disabled = !hasText || !hasAgent;
    });

    responseActions?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      handleResponseAction(btn.dataset.action);
    });

    quickActionContainers.forEach((container) => {
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-quick-action]');
        if (!btn) return;
        handleQuickAction(btn);
      });
    });

    panelElement.addEventListener('click', (e) => {
      const sectionToggle = e.target.closest('.nv-agent-section__toggle');
      if (sectionToggle) {
        const section = sectionToggle.closest('.nv-agent-section');
        if (section) {
          section.classList.toggle('nv-agent-section--collapsed');
          const title = sectionToggle.textContent.trim();
          if (section.classList.contains('nv-agent-section--collapsed')) {
            collapsedSections.add(title);
          } else {
            collapsedSections.delete(title);
          }
          savePreference('collapsed', [...collapsedSections]);
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closePanel();
      }
    });
  }

  function handleQuickAction(btn) {
    const prompt = btn.dataset.prompt;
    const mode = btn.dataset.mode;
    const intent = btn.dataset.intent;

    const inputEl = panelElement?.querySelector('#nv-agent-input');
    if (inputEl) inputEl.value = prompt;

    if (mode) {
      currentMode = mode;
      const modeEl = panelElement?.querySelector('#nv-agent-mode');
      if (modeEl) modeEl.value = mode;
    }

    const submitBtn = panelElement?.querySelector('.nv-agent-submit');
    if (submitBtn) submitBtn.disabled = false;

    handleSubmit();
  }

  function renderAgentList() {
    if (!panelElement) return;
    const selectEl = panelElement.querySelector('#nv-agent-select');
    if (!selectEl) return;

    const agents = orchestrator?.getRegisteredAgents() || [];
    const existingOptions = selectEl.querySelectorAll('option:not(:first-child)');
    existingOptions.forEach((opt) => opt.remove());

    agents.forEach((agent) => {
      const option = document.createElement('option');
      option.value = agent.id;
      option.textContent = agent.name;
      option.title = agent.description;
      selectEl.appendChild(option);
    });
  }

  function updateContextDisplay() {
    if (!panelElement || !contextBuilder) return;
    const contextValueEl = panelElement.querySelector('[data-agent-context-value]');
    if (!contextValueEl) return;

    const context = contextBuilder.buildContext();
    contextValueEl.textContent = context.summary;
  }

  function handleAgentSelect() {
    const selectEl = panelElement?.querySelector('#nv-agent-select');
    const inputEl = panelElement?.querySelector('#nv-agent-input');
    const submitBtn = panelElement?.querySelector('.nv-agent-submit');
    const modeRow = panelElement?.querySelector('[data-agent-mode-row]');
    const quickActionsRow = panelElement?.querySelector('[data-agent-quick-actions]');
    const curriculumActionsRow = panelElement?.querySelector('[data-agent-curriculum-actions]');
    const visualActionsRow = panelElement?.querySelector('[data-agent-visual-actions]');
    const codeLabActionsRow = panelElement?.querySelector('[data-agent-code-lab-actions]');
    const researchActionsRow = panelElement?.querySelector('[data-agent-research-actions]');
    const transferActionsRow = panelElement?.querySelector('[data-agent-transfer-actions]');
    const assessmentActionsRow = panelElement?.querySelector('[data-agent-assessment-actions]');
    const obsidianActionsRow = panelElement?.querySelector('[data-agent-obsidian-actions]');

    selectedAgentId = selectEl?.value || null;

    if (submitBtn) {
      submitBtn.disabled = !selectedAgentId || !inputEl?.value.trim();
    }

    if (modeRow) {
      modeRow.style.display = selectedAgentId === 'didactic-architecture' ? 'block' : 'none';
    }

    if (quickActionsRow) {
      quickActionsRow.style.display = selectedAgentId === 'didactic-architecture' ? 'block' : 'none';
    }

    if (curriculumActionsRow) {
      curriculumActionsRow.style.display = selectedAgentId === 'curriculum-dependency' ? 'block' : 'none';
    }

    if (visualActionsRow) {
      visualActionsRow.style.display = selectedAgentId === 'visual-interactive-media' ? 'block' : 'none';
    }

    if (codeLabActionsRow) {
      codeLabActionsRow.style.display = selectedAgentId === 'code-simulation-lab' ? 'block' : 'none';
    }

    if (researchActionsRow) {
      researchActionsRow.style.display = selectedAgentId === 'research-state-of-art' ? 'block' : 'none';
    }

    if (transferActionsRow) {
      transferActionsRow.style.display = selectedAgentId === 'application-professional-transfer' ? 'block' : 'none';
    }

    if (assessmentActionsRow) {
      assessmentActionsRow.style.display = selectedAgentId === 'assessment-reinforcement' ? 'block' : 'none';
    }

    if (obsidianActionsRow) {
      obsidianActionsRow.style.display = selectedAgentId === 'obsidian-knowledge-governance' ? 'block' : 'none';
    }

    hideGuardrailNotice();
  }

  function handleModeChange() {
    const modeEl = panelElement?.querySelector('#nv-agent-mode');
    currentMode = modeEl?.value || 'default';
    savePreference('mode', currentMode);
  }

  function restoreMode() {
    const modeEl = panelElement?.querySelector('#nv-agent-mode');
    if (modeEl) modeEl.value = currentMode;
  }

  async function handleSubmit() {
    const selectEl = panelElement?.querySelector('#nv-agent-select');
    const inputEl = panelElement?.querySelector('#nv-agent-input');
    const submitBtn = panelElement?.querySelector('.nv-agent-submit');
    const responseContent = panelElement?.querySelector('[data-agent-response-content]');
    const responseActions = panelElement?.querySelector('[data-agent-response-actions]');
    const reasoningEl = panelElement?.querySelector('[data-agent-reasoning]');
    const reasoningValue = panelElement?.querySelector('[data-agent-reasoning-value]');

    const agentId = selectEl?.value;
    const query = inputEl?.value?.trim();

    if (!agentId || !query) return;

    lastQuery = query;

    if (submitBtn) submitBtn.disabled = true;
    if (responseContent) {
      responseContent.innerHTML = '<div class="nv-agent-panel__loading">Processing query...</div>';
    }
    if (responseActions) responseActions.style.display = 'none';
    if (reasoningEl) reasoningEl.style.display = 'none';

    const options = {};
    if (agentId === 'didactic-architecture') {
      options.mode = currentMode;
    }

    try {
      const result = await orchestrator?.invokeAgent(agentId, query, options);

      if (result?.type === 'governed-refusal') {
        showGuardrailNotice(result.reason || result.notice);
        if (responseContent) {
          responseContent.innerHTML = `<div class="nv-agent-panel__refusal">
            <strong>Request blocked by governance.</strong>
            <p>${escapeHtml(result.reason || 'This request violates agent guardrails.')}</p>
          </div>`;
        }
      } else if (result?.type === 'error') {
        if (responseContent) {
          responseContent.innerHTML = `<div class="nv-agent-panel__error">
            <strong>Error:</strong> ${escapeHtml(result.content)}
          </div>`;
        }
      } else if (result?.sections && Array.isArray(result.sections)) {
        lastResult = result;
        if (responseContent) {
          responseContent.innerHTML = renderStructuredResponse(result);
        }
        if (responseActions) responseActions.style.display = 'flex';
        if (result.reasoningStrategy && reasoningEl && reasoningValue) {
          reasoningValue.textContent = result.reasoningStrategy;
          reasoningEl.style.display = 'block';
        }
        addRecentPrompt(query);
      } else {
        lastResult = result;
        if (responseContent) {
          responseContent.innerHTML = `<div class="nv-agent-panel__result">
            <div class="nv-agent-panel__result-header">
              <span class="nv-badge" data-variant="info">${escapeHtml(result.agentName || agentId)}</span>
              <span class="nv-agent-panel__result-time">${formatTime(result.timestamp)}</span>
            </div>
            <div class="nv-agent-panel__result-content">${formatMarkdown(result.content || '')}</div>
            ${result.disclaimer ? `<div class="nv-agent-panel__disclaimer">${escapeHtml(result.disclaimer)}</div>` : ''}
          </div>`;
        }
        if (responseActions) responseActions.style.display = 'flex';
      }

      interactionHistory.push({
        agentId,
        query,
        result,
        timestamp: new Date().toISOString()
      });

      updateHistoryCount();
    } catch (error) {
      if (responseContent) {
        responseContent.innerHTML = `<div class="nv-agent-panel__error">
          <strong>Execution error:</strong> ${escapeHtml(error.message)}
        </div>`;
      }
    }

    if (submitBtn && inputEl?.value.trim() && selectEl?.value) {
      submitBtn.disabled = false;
    }
  }

  function renderStructuredResponse(result) {
    let html = '<div class="nv-agent-structured">';

    html += `<div class="nv-agent-structured__meta">
      <span class="nv-badge" data-variant="info">${escapeHtml(result.agentName || result.agentId)}</span>
      ${result.mode ? `<span class="nv-badge" data-variant="neutral">${escapeHtml(result.mode)}</span>` : ''}
      <span class="nv-agent-panel__result-time">${formatTime(result.timestamp)}</span>
    </div>`;

    if (result.topic) {
      html += `<div class="nv-agent-structured__topic">${escapeHtml(result.topic)}</div>`;
    }

    if (result.sections && result.sections.length > 0) {
      result.sections.forEach((section) => {
        const isCollapsed = collapsedSections.has(section.title);
        const sectionClass = isCollapsed ? 'nv-agent-section nv-agent-section--collapsed' : 'nv-agent-section';

        html += `<div class="${sectionClass}" data-section="${escapeHtml(section.title)}">
          <button class="nv-agent-section__toggle" type="button" aria-expanded="${!isCollapsed}">
            <span class="nv-agent-section__chevron" aria-hidden="true">\u203a</span>
            ${escapeHtml(section.title)}
          </button>
          <div class="nv-agent-section__content">
            ${renderSectionContent(section)}
          </div>
        </div>`;
      });
    }

    html += '</div>';
    return html;
  }

  function renderSectionContent(section) {
    if (section.type === 'comparison-table') {
      return renderMarkdownTable(section.content);
    }
    if (section.type === 'socratic-questions') {
      return renderSocraticQuestions(section.content);
    }
    if (section.type === 'visual-card') {
      return `<div class="nv-agent-visual-card">${formatMarkdown(section.content || '')}</div>`;
    }
    if (section.type === 'timeline') {
      return renderTimeline(section.content);
    }
    if (section.type === 'code-block') {
      return renderCodeBlock(section);
    }
    if (section.type === 'execution-flow') {
      return renderExecutionFlow(section.content);
    }
    if (section.type === 'lab-card') {
      return `<div class="nv-agent-lab-card">${formatMarkdown(section.content || '')}</div>`;
    }
    if (section.type === 'research-card') {
      return renderResearchCard(section);
    }
    if (section.type === 'confidence-card') {
      return renderConfidenceCard(section);
    }
    if (section.type === 'research-table') {
      return renderMarkdownTable(section.content);
    }
    if (section.type === 'engineering-card') {
      return `<div class="nv-agent-engineering-card">${formatMarkdown(section.content || '')}</div>`;
    }
    if (section.type === 'reinforcement-card') {
      return `<div class="nv-agent-reinforcement-card">${formatMarkdown(section.content || '')}</div>`;
    }
    if (section.type === 'knowledge-card') {
      return `<div class="nv-agent-knowledge-card">${formatMarkdown(section.content || '')}</div>`;
    }
    return formatMarkdown(section.content || '');
  }

  function renderResearchCard(section) {
    const confidence = section.confidence ? `<span class="nv-agent-confidence-badge" data-confidence="${escapeHtml(section.confidence)}">${escapeHtml(section.confidence)}</span>` : '';
    return `<div class="nv-agent-research-card">${confidence}${formatMarkdown(section.content || '')}</div>`;
  }

  function renderConfidenceCard(section) {
    return `<div class="nv-agent-confidence-card">
      <span class="nv-agent-confidence-badge" data-confidence="${escapeHtml(section.confidence || section.content || '')}">${escapeHtml(section.confidence || section.content || '')}</span>
      <div>${formatMarkdown(section.content || '')}</div>
    </div>`;
  }

  function renderCodeBlock(section) {
    const language = section.language || 'text';
    return `<div class="nv-agent-code-block" data-language="${escapeHtml(language)}">
      <div class="nv-agent-code-block__label">${escapeHtml(language)}</div>
      <pre><code>${escapeHtml(section.content || '')}</code></pre>
    </div>`;
  }

  function renderExecutionFlow(text) {
    if (!text) return '';
    const steps = text.split('\n').map((line) => line.trim()).filter(Boolean).filter((line) => line !== '↓');
    if (steps.length === 0) return formatMarkdown(text);
    let html = '<ol class="nv-agent-execution-flow">';
    steps.forEach((step) => {
      html += `<li class="nv-agent-execution-flow__item">${formatMarkdown(step)}</li>`;
    });
    html += '</ol>';
    return html;
  }

  function renderTimeline(text) {
    if (!text) return '';
    const items = text.split('\n').filter(l => l.trim()).map(l => l.replace(/^\d+[\.)]\s*/, '').trim());
    if (items.length === 0) return formatMarkdown(text);

    let html = '<ol class="nv-agent-timeline">';
    items.forEach((item) => {
      html += `<li class="nv-agent-timeline__item">${formatMarkdown(item)}</li>`;
    });
    html += '</ol>';
    return html;
  }

  function renderMarkdownTable(text) {
    if (!text) return '';
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return formatMarkdown(text);

    let html = '<div class="nv-agent-table-wrapper"><table class="nv-agent-table">';

    lines.forEach((line, i) => {
      if (line.match(/^\|[\s-|]+\|$/)) return;

      const cells = line.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
      const tag = i === 0 ? 'th' : 'td';

      html += '<tr>';
      cells.forEach(cell => {
        html += `<${tag}>${formatMarkdown(cell)}</${tag}>`;
      });
      html += '</tr>';
    });

    html += '</table></div>';
    return html;
  }

  function renderSocraticQuestions(text) {
    if (!text) return '';
    const questions = text.split('\n').filter(l => l.trim().endsWith('?'));
    if (questions.length === 0) return formatMarkdown(text);

    let html = '<ol class="nv-agent-socratic-list">';
    questions.forEach(q => {
      html += `<li class="nv-agent-socratic-item">${formatMarkdown(q.replace(/^\d+[\.\)]\s*/, ''))}</li>`;
    });
    html += '</ol>';
    return html;
  }

  function handleResponseAction(action) {
    if (!lastResult) return;

    switch (action) {
      case 'copy':
        copyResponseToClipboard();
        break;
      case 'regenerate':
        regenerateResponse();
        break;
      case 'simplify':
        changeModeAndResubmit('beginner');
        break;
      case 'deepen':
        changeModeAndResubmit('advanced');
        break;
    }
  }

  function copyResponseToClipboard() {
    const text = flattenResponse(lastResult);
    navigator.clipboard.writeText(text).then(() => {
      showToast('Response copied to clipboard');
    }).catch(() => {
      showToast('Failed to copy');
    });
  }

  function flattenResponse(result) {
    if (!result) return '';
    if (result.content) return result.content;
    if (result.sections) {
      return result.sections.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n---\n\n');
    }
    return '';
  }

  function regenerateResponse() {
    if (lastQuery) {
      const inputEl = panelElement?.querySelector('#nv-agent-input');
      if (inputEl) inputEl.value = lastQuery;
      handleSubmit();
    }
  }

  function changeModeAndResubmit(newMode) {
    currentMode = newMode;
    const modeEl = panelElement?.querySelector('#nv-agent-mode');
    if (modeEl) modeEl.value = newMode;
    savePreference('mode', newMode);
    regenerateResponse();
  }

  function showToast(message) {
    const existing = document.querySelector('.nv-agent-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'nv-agent-toast';
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('nv-agent-toast--visible');
      setTimeout(() => {
        toast.classList.remove('nv-agent-toast--visible');
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    });
  }

  function addRecentPrompt(query) {
    const prompts = loadPreference('recent_prompts', []);
    const filtered = prompts.filter(p => p !== query);
    filtered.unshift(query);
    if (filtered.length > 20) filtered.length = 20;
    savePreference('recent_prompts', filtered);
  }

  function showGuardrailNotice(message) {
    const notice = panelElement?.querySelector('[data-agent-guardrail-notice]');
    const textEl = panelElement?.querySelector('[data-agent-guardrail-text]');
    if (notice && textEl) {
      textEl.textContent = message;
      notice.style.display = 'flex';
    }
  }

  function hideGuardrailNotice() {
    const notice = panelElement?.querySelector('[data-agent-guardrail-notice]');
    if (notice) {
      notice.style.display = 'none';
    }
  }

  function handleClearHistory() {
    interactionHistory = [];
    updateHistoryCount();

    const historyList = panelElement?.querySelector('[data-agent-history-list]');
    if (historyList) historyList.innerHTML = '';

    orchestrator?.clearInvocationHistory();
    guardrails?.clearInvocationLog();
  }

  function handleToggleHistory() {
    const toggle = panelElement?.querySelector('.nv-agent-panel__history-toggle');
    const list = panelElement?.querySelector('[data-agent-history-list]');
    if (!toggle || !list) return;

    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    list.style.display = expanded ? 'none' : 'block';

    if (!expanded) {
      renderHistoryList();
    }
  }

  function renderHistoryList() {
    const list = panelElement?.querySelector('[data-agent-history-list]');
    if (!list) return;

    list.innerHTML = '';

    if (interactionHistory.length === 0) {
      list.innerHTML = '<li class="nv-agent-panel__history-empty">No invocations yet.</li>';
      return;
    }

    [...interactionHistory].reverse().forEach((entry) => {
      const li = document.createElement('li');
      li.className = 'nv-agent-panel__history-item';
      li.innerHTML = `
        <div class="nv-agent-panel__history-agent">${escapeHtml(entry.agentId)}</div>
        <div class="nv-agent-panel__history-query">${escapeHtml(entry.query?.substring(0, 80))}${entry.query?.length > 80 ? '...' : ''}</div>
        <div class="nv-agent-panel__history-status ${entry.result?.type === 'governed-refusal' ? 'refused' : 'success'}">
          ${entry.result?.type === 'governed-refusal' ? 'Refused' : entry.result?.type === 'error' ? 'Error' : 'Success'}
        </div>
        <div class="nv-agent-panel__history-time">${formatTime(entry.timestamp)}</div>
      `;
      list.appendChild(li);
    });
  }

  function updateHistoryCount() {
    const countEl = panelElement?.querySelector('[data-agent-history-count]');
    if (countEl) {
      countEl.textContent = String(interactionHistory.length);
    }
  }

  function openPanel() {
    if (!panelElement) return;
    isOpen = true;
    panelElement.classList.add('nv-agent-panel--open');
    panelElement.setAttribute('aria-hidden', 'false');
    updateContextDisplay();

    const firstFocusable = panelElement.querySelector('select, textarea, button');
    if (firstFocusable) firstFocusable.focus();
  }

  function closePanel() {
    if (!panelElement) return;
    isOpen = false;
    panelElement.classList.remove('nv-agent-panel--open');
    panelElement.setAttribute('aria-hidden', 'true');

    const triggerBtn = document.querySelector('#nv-agent-trigger');
    if (triggerBtn) triggerBtn.focus();
  }

  function togglePanel() {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function isPanelOpen() {
    return isOpen;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatTime(isoString) {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[234]>)/g, '$1');
    html = html.replace(/(<\/h[234]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    return html;
  }

  function loadPreference(key, defaultValue) {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  function savePreference(key, value) {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch {
      // silent
    }
  }

  return {
    init,
    openPanel,
    closePanel,
    togglePanel,
    isPanelOpen,
    updateContextDisplay,
    renderAgentList,
    getCurrentMode: () => currentMode,
    getLastResult: () => lastResult
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
}

export { createAgentPanelController };
