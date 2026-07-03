/**
 * NV-1000-A0/A1 — Agent Panel Controller (Copilot UX v2.0)
 *
 * Transforms the Didactic Agent Assist into a premium AI copilot experience.
 * The user interacts with "NeuralVerse AI" — the orchestration layer
 * internally decides which specialized agents participate.
 *
 * All 10 agents, orchestration, governance, collaboration, guardrails,
 * context building, and response rendering remain intact.
 * Only the user experience changes.
 */

const STORAGE_KEY_PREFIX = 'nv_agent_panel_';

/* =========================================================
   AI Modes — Internal agent mappings
   ========================================================= */

const AI_MODES = [
  {
    id: 'automatic',
    label: 'Automatic',
    icon: '\u2728',
    description: 'AI decides the best approach',
    agents: null
  },
  {
    id: 'teaching',
    label: 'Teaching',
    icon: '\u{1F4A1}',
    description: 'Adaptive explanations and learning',
    agents: ['didactic-architecture', 'storytelling-learning-journey', 'assessment-reinforcement']
  },
  {
    id: 'research',
    label: 'Research',
    icon: '\u{1F52C}',
    description: 'Papers, benchmarks, and frontier topics',
    agents: ['research-state-of-art', 'obsidian-knowledge-governance', 'application-professional-transfer']
  },
  {
    id: 'practice',
    label: 'Practice',
    icon: '\u{1F9EA}',
    description: 'Labs, exercises, and hands-on learning',
    agents: ['code-simulation-lab', 'assessment-reinforcement', 'application-professional-transfer']
  },
  {
    id: 'engineering',
    label: 'Engineering',
    icon: '\u{1F3ED}',
    description: 'Real-world applications and trade-offs',
    agents: ['application-professional-transfer', 'code-simulation-lab', 'research-state-of-art']
  },
  {
    id: 'visual',
    label: 'Visual',
    icon: '\u{1F3A8}',
    description: 'Diagrams, animations, and visual explanations',
    agents: ['visual-interactive-media', 'didactic-architecture', 'curiosity-engagement']
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    icon: '\u{1F4DA}',
    description: 'Notes, connections, and knowledge organization',
    agents: ['obsidian-knowledge-governance', 'curriculum-dependency', 'didactic-architecture']
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: '\u{1F680}',
    description: 'Deep technical analysis and research',
    agents: ['research-state-of-art', 'code-simulation-lab', 'didactic-architecture']
  }
];

/* =========================================================
   Smart Suggestions — Context-aware prompts
   ========================================================= */

const DEFAULT_SUGGESTIONS = [
  'Explain CNNs',
  'Build intuition first',
  'Show me the math',
  'Try a guided exercise',
  'Open a visual lab',
  'Compare related concepts'
];

const CONTEXT_SUGGESTIONS = {
  laboratory: [
    'Explain this experiment',
    'Predict the outcome',
    'Create another challenge',
    'What are the key variables?',
    'Show similar experiments'
  ],
  research: [
    'Summarize this paper',
    'Compare approaches',
    'Explain contributions',
    'What are the limitations?',
    'Show related work'
  ],
  assessment: [
    'Create harder questions',
    'Explain my mistakes',
    'Generate review plan',
    'What topics need review?',
    'Create flashcards'
  ],
  workspace: [
    'Explain this concept',
    'Show prerequisites',
    'Generate a lab exercise',
    'Connect to other topics',
    'Create a visual explanation'
  ],
  learning: [
    'Where am I in the curriculum?',
    'What comes next?',
    'Show the learning path',
    'Explain dependencies',
    'Recommend next steps'
  ]
};

/* =========================================================
   Response Styles — Simplified from 12 to 8
   ========================================================= */

const RESPONSE_STYLES = [
  { id: 'default', label: 'Default' },
  { id: 'simple', label: 'Simple' },
  { id: 'detailed', label: 'Detailed' },
  { id: 'mathematical', label: 'Mathematical' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'research', label: 'Research' },
  { id: 'visual', label: 'Visual' },
  { id: 'socratic', label: 'Socratic' }
];

/* =========================================================
   More Actions — Response refinement options
   ========================================================= */

const MORE_ACTIONS = [
  { id: 'simplify', label: 'Simplify' },
  { id: 'deepen', label: 'Deepen' },
  { id: 'quiz', label: 'Generate Quiz' },
  { id: 'diagram', label: 'Generate Diagram' },
  { id: 'lab', label: 'Generate Laboratory' },
  { id: 'flashcards', label: 'Generate Flashcards' },
  { id: 'summary', label: 'Generate Summary' },
  { id: 'visual', label: 'Visual Explanation' },
  { id: 'compare', label: 'Compare Concepts' }
];

/* =========================================================
   Quick Action Groups — Mapped to AI modes
   ========================================================= */

const QUICK_ACTIONS = [
  { id: 'explain-simply', label: 'Explain Simply', prompt: 'Explain this concept in simple terms', mode: 'beginner' },
  { id: 'explain-deeply', label: 'Explain Deeply', prompt: 'Give me a deep technical explanation', mode: 'advanced' },
  { id: 'give-analogy', label: 'Give Analogy', prompt: 'Give me an analogy for this concept', intent: 'analogy' },
  { id: 'compare', label: 'Compare', prompt: 'Compare this with related concepts', intent: 'compare' },
  { id: 'find-misconceptions', label: 'Misconceptions', prompt: 'What are common misconceptions about this?', intent: 'misconception' },
  { id: 'socratic-mode', label: 'Socratic', prompt: 'Guide me through this with questions', intent: 'socratic' },
  { id: 'connect-concepts', label: 'Connect', prompt: 'How does this connect to other concepts?', intent: 'connect' },
  { id: 'summarize', label: 'Summarize', prompt: 'Summarize this concept', intent: 'summarize' },
  { id: 'real-world', label: 'Applications', prompt: 'Where is this applied in the real world?', intent: 'application' }
];

/* =========================================================
   Markdown Renderer — Single Source of Truth
   =========================================================
   Used by every Copilot response path:
     - normal response (appendMessage)
     - educational workspace (appendEducationalResponseMessage)
     - streaming partial response (handleSubmitStreaming)
     - refusal / error / info responses
   Implementation rules:
     - HTML is escaped first (XSS-safe).
     - Fenced code blocks (```...```) are preserved verbatim.
     - Inline code (`...`) is preserved verbatim.
     - Headings (#, ##, ###) and lists (-) are preserved.
     - Bold/italic markers (** *`) are preserved.
     - Streaming output is robust to partial tokens (unmatched
       markers are not re-escaped, they remain literal).
   ========================================================= */

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMarkdown(text) {
  if (text === null || text === undefined) return '';
  if (typeof text !== 'string') text = String(text);

  const codeBlocks = [];
  const CODE_PLACEHOLDER = '\u0000NV_CODE_BLOCK_\u0000';

  // 1. Extract fenced code blocks (```lang\n...\n```) BEFORE escaping.
  //    Re-insert later, raw, wrapped in <pre><code>.
  let working = text.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (match, lang, code) => {
    const idx = codeBlocks.length;
    const language = (lang || 'text').trim();
    const safeCode = String(code).replace(/\n$/, '');
    const html =
      `<pre class="nv-md__pre" data-language="${escapeHtml(language)}">` +
      `<code class="nv-md__code">${escapeHtml(safeCode)}</code>` +
      `</pre>`;
    codeBlocks.push(html);
    return `${CODE_PLACEHOLDER}${idx}${CODE_PLACEHOLDER}`;
  });

  // 2. Escape remaining HTML to neutralize XSS.
  working = escapeHtml(working);

  // 3. Markdown patterns (post-escape, characters were not escaped).
  //    Inline code with single backticks: `code`
  working = working.replace(/`([^`\n]+?)`/g, '<code class="nv-md__inline-code">$1</code>');
  //    Bold (**text**)
  working = working.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
  //    Italic (*text*)
  working = working.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');

  // 4. Headings — only at line start, escape already done.
  working = working.replace(/^### (.+)$/gm, '<h4 class="nv-md__h4">$1</h4>');
  working = working.replace(/^## (.+)$/gm, '<h3 class="nv-md__h3">$1</h3>');
  working = working.replace(/^# (.+)$/gm, '<h2 class="nv-md__h2">$1</h2>');

  // 5. Unordered list items — group consecutive `- ` lines into one <ul>.
  working = working.replace(/(?:^- (.+)\n?)+/gm, (block) => {
    const items = block.trim().split('\n').map((line) => {
      const m = line.match(/^- (.+)$/);
      return m ? `<li class="nv-md__li">${m[1]}</li>` : '';
    }).filter(Boolean).join('');
    return items ? `<ul class="nv-md__ul">${items}</ul>` : block;
  });

  // 6. Paragraphs: double newline => paragraph break, single => <br>.
  working = working.replace(/\n{2,}/g, '</p><p class="nv-md__p">');
  working = working.replace(/\n/g, '<br>');
  working = '<p class="nv-md__p">' + working + '</p>';

  // 7. Cleanup: drop empty paragraphs and unwrap block-level elements
  //    that were prematurely wrapped in <p>.
  working = working.replace(/<p class="nv-md__p"><\/p>/g, '');
  working = working.replace(/<p class="nv-md__p">(<h[234] class="nv-md__h[234]">)/g, '$1');
  working = working.replace(/(<\/h[234]>)<\/p>/g, '$1');
  working = working.replace(/<p class="nv-md__p">(<ul class="nv-md__ul">)/g, '$1');
  working = working.replace(/(<\/ul>)<\/p>/g, '$1');
  working = working.replace(/<p class="nv-md__p">(<pre class="nv-md__pre")/g, '$1');
  working = working.replace(/(<\/pre>)<\/p>/g, '$1');

  // 8. Re-insert escaped code blocks (they were already produced as safe HTML).
  working = working.replace(new RegExp(`${CODE_PLACEHOLDER}(\\d+)${CODE_PLACEHOLDER}`, 'g'),
    (match, idx) => codeBlocks[Number(idx)] || '');

  return working;
}

function renderMarkdown(text) {
  return formatMarkdown(text);
}

function createAgentPanelController(options = {}) {
  const root = options.root || document;
  const orchestrator = options.orchestrator || window.NeuralVerse?.didacticOrchestrator;
  const contextBuilder = options.contextBuilder || window.NeuralVerse?.contextBuilder;
  const guardrails = options.guardrails || window.NeuralVerse?.agentGuardrails;

  // Initialize the runtime bridge
  let runtimeBridge = null;
  try {
    const bridgeFactory = window.NeuralVerse?.CopilotRuntimeBridge?.createCopilotRuntimeBridge;
    if (bridgeFactory) {
      runtimeBridge = bridgeFactory();
    }
  } catch (e) {
    console.warn('CopilotRuntimeBridge not available, using fallback orchestrator');
  }

  let panelElement = null;
  let isOpen = false;
  let isExpanded = false;
  let currentMode = loadPreference('mode', 'automatic');
  let currentStyle = loadPreference('style', 'default');
  let lastResult = null;
  let lastQuery = '';
  let interactionHistory = [];
  let collapsedSections = new Set(loadPreference('collapsed', []));
  let eventsBound = false;
  let isDeveloperMode = loadPreference('developer_mode', false);
  let smartSuggestions = [];

  function init() {
    injectPanelMarkup();
    if (!panelElement) return;
    if (panelElement.getAttribute('aria-hidden') !== 'false') {
      panelElement.inert = true;
      panelElement.setAttribute('inert', '');
    }
    bindEvents();
    updateSmartSuggestions();
    restoreMode();
    restoreStyle();
    updateProviderStatus();
    initLearningDashboard();
    initJumpToLatest();
    initViewModes();
    initCommandPalette();
    initKeyboardShortcuts();

    const triggerBtn = document.querySelector('#nv-agent-trigger');
    if (triggerBtn) {
      triggerBtn.setAttribute('aria-controls', 'nv-agent-panel');
      triggerBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function injectPanelMarkup() {
    const existingPanel = root.querySelector('#nv-agent-panel');
    if (existingPanel) {
      panelElement = existingPanel;
      return;
    }

    const panel = document.createElement('aside');
    panel.id = 'nv-agent-panel';
    panel.className = 'nv-copilot';
    panel.setAttribute('role', 'complementary');
    panel.setAttribute('aria-label', 'NeuralVerse AI Assistant');
    panel.setAttribute('aria-hidden', 'true');
    panel.inert = true;
    panel.setAttribute('inert', '');

    panel.innerHTML = `
      <header class="nv-copilot__header" data-copilot-header>
        <button class="nv-copilot__sidebar-toggle" data-sidebar-toggle type="button" aria-label="Open learning context" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
            <circle cx="8" cy="8" r="3"/>
            <circle cx="16" cy="16" r="3"/>
            <path d="M11 8h9"/>
            <path d="M4 16h9"/>
          </svg>
        </button>
        <div class="nv-copilot__brand">
          <span class="nv-copilot__brand-mark" aria-hidden="true"></span>
          <div class="nv-copilot__brand-text">
            <span class="nv-copilot__brand-name">NeuralVerse AI</span>
            <span class="nv-copilot__brand-subtitle">Copilot</span>
          </div>
        </div>
        <div class="nv-copilot__header-actions">
          <button class="nv-copilot__close" aria-label="Close copilot" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      <button class="nv-copilot__sidebar-backdrop" data-sidebar-backdrop type="button" aria-label="Close learning context"></button>

      <aside class="nv-copilot__sidebar" data-copilot-sidebar aria-label="Learning context">
        <section class="nv-copilot__sidebar-section nv-copilot__sidebar-section--provider" aria-label="Provider">
          <div class="nv-copilot__provider-status" data-copilot-provider-status title="Checking provider...">
            <span class="nv-copilot__provider-dot" data-copilot-provider-dot></span>
            <span class="nv-copilot__provider-label" data-copilot-provider-label>Checking...</span>
          </div>
        </section>

        <section class="nv-copilot__sidebar-section" aria-label="Current session">
          <h3 class="nv-copilot__sidebar-title">Current Session</h3>
          <ul class="nv-copilot__sidebar-list" data-sidebar-session>
            <li class="nv-copilot__sidebar-item nv-copilot__sidebar-item--empty">No active session</li>
          </ul>
        </section>

        <section class="nv-copilot__sidebar-section" aria-label="Topics studied">
          <h3 class="nv-copilot__sidebar-title">Topics Studied</h3>
          <ul class="nv-copilot__sidebar-list" data-sidebar-topics>
            <li class="nv-copilot__sidebar-item nv-copilot__sidebar-item--empty">No topics yet</li>
          </ul>
        </section>

        <section class="nv-copilot__sidebar-section" aria-label="Current goal">
          <h3 class="nv-copilot__sidebar-title">Current Goal</h3>
          <p class="nv-copilot__sidebar-value" data-sidebar-goal>Not set</p>
        </section>

        <section class="nv-copilot__sidebar-section" aria-label="Current module">
          <h3 class="nv-copilot__sidebar-title">Current Module</h3>
          <p class="nv-copilot__sidebar-value" data-sidebar-module>None</p>
        </section>

        <section class="nv-copilot__sidebar-section" aria-label="Recent concepts">
          <h3 class="nv-copilot__sidebar-title">Recent Concepts</h3>
          <ul class="nv-copilot__sidebar-list" data-sidebar-concepts>
            <li class="nv-copilot__sidebar-item nv-copilot__sidebar-item--empty">No concepts yet</li>
          </ul>
        </section>

        <section class="nv-copilot__sidebar-section" aria-label="Learning journey">
          <h3 class="nv-copilot__sidebar-title">Learning Journey</h3>
          <ul class="nv-copilot__sidebar-list" data-sidebar-journey>
            <li class="nv-copilot__sidebar-item nv-copilot__sidebar-item--empty">Start a conversation</li>
          </ul>
        </section>

        <div class="nv-copilot__sidebar-footer">
          <button class="nv-copilot__dev-toggle" data-dev-toggle type="button" aria-label="Toggle Developer Mode" title="Developer Mode">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            <span>Developer Mode</span>
          </button>
        </div>
      </aside>

      <div class="nv-copilot__context-bar" data-copilot-context>
        <span class="nv-copilot__context-label">Current Lesson</span>
        <span class="nv-copilot__context-value" data-copilot-context-value>No context loaded.</span>
        <button class="nv-copilot__context-expand" data-context-expand type="button" aria-label="Expand context details">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      <div class="nv-copilot__context-details" data-copilot-context-details style="display: none;">
        <div class="nv-copilot__context-detail-row">
          <span class="nv-copilot__context-detail-label">Path</span>
          <span class="nv-copilot__context-detail-value" data-ctx-path>—</span>
        </div>
        <div class="nv-copilot__context-detail-row">
          <span class="nv-copilot__context-detail-label">Module</span>
          <span class="nv-copilot__context-detail-value" data-ctx-module>—</span>
        </div>
        <div class="nv-copilot__context-detail-row">
          <span class="nv-copilot__context-detail-label">Lesson</span>
          <span class="nv-copilot__context-detail-value" data-ctx-lesson>—</span>
        </div>
        <div class="nv-copilot__context-detail-row">
          <span class="nv-copilot__context-detail-label">Difficulty</span>
          <span class="nv-copilot__context-detail-value" data-ctx-difficulty>—</span>
        </div>
        <div class="nv-copilot__context-detail-row">
          <span class="nv-copilot__context-detail-label">Progress</span>
          <span class="nv-copilot__context-detail-value" data-ctx-progress>—</span>
        </div>
      </div>

      <div class="nv-copilot__mode-selector">
        <button class="nv-copilot__mode-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" data-mode-trigger>
          <span class="nv-copilot__mode-icon" data-mode-icon aria-hidden="true">\u2728</span>
          <span class="nv-copilot__mode-info">
            <span class="nv-copilot__mode-label">AI Mode</span>
            <span class="nv-copilot__mode-value" data-mode-value>Automatic</span>
          </span>
          <svg class="nv-copilot__mode-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="nv-copilot__mode-dropdown" data-mode-dropdown role="listbox" aria-label="AI Modes" style="display: none;">
          ${AI_MODES.map(m => `
            <button class="nv-copilot__mode-option${m.id === currentMode ? ' nv-copilot__mode-option--active' : ''}" data-mode="${m.id}" role="option" aria-selected="${m.id === currentMode}">
              <span class="nv-copilot__mode-option-icon" aria-hidden="true">${m.icon}</span>
              <span class="nv-copilot__mode-option-info">
                <span class="nv-copilot__mode-option-name">${m.label}</span>
                <span class="nv-copilot__mode-option-desc">${m.description}</span>
              </span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="nv-copilot__messages" data-copilot-messages>
        <section class="nv-copilot__welcome" data-copilot-welcome aria-label="Welcome">
          <div class="nv-copilot__welcome-hero">
            <div class="nv-copilot__welcome-mark" aria-hidden="true"></div>
            <h2 class="nv-copilot__welcome-title">How can I help you learn today?</h2>
            <p class="nv-copilot__welcome-subtitle">Ask for an explanation, proof sketch, visual walkthrough, or lab. The answer will render as a focused study note.</p>
          </div>

          <div class="nv-copilot__welcome-categories" aria-label="Topics">
            <h3 class="nv-copilot__welcome-section-title">Start a study path</h3>
            <div class="nv-copilot__welcome-grid" data-copilot-categories>
              <button class="nv-copilot__category" type="button" data-category="Deep Learning">
                <span class="nv-copilot__category-label">Build intuition</span>
                <span class="nv-copilot__category-hint">Neural networks, backprop, optimizers</span>
              </button>
              <button class="nv-copilot__category" type="button" data-category="Computer Vision">
                <span class="nv-copilot__category-label">See a visual model</span>
                <span class="nv-copilot__category-hint">CNNs, detection, segmentation</span>
              </button>
              <button class="nv-copilot__category" type="button" data-category="Reinforcement Learning">
                <span class="nv-copilot__category-label">Explore agents</span>
                <span class="nv-copilot__category-hint">Agents, rewards, policies</span>
              </button>
              <button class="nv-copilot__category" type="button" data-category="Mathematics">
                <span class="nv-copilot__category-label">See the math</span>
                <span class="nv-copilot__category-hint">Linear algebra, calculus, probability</span>
              </button>
              <button class="nv-copilot__category" type="button" data-category="Programming">
                <span class="nv-copilot__category-label">Open a lab</span>
                <span class="nv-copilot__category-hint">Python, PyTorch, algorithms</span>
              </button>
              <button class="nv-copilot__category" type="button" data-category="Machine Learning">
                <span class="nv-copilot__category-label">Compare concepts</span>
                <span class="nv-copilot__category-hint">Classical models, evaluation</span>
              </button>
            </div>
          </div>

          <div class="nv-copilot__welcome-divider" aria-hidden="true"></div>

          <div class="nv-copilot__welcome-suggestions" aria-label="Suggested questions">
            <h3 class="nv-copilot__welcome-section-title">Focused prompts</h3>
            <div class="nv-copilot__suggestions" data-copilot-suggestions>
              ${DEFAULT_SUGGESTIONS.map(s => `
                <button class="nv-copilot__suggestion" data-suggestion="${s}" type="button">${s}</button>
              `).join('')}
            </div>
          </div>
        </section>
      </div>

      <div class="nv-copilot__response-actions" data-copilot-response-actions style="display: none;">
        <button class="nv-copilot__action-btn" data-action="copy" title="Copy response" aria-label="Copy response">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          Copy
        </button>
        <button class="nv-copilot__action-btn" data-action="regenerate" title="Regenerate" aria-label="Regenerate response">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
          Regenerate
        </button>
        <div class="nv-copilot__action-more" data-action-more>
          <button class="nv-copilot__action-btn nv-copilot__action-more-trigger" data-action="more" title="More actions" aria-haspopup="true" aria-expanded="false" aria-label="More response actions">
            More
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="nv-copilot__action-more-dropdown" data-more-dropdown style="display: none;">
            ${MORE_ACTIONS.map(a => `
              <button class="nv-copilot__action-more-item" data-action="${a.id}" type="button">${a.label}</button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="nv-copilot__style-row" data-copilot-style-row>
        <button class="nv-copilot__style-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" data-style-trigger>
          <span class="nv-copilot__style-label">Response Style</span>
          <span class="nv-copilot__style-value" data-style-value>${RESPONSE_STYLES.find(s => s.id === currentStyle)?.label || 'Default'}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="nv-copilot__style-dropdown" data-style-dropdown style="display: none;">
          ${RESPONSE_STYLES.map(s => `
            <button class="nv-copilot__style-option${s.id === currentStyle ? ' nv-copilot__style-option--active' : ''}" data-style="${s.id}" type="button">${s.label}</button>
          `).join('')}
        </div>
      </div>

      <div class="nv-copilot__input-area">
        <div class="nv-copilot__streaming-status" data-copilot-streaming-status style="display: none;">
          <span class="nv-copilot__streaming-icon" aria-hidden="true">⟳</span>
          <span class="nv-copilot__streaming-text" data-copilot-streaming-text>Understanding your question</span>
          <span class="nv-copilot__streaming-tool" data-copilot-streaming-tool></span>
        </div>
          <div class="nv-copilot__input-wrapper">
            <textarea id="nv-agent-input" class="nv-copilot__input" rows="1" placeholder="Ask about a concept..." aria-label="Ask NeuralVerse AI"></textarea>
            <button class="nv-copilot__send" data-copilot-send type="button" disabled aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true">
              <path d="M12 19V5"></path>
              <path d="M6 11l6-6 6 6"></path>
            </svg>
          </button>
          <button class="nv-copilot__stop" data-copilot-stop type="button" style="display: none;" aria-label="Stop generation">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          </button>
        </div>
        <div class="nv-copilot__input-hint">
          <span data-copilot-streaming-hint style="display: none;">Press <kbd>Esc</kbd> to stop</span>
          <span data-copilot-normal-hint><kbd>Ctrl+Enter</kbd> to send</span>
        </div>
      </div>

      <div class="nv-copilot__developer-panel" data-developer-panel style="display: none;">
        <div class="nv-copilot__dev-header">
          <span class="nv-copilot__dev-title">Developer Mode</span>
        </div>
        <div class="nv-copilot__dev-content">
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Pipeline</span>
            <span class="nv-copilot__dev-value" data-dev-pipeline>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Provider</span>
            <span class="nv-copilot__dev-value" data-dev-provider>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Model</span>
            <span class="nv-copilot__dev-value" data-dev-model>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Real LLM</span>
            <span class="nv-copilot__dev-value nv-copilot__dev-badge" data-dev-is-real-llm>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Agentic</span>
            <span class="nv-copilot__dev-value" data-dev-agentic-enabled>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Agentic Loop</span>
            <span class="nv-copilot__dev-value" data-dev-agentic-loop-loaded>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Mock/Test</span>
            <span class="nv-copilot__dev-value nv-copilot__dev-badge" data-dev-mock-used>—</span>
          </div>
          <div class="nv-copilot__dev-divider"></div>
          <div class="nv-copilot__dev-section-title">Educational Intelligence</div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Teaching Strategy</span>
            <span class="nv-copilot__dev-value" data-dev-teaching-strategy>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Learning Objective</span>
            <span class="nv-copilot__dev-value" data-dev-learning-objective style="max-width:100%;white-space:normal;font-size:0.5rem;line-height:1.4;">—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Difficulty</span>
            <span class="nv-copilot__dev-value" data-dev-difficulty>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Misconceptions</span>
            <span class="nv-copilot__dev-value" data-dev-misconceptions style="max-width:100%;white-space:normal;font-size:0.5rem;line-height:1.4;">—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Analogy Used</span>
            <span class="nv-copilot__dev-value" data-dev-analogy style="max-width:100%;white-space:normal;font-size:0.5rem;line-height:1.4;">—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Teaching Progression</span>
            <span class="nv-copilot__dev-value" data-dev-teaching-progression style="max-width:100%;white-space:normal;font-size:0.5rem;line-height:1.4;">—</span>
          </div>
          <div class="nv-copilot__dev-divider"></div>
          <div class="nv-copilot__dev-section-title">Execution</div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Iterations</span>
            <span class="nv-copilot__dev-value" data-dev-iterations>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Stopped By</span>
            <span class="nv-copilot__dev-value" data-dev-stopped-by>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Tools Used</span>
            <span class="nv-copilot__dev-value" data-dev-tools-used>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Timeline</span>
            <span class="nv-copilot__dev-value" data-dev-timeline style="max-width:100%;white-space:normal;font-size:0.5rem;line-height:1.4;">—</span>
          </div>
          <div class="nv-copilot__dev-divider"></div>
          <div class="nv-copilot__dev-section-title">Evidence</div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Evidence Count</span>
            <span class="nv-copilot__dev-value" data-dev-evidence-count>0</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Real Evidence</span>
            <span class="nv-copilot__dev-value nv-copilot__dev-badge" data-dev-is-real-evidence>No</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Evidence Quality</span>
            <span class="nv-copilot__dev-value" data-dev-evidence-quality-status>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Adapter</span>
            <span class="nv-copilot__dev-value" data-dev-adapter-status>—</span>
          </div>
          <div class="nv-copilot__dev-divider"></div>
          <div class="nv-copilot__dev-section-title">Fallback</div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Fallback Active</span>
            <span class="nv-copilot__dev-value" data-dev-fallback-active>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Fallback Reason</span>
            <span class="nv-copilot__dev-value" data-dev-fallback-reason>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Confidence</span>
            <span class="nv-copilot__dev-value" data-dev-confidence>—</span>
          </div>
          <div class="nv-copilot__dev-divider"></div>
          <div class="nv-copilot__dev-section-title">Learner Model</div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Expertise</span>
            <span class="nv-copilot__dev-value" data-dev-learner-expertise>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Math Maturity</span>
            <span class="nv-copilot__dev-value" data-dev-learner-math>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Programming</span>
            <span class="nv-copilot__dev-value" data-dev-learner-programming>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Preferred Style</span>
            <span class="nv-copilot__dev-value" data-dev-learner-style>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Mastered</span>
            <span class="nv-copilot__dev-value" data-dev-learner-mastered style="max-width:100%;white-space:normal;font-size:0.5rem;line-height:1.4;">—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Struggling</span>
            <span class="nv-copilot__dev-value" data-dev-learner-struggling style="max-width:100%;white-space:normal;font-size:0.5rem;line-height:1.4;">—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Misconceptions</span>
            <span class="nv-copilot__dev-value" data-dev-learner-misconceptions style="max-width:100%;white-space:normal;font-size:0.5rem;line-height:1.4;">—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Goals</span>
            <span class="nv-copilot__dev-value" data-dev-learner-goals style="max-width:100%;white-space:normal;font-size:0.5rem;line-height:1.4;">—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Version</span>
            <span class="nv-copilot__dev-value" data-dev-learner-version>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Update Source</span>
            <span class="nv-copilot__dev-value" data-dev-learner-update-source>—</span>
          </div>
          <div class="nv-copilot__dev-divider"></div>
          <div class="nv-copilot__dev-section-title">Knowledge Retrieval</div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Sources Retrieved</span>
            <span class="nv-copilot__dev-value" data-dev-retrieval-sources>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Evidence Count</span>
            <span class="nv-copilot__dev-value" data-dev-retrieval-count>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Compression</span>
            <span class="nv-copilot__dev-value" data-dev-retrieval-compression>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Retrieval Time</span>
            <span class="nv-copilot__dev-value" data-dev-retrieval-duration>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Categories</span>
            <span class="nv-copilot__dev-value" data-dev-retrieval-categories style="max-width:100%;white-space:normal;font-size:0.5rem;line-height:1.4;">—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">From Cache</span>
            <span class="nv-copilot__dev-value" data-dev-retrieval-cache>—</span>
          </div>
          <div class="nv-copilot__dev-divider"></div>
          <div class="nv-copilot__dev-section-title">Educational Intelligence</div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Cognitive Load</span>
            <span class="nv-copilot__dev-value" data-dev-edu-cognitive-load>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Active Misconceptions</span>
            <span class="nv-copilot__dev-value" data-dev-edu-misconceptions>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Recent Decisions</span>
            <span class="nv-copilot__dev-value" data-dev-edu-decisions style="max-width:100%;white-space:normal;font-size:0.5rem;line-height:1.4;">—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Recent Reflections</span>
            <span class="nv-copilot__dev-value" data-dev-edu-reflections style="max-width:100%;white-space:normal;font-size:0.5rem;line-height:1.4;">—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Concepts Mastered</span>
            <span class="nv-copilot__dev-value" data-dev-edu-mastered>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Concepts In Progress</span>
            <span class="nv-copilot__dev-value" data-dev-edu-in-progress>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Total Interactions</span>
            <span class="nv-copilot__dev-value" data-dev-edu-interactions>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Current Plan</span>
            <span class="nv-copilot__dev-value" data-dev-edu-plan style="max-width:100%;white-space:normal;font-size:0.5rem;line-height:1.4;">—</span>
          </div>
          <div class="nv-copilot__dev-divider"></div>
          <div class="nv-copilot__dev-section-title">System Health</div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Provider Health</span>
            <span class="nv-copilot__dev-value" data-dev-health-provider>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Retrieval Cache</span>
            <span class="nv-copilot__dev-value" data-dev-health-retrieval>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Memory</span>
            <span class="nv-copilot__dev-value" data-dev-health-memory>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Error Count</span>
            <span class="nv-copilot__dev-value" data-dev-health-errors>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Performance</span>
            <span class="nv-copilot__dev-value" data-dev-health-performance>—</span>
          </div>
          <div class="nv-copilot__dev-divider"></div>
          <div class="nv-copilot__dev-section-title">Benchmark</div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Overall Score</span>
            <span class="nv-copilot__dev-value" data-dev-benchmark-overall>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Samples</span>
            <span class="nv-copilot__dev-value" data-dev-benchmark-samples>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Pedagogical</span>
            <span class="nv-copilot__dev-value" data-dev-benchmark-pedagogical>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Technical</span>
            <span class="nv-copilot__dev-value" data-dev-benchmark-technical>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Research</span>
            <span class="nv-copilot__dev-value" data-dev-benchmark-research>—</span>
          </div>
          <div class="nv-copilot__dev-row">
            <span class="nv-copilot__dev-label">Hallucinations</span>
            <span class="nv-copilot__dev-value" data-dev-benchmark-hallucinations>—</span>
          </div>
          <div class="nv-copilot__dev-actions">
            <button class="nv-copilot__dev-btn" data-dev-test-local type="button">
              Test Local Model
            </button>
            <button class="nv-copilot__dev-btn" data-dev-toggle-agentic type="button" data-toggle-agentic>
              Toggle Agentic
            </button>
          </div>
        </div>
      </div>

      <div class="nv-copilot__guardrail-notice" data-copilot-guardrail style="display: none;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span data-copilot-guardrail-text></span>
      </div>

      <div class="nv-copilot__history">
        <button class="nv-copilot__history-toggle" type="button" aria-expanded="false" aria-controls="nv-copilot-history-list">
          Recent Conversations
          <span class="nv-copilot__history-count" data-copilot-history-count>0</span>
        </button>
        <ul id="nv-copilot-history-list" class="nv-copilot__history-list" data-copilot-history-list style="display: none;"></ul>
      </div>

      <input type="hidden" id="nv-agent-select" value="">
    `;

    document.body.appendChild(panel);
    panelElement = panel;
  }

  function bindEvents() {
    if (!panelElement) return;
    if (eventsBound) return;
    eventsBound = true;

    const closeBtn = panelElement.querySelector('.nv-copilot__close');
    const sendBtn = panelElement.querySelector('[data-copilot-send]');
    const inputEl = panelElement.querySelector('#nv-agent-input');
    const modeTrigger = panelElement.querySelector('[data-mode-trigger]');
    const modeDropdown = panelElement.querySelector('[data-mode-dropdown]');
    const styleTrigger = panelElement.querySelector('[data-style-trigger]');
    const styleDropdown = panelElement.querySelector('[data-style-dropdown]');
    const moreTrigger = panelElement.querySelector('.nv-copilot__action-more-trigger');
    const moreDropdown = panelElement.querySelector('[data-more-dropdown]');
    const historyToggle = panelElement.querySelector('.nv-copilot__history-toggle');
    const devToggle = panelElement.querySelector('[data-dev-toggle]');
    const sidebarToggle = panelElement.querySelector('[data-sidebar-toggle]');
    const sidebarBackdrop = panelElement.querySelector('[data-sidebar-backdrop]');
    const contextExpand = panelElement.querySelector('[data-context-expand]');
    const responseActions = panelElement.querySelector('[data-copilot-response-actions]');
    const suggestionsContainer = panelElement.querySelector('[data-copilot-suggestions]');

    closeBtn?.addEventListener('click', closePanel);
    sendBtn?.addEventListener('click', handleSubmit);
    historyToggle?.addEventListener('click', handleToggleHistory);
    devToggle?.addEventListener('click', handleToggleDeveloperMode);
    sidebarToggle?.addEventListener('click', toggleSidebar);
    sidebarBackdrop?.addEventListener('click', closeSidebar);
    contextExpand?.addEventListener('click', handleToggleContextDetails);

    // Test Local Model button
    const testLocalBtn = panelElement?.querySelector('[data-dev-test-local]');
    testLocalBtn?.addEventListener('click', handleTestLocalModel);

    // Mode dropdown
    modeTrigger?.addEventListener('click', () => {
      const expanded = modeTrigger.getAttribute('aria-expanded') === 'true';
      closeAllDropdowns();
      if (!expanded) {
        modeDropdown.style.display = 'block';
        modeTrigger.setAttribute('aria-expanded', 'true');
      }
    });

    modeDropdown?.addEventListener('click', (e) => {
      const option = e.target.closest('[data-mode]');
      if (!option) return;
      currentMode = option.dataset.mode;
      savePreference('mode', currentMode);
      const mode = AI_MODES.find(m => m.id === currentMode);
      const modeValue = panelElement.querySelector('[data-mode-value]');
      const modeIcon = panelElement.querySelector('[data-mode-icon]');
      if (modeValue) modeValue.textContent = mode ? mode.label : 'Automatic';
      if (modeIcon) modeIcon.textContent = mode ? mode.icon : '\u2728';
      modeDropdown.querySelectorAll('.nv-copilot__mode-option').forEach(o => {
        o.classList.toggle('nv-copilot__mode-option--active', o.dataset.mode === currentMode);
        o.setAttribute('aria-selected', o.dataset.mode === currentMode);
      });
      modeDropdown.style.display = 'none';
      modeTrigger.setAttribute('aria-expanded', 'false');
      updateSmartSuggestions();
    });

    // Style dropdown
    styleTrigger?.addEventListener('click', () => {
      const expanded = styleTrigger.getAttribute('aria-expanded') === 'true';
      closeAllDropdowns();
      if (!expanded) {
        styleDropdown.style.display = 'block';
        styleTrigger.setAttribute('aria-expanded', 'true');
      }
    });

    styleDropdown?.addEventListener('click', (e) => {
      const option = e.target.closest('[data-style]');
      if (!option) return;
      currentStyle = option.dataset.style;
      savePreference('style', currentStyle);
      const style = RESPONSE_STYLES.find(s => s.id === currentStyle);
      const styleValue = panelElement.querySelector('[data-style-value]');
      if (styleValue) styleValue.textContent = style ? style.label : 'Default';
      styleDropdown.querySelectorAll('.nv-copilot__style-option').forEach(o => {
        o.classList.toggle('nv-copilot__style-option--active', o.dataset.style === currentStyle);
      });
      styleDropdown.style.display = 'none';
      styleTrigger.setAttribute('aria-expanded', 'false');
    });

    // More actions dropdown
    moreTrigger?.addEventListener('click', () => {
      const expanded = moreTrigger.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        moreDropdown.style.display = 'none';
        moreTrigger.setAttribute('aria-expanded', 'false');
      } else {
        moreDropdown.style.display = 'block';
        moreTrigger.setAttribute('aria-expanded', 'true');
      }
    });

    moreDropdown?.addEventListener('click', (e) => {
      const item = e.target.closest('.nv-copilot__action-more-item');
      if (!item) return;
      handleResponseAction(item.dataset.action);
      moreDropdown.style.display = 'none';
      moreTrigger.setAttribute('aria-expanded', 'false');
    });

    // Response actions
    responseActions?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'more') return;
      handleResponseAction(btn.dataset.action);
    });

    // Suggestions
    suggestionsContainer?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-suggestion]');
      if (!btn) return;
      const inputEl = panelElement?.querySelector('#nv-agent-input');
      if (inputEl) {
        inputEl.value = btn.dataset.suggestion;
        inputEl.dispatchEvent(new Event('input'));
        inputEl.focus();
      }
    });

    // Input events
    inputEl?.addEventListener('input', () => {
      const hasText = inputEl.value.trim().length > 0;
      if (sendBtn) sendBtn.disabled = !hasText;
      autoResizeTextarea(inputEl);
    });

    inputEl?.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    });

    // Close dropdowns on outside click
    function closeAllDropdowns() {
      if (modeDropdown) modeDropdown.style.display = 'none';
      if (modeTrigger) modeTrigger.setAttribute('aria-expanded', 'false');
      if (styleDropdown) styleDropdown.style.display = 'none';
      if (styleTrigger) styleTrigger.setAttribute('aria-expanded', 'false');
      if (moreDropdown) moreDropdown.style.display = 'none';
      if (moreTrigger) moreTrigger.setAttribute('aria-expanded', 'false');
    }

    document.addEventListener('click', (e) => {
      if (!panelElement?.contains(e.target)) {
        closeAllDropdowns();
        return;
      }
      const isModeTrigger = e.target.closest('[data-mode-trigger]');
      const isModeDropdown = e.target.closest('[data-mode-dropdown]');
      const isStyleTrigger = e.target.closest('[data-style-trigger]');
      const isStyleDropdown = e.target.closest('[data-style-dropdown]');
      const isMoreTrigger = e.target.closest('.nv-copilot__action-more-trigger');
      const isMoreDropdown = e.target.closest('[data-more-dropdown]');
      if (!isModeTrigger && !isModeDropdown && !isStyleTrigger && !isStyleDropdown && !isMoreTrigger && !isMoreDropdown) {
        closeAllDropdowns();
      }
    });

    // Escape closes panel
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (panelElement?.classList.contains('nv-copilot--sidebar-open')) {
          closeSidebar();
          return;
        }
        closePanel();
      }
    });

    // History item clicks
    const historyList = panelElement.querySelector('[data-copilot-history-list]');
    historyList?.addEventListener('click', (e) => {
      const item = e.target.closest('.nv-copilot__history-item');
      if (!item) return;
      const query = item.dataset.query;
      const inputEl = panelElement?.querySelector('#nv-agent-input');
      if (inputEl && query) {
        inputEl.value = query;
        inputEl.dispatchEvent(new Event('input'));
      }
    });
  }

  function autoResizeTextarea(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  function updateSmartSuggestions() {
    const container = panelElement?.querySelector('[data-copilot-suggestions]');
    if (!container) return;

    const currentPath = window.location?.hash || '';
    let contextKey = 'workspace';

    if (currentPath.includes('laboratory')) contextKey = 'laboratory';
    else if (currentPath.includes('research') || currentPath.includes('semantic')) contextKey = 'research';
    else if (currentPath.includes('assessment') || currentPath.includes('quiz')) contextKey = 'assessment';
    else if (currentPath.includes('learning')) contextKey = 'learning';

    const suggestions = CONTEXT_SUGGESTIONS[contextKey] || DEFAULT_SUGGESTIONS;
    smartSuggestions = suggestions;

    container.innerHTML = suggestions.map(s => `
      <button class="nv-copilot__suggestion" data-suggestion="${escapeHtml(s)}" type="button">${escapeHtml(s)}</button>
    `).join('');
  }

  function updateContextDisplay() {
    if (!panelElement || !contextBuilder) return;
    const contextValueEl = panelElement.querySelector('[data-copilot-context-value]');
    if (!contextValueEl) return;

    const context = contextBuilder.buildContext();
    const summary = context.summary || '';
    const parts = summary.split(' > ').map(s => s.trim()).filter(Boolean);

    if (parts.length > 0) {
      contextValueEl.textContent = parts[parts.length - 1];
    } else {
      contextValueEl.textContent = 'No context loaded.';
    }

    // Update detailed context
    const pathEl = panelElement.querySelector('[data-ctx-path]');
    const moduleEl = panelElement.querySelector('[data-ctx-module]');
    const lessonEl = panelElement.querySelector('[data-ctx-lesson]');
    const difficultyEl = panelElement.querySelector('[data-ctx-difficulty]');
    const progressEl = panelElement.querySelector('[data-ctx-progress]');

    if (pathEl) pathEl.textContent = parts[0] || '—';
    if (moduleEl) moduleEl.textContent = parts[1] || '—';
    if (lessonEl) lessonEl.textContent = parts[2] || '—';
    if (difficultyEl) difficultyEl.textContent = context.difficulty || '—';
    if (progressEl) progressEl.textContent = context.progress || '—';
  }

  function handleToggleContextDetails() {
    const details = panelElement?.querySelector('[data-copilot-context-details]');
    const expandBtn = panelElement?.querySelector('[data-context-expand]');
    if (!details || !expandBtn) return;

    const isHidden = details.style.display === 'none';
    details.style.display = isHidden ? 'block' : 'none';
    expandBtn.querySelector('svg').style.transform = isHidden ? 'rotate(180deg)' : '';
  }

  function handleToggleDeveloperMode() {
    isDeveloperMode = !isDeveloperMode;
    savePreference('developer_mode', isDeveloperMode);
    const devPanel = panelElement?.querySelector('[data-developer-panel]');
    const devToggle = panelElement?.querySelector('[data-dev-toggle]');
    if (devPanel) devPanel.style.display = isDeveloperMode ? 'block' : 'none';
    if (devToggle) devToggle.classList.toggle('nv-copilot__dev-toggle--active', isDeveloperMode);
  }

  async function handleTestLocalModel() {
    if (!runtimeBridge) return;

    const statusEl = panelElement?.querySelector('[data-dev-local-status]');
    const testBtn = panelElement?.querySelector('[data-dev-test-local]');

    if (statusEl) statusEl.textContent = 'Checking...';
    if (testBtn) testBtn.disabled = true;

    try {
      const result = await runtimeBridge.checkLocalProvider();
      const status = result.status || 'unknown';

      if (statusEl) {
        statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
        statusEl.dataset.status = status;
      }

      // Update provider info
      const providerEl = panelElement?.querySelector('[data-dev-provider]');
      const modelEl = panelElement?.querySelector('[data-dev-model]');
      const endpointEl = panelElement?.querySelector('[data-dev-endpoint]');
      const fallbackEl = panelElement?.querySelector('[data-dev-fallback]');

      const providerStatus = runtimeBridge.getProviderStatus();
      if (providerEl) providerEl.textContent = providerStatus.provider;
      if (modelEl) modelEl.textContent = providerStatus.model;
      if (endpointEl) endpointEl.textContent = providerStatus.endpoint;
      if (fallbackEl) fallbackEl.textContent = providerStatus.fallback;

    } catch (error) {
      if (statusEl) {
        statusEl.textContent = 'Offline';
        statusEl.dataset.status = 'offline';
      }
    }

    if (testBtn) testBtn.disabled = false;
  }

  function restoreMode() {
    const mode = AI_MODES.find(m => m.id === currentMode);
    const modeValue = panelElement?.querySelector('[data-mode-value]');
    const modeIcon = panelElement?.querySelector('[data-mode-icon]');
    if (modeValue) modeValue.textContent = mode ? mode.label : 'Automatic';
    if (modeIcon) modeIcon.textContent = mode ? mode.icon : '\u2728';
  }

  function restoreStyle() {
    const style = RESPONSE_STYLES.find(s => s.id === currentStyle);
    const styleValue = panelElement?.querySelector('[data-style-value]');
    if (styleValue) styleValue.textContent = style ? style.label : 'Default';
  }

  async function updateProviderStatus() {
    if (!runtimeBridge) return;

    const dotEl = panelElement?.querySelector('[data-copilot-provider-dot]');
    const labelEl = panelElement?.querySelector('[data-copilot-provider-label]');
    const statusEl = panelElement?.querySelector('[data-copilot-provider-status]');

    try {
      const status = await runtimeBridge.getProviderStatus();
      const isRealLLM = status.isRealLLM;
      const isAgentic = status.isAgentic;
      const mockUsed = status.mockUsed;
      const agenticLoopLoaded = status.agenticLoopLoaded;

      if (dotEl) {
        dotEl.className = 'nv-copilot__provider-dot';
        if (isRealLLM && isAgentic) {
          dotEl.classList.add('nv-copilot__provider-dot--online');
          if (statusEl) statusEl.title = 'Local AI active — Agentic mode';
        } else if (mockUsed && isAgentic) {
          dotEl.classList.add('nv-copilot__provider-dot--warning');
          if (statusEl) statusEl.title = 'Local model unavailable — Fallback/test mode';
        } else if (status.localAvailable && !status.localModelInstalled) {
          dotEl.classList.add('nv-copilot__provider-dot--warning');
          if (statusEl) statusEl.title = 'Local LLM available but model not installed — Fallback';
        } else {
          dotEl.classList.add('nv-copilot__provider-dot--offline');
          if (statusEl) statusEl.title = 'Local model unavailable — Using fallback';
        }
      }

      if (labelEl) {
        if (isRealLLM && isAgentic) {
          labelEl.textContent = 'Local AI active';
        } else if (mockUsed && agenticLoopLoaded) {
          labelEl.textContent = 'Fallback/test mode';
        } else if (mockUsed) {
          labelEl.textContent = 'Unavailable';
        } else {
          labelEl.textContent = 'Offline';
        }
      }
    } catch {
      if (dotEl) {
        dotEl.className = 'nv-copilot__provider-dot nv-copilot__provider-dot--offline';
      }
      if (labelEl) {
        labelEl.textContent = 'Unknown';
      }
    }
  }

  async function handleSubmit() {
    const inputEl = panelElement?.querySelector('#nv-agent-input');
    const sendBtn = panelElement?.querySelector('[data-copilot-send]');
    const stopBtn = panelElement?.querySelector('[data-copilot-stop]');
    const streamingStatus = panelElement?.querySelector('[data-copilot-streaming-status]');
    const streamingText = panelElement?.querySelector('[data-copilot-streaming-text]');
    const streamingTool = panelElement?.querySelector('[data-copilot-streaming-tool]');
    const streamingHint = panelElement?.querySelector('[data-copilot-streaming-hint]');
    const normalHint = panelElement?.querySelector('[data-copilot-normal-hint]');
    const messagesContainer = panelElement?.querySelector('[data-copilot-messages]');
    const responseActions = panelElement?.querySelector('[data-copilot-response-actions]');
    const reasoningEl = panelElement?.querySelector('[data-dev-reasoning]');
    const agentsEl = panelElement?.querySelector('[data-dev-agents]');

    const query = inputEl?.value?.trim();
    if (!query) return;

    lastQuery = query;

    // Determine which agent to use based on mode
    const mode = AI_MODES.find(m => m.id === currentMode);
    const agentId = mode?.agents ? mode.agents[0] : null;

    if (sendBtn) sendBtn.disabled = true;
    if (inputEl) {
      inputEl.value = '';
      autoResizeTextarea(inputEl);
    }

    // Add user message
    appendMessage('user', query);

    // Hide suggestions after first message
    const welcomeEl = messagesContainer?.querySelector('.nv-copilot__welcome');
    if (welcomeEl) welcomeEl.style.display = 'none';
    if (responseActions) responseActions.style.display = 'none';

    // Check if streaming is available
    const agenticEnabled = typeof window !== 'undefined' && window.NeuralVerse?.CopilotRuntimeBridge?.isAgenticEnabled?.();
    const hasStreaming = runtimeBridge && typeof runtimeBridge.sendMessageStream === 'function';

    if (agenticEnabled && hasStreaming) {
      // STREAMING PATH
      await handleSubmitStreaming({
        query, agentId, inputEl, sendBtn, stopBtn,
        streamingStatus, streamingText, streamingTool,
        streamingHint, normalHint, messagesContainer,
        responseActions, reasoningEl, agentsEl
      });
    } else {
      // NON-STREAMING PATH
      await handleSubmitSync({
        query, agentId, inputEl, sendBtn,
        messagesContainer, responseActions,
        reasoningEl, agentsEl
      });
    }
  }

  async function handleSubmitStreaming(deps) {
    const { query, agentId, inputEl, sendBtn, stopBtn,
      streamingStatus, streamingText, streamingTool,
      streamingHint, normalHint, messagesContainer,
      responseActions, reasoningEl, agentsEl } = deps;

    let streamingMessageEl = null;
    let accumulatedContent = '';

    // Show streaming UI
    if (streamingStatus) streamingStatus.style.display = 'flex';
    if (streamingHint) streamingHint.style.display = 'inline';
    if (normalHint) normalHint.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'flex';

    // Create streaming message element
    if (messagesContainer) {
      streamingMessageEl = document.createElement('div');
      streamingMessageEl.className = 'nv-copilot__message nv-copilot__message--assistant nv-copilot__message--streaming';
      const bubble = document.createElement('div');
      bubble.className = 'nv-copilot__bubble nv-copilot__bubble--streaming';
      bubble.innerHTML = '<span class="nv-copilot__streaming-cursor"></span>';
      streamingMessageEl.appendChild(bubble);
      messagesContainer.appendChild(streamingMessageEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Stop handler
    let stopped = false;
    const handleStop = () => {
      stopped = true;
      runtimeBridge.abortStream?.();
    };
    if (stopBtn) {
      stopBtn.onclick = handleStop;
      stopBtn.style.display = 'flex';
    }
    // Escape key stops
    const handleEscape = (e) => {
      if (e.key === 'Escape' && runtimeBridge.isStreaming?.()) {
        handleStop();
      }
    };
    document.addEventListener('keydown', handleEscape);

    try {
      const result = await runtimeBridge.sendMessageStream({
        message: query,
        mode: currentMode,
        style: currentStyle,
        route: window.location?.hash || '',
        currentLesson: contextBuilder?.buildContext()?.currentLesson,
        currentModule: contextBuilder?.buildContext()?.currentModule,
        currentPath: contextBuilder?.buildContext()?.currentPath,
        developerMode: isDeveloperMode
      }, {
        onStatus: (status, toolName) => {
          if (streamingText) {
            const statusMap = {
              'thinking': 'Understanding your question',
              'planning': 'Building explanation',
              'consulting': `Consulting ${toolName || 'agent'}...`,
              'synthesizing': 'Organizing concepts',
              'preparing': 'Preparing examples',
              'finalizing': 'Finalizing response',
              'complete': 'Complete'
            };
            streamingText.textContent = statusMap[status] || status;
          }
          if (streamingTool && toolName) {
            const toolNameMap = {
              'query_didactic_architecture': 'Analyzing pedagogy',
              'query_curriculum_dependency': 'Finding prerequisites',
              'query_visual_interactive_media': 'Generating visualization',
              'query_code_simulation_laboratory': 'Preparing laboratory',
              'query_research_state_of_art': 'Checking research',
              'query_application_professional_transfer': 'Finding applications',
              'query_assessment_reinforcement': 'Preparing assessment',
              'query_obsidian_knowledge_governance': 'Mapping knowledge connections',
              'query_storytelling_learning_journey': 'Finding narrative context',
              'query_curiosity_engagement': 'Exploring connections'
            };
            streamingTool.textContent = toolNameMap[toolName] || toolName;
          }
        },
        onText: (delta, accumulated) => {
          accumulatedContent = accumulated;
          if (streamingMessageEl) {
            const bubble = streamingMessageEl.querySelector('.nv-copilot__bubble');
            if (bubble) {
              bubble.innerHTML = renderMarkdown(accumulated) + '<span class="nv-copilot__streaming-cursor"></span>';
            }
          }
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        },
        onToolStart: (tool) => {
          if (streamingTool) streamingTool.textContent = tool;
        },
        onToolEnd: (tool) => {
          if (streamingTool) streamingTool.textContent = '';
        },
        onTimelineUpdate: (timeline) => {
          if (isDeveloperMode) {
            updateDeveloperMetadata({
              timeline,
              pipeline: 'agentic',
              toolsUsed: [...new Set(timeline.filter(t => t.toolName).map(t => t.toolName))],
              evidenceCount: timeline.filter(t => t.type === 'tool_result').length
            });
          }
        },
        onComplete: (result) => {
          // Replace streaming message with final response
          if (streamingMessageEl) {
            streamingMessageEl.remove();
            streamingMessageEl = null;
          }

          lastResult = result;
          if (result?.type === 'success' && result?.content) {
            appendMessage('assistant', result.content);
            if (responseActions) responseActions.style.display = 'flex';
          } else if (result?.content) {
            appendMessage('assistant', result.content);
            if (responseActions) responseActions.style.display = 'flex';
          } else {
            appendMessage('assistant', 'No response content was produced. Please try again.', 'error');
          }

          if (isDeveloperMode && result?.developerMetadata) {
            if (agentsEl) agentsEl.textContent = result.developerMetadata.selectedAgents?.join(', ') || agentId || 'auto';
            if (reasoningEl) reasoningEl.textContent = result.developerMetadata.intents?.join(', ') || '—';
            updateDeveloperMetadata(result.developerMetadata);
          }

          interactionHistory.push({ agentId: agentId || 'auto', query, result, timestamp: new Date().toISOString() });
        },
        onError: (error) => {
          if (streamingMessageEl) streamingMessageEl.remove();
          appendMessage('assistant', `Error: ${error.message || 'Streaming failed'}`, 'error');
        },
        onAbort: () => {
          if (streamingMessageEl && accumulatedContent) {
            // Keep partial response
            const bubble = streamingMessageEl.querySelector('.nv-copilot__bubble');
            if (bubble) bubble.innerHTML = renderMarkdown(accumulatedContent);
            streamingMessageEl.classList.remove('nv-copilot__message--streaming');
          }
          appendMessage('assistant', '[Generation stopped]', 'info');
        }
      });
    } catch (e) {
      if (streamingMessageEl) streamingMessageEl.remove();
      appendMessage('assistant', `Error: ${e.message}`, 'error');
    } finally {
      document.removeEventListener('keydown', handleEscape);
      if (streamingStatus) streamingStatus.style.display = 'none';
      if (streamingHint) streamingHint.style.display = 'none';
      if (normalHint) normalHint.style.display = 'inline';
      if (stopBtn) { stopBtn.style.display = 'none'; stopBtn.onclick = null; }
      if (sendBtn) sendBtn.disabled = false;
      if (inputEl) inputEl.focus();
    }
  }

  async function handleSubmitSync(deps) {
    const { query, agentId, inputEl, sendBtn,
      messagesContainer, responseActions,
      reasoningEl, agentsEl } = deps;

    const options = {};
    if (currentStyle !== 'default') {
      options.mode = currentStyle;
    }

    // Show typing indicator
    const typingId = appendTypingIndicator();

    try {
      let result;

      if (runtimeBridge) {
        result = await runtimeBridge.sendMessage({
          message: query,
          mode: currentMode,
          style: currentStyle,
          route: window.location?.hash || '',
          currentLesson: contextBuilder?.buildContext()?.currentLesson,
          currentModule: contextBuilder?.buildContext()?.currentModule,
          currentPath: contextBuilder?.buildContext()?.currentPath,
          developerMode: isDeveloperMode
        });
      } else {
        result = await orchestrator?.invokeAgent(agentId || 'didactic-architecture', query, options);
      }

      removeTypingIndicator(typingId);

      if (result?.type === 'governed-refusal') {
        showGuardrailNotice(result.reason || result.notice);
        appendMessage('assistant', `I'm sorry, but I can't help with that request. ${result.reason || 'This request violates governance rules.'}`, 'refusal');
      } else if (result?.type === 'error') {
        appendMessage('assistant', result.content || 'An error occurred. Please try again.', 'error');
      } else if (result?.type === 'clarification') {
        appendClarificationMessage(result);
      } else if (result?.type === 'success' && result?.educationalResponse) {
        lastResult = result;
        appendEducationalResponseMessage(result);
        if (responseActions) responseActions.style.display = 'flex';
      } else if (result?.sections && Array.isArray(result.sections)) {
        lastResult = result;
        appendStructuredMessage(result);
        if (responseActions) responseActions.style.display = 'flex';
      } else {
        lastResult = result;
        const safeResult = result || {};
        appendMessage('assistant', safeResult.content || 'No response content was produced.');
        if (responseActions) responseActions.style.display = 'flex';
      }

      if (isDeveloperMode) {
        const devMetadata = result?.developerMetadata || {};
        if (agentsEl) agentsEl.textContent = devMetadata.selectedAgents?.join(', ') || agentId || 'auto';
        if (reasoningEl) reasoningEl.textContent = devMetadata.intents?.join(', ') || result?.reasoningStrategy || '—';
        updateDeveloperMetadata(devMetadata);
      }

      // Update learning journey and session timeline
      const learnerModel = result?.developerMetadata?.learnerModel;
      updateLearningJourney(result, learnerModel);
      addSessionActivity('explanation', query.substring(0, 60) + (query.length > 60 ? '...' : ''));

      interactionHistory.push({ agentId: agentId || 'auto', query, result, timestamp: new Date().toISOString() });

      updateHistoryCount();
    } catch (error) {
      removeTypingIndicator(typingId);
      appendMessage('assistant', getProfessionalErrorMessage(error), 'error');
    }

    if (sendBtn) sendBtn.disabled = false;
    if (inputEl) inputEl.focus();
  }

  function appendMessage(role, content, type) {
    const messagesContainer = panelElement?.querySelector('[data-copilot-messages]');
    if (!messagesContainer) return;

    if (role === 'user') {
      appendUserQuery(content);
      return;
    }

    appendAssistantDocument(content, type);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function appendUserQuery(content) {
    const messagesContainer = panelElement?.querySelector('[data-copilot-messages]');
    if (!messagesContainer) return;

    const query = document.createElement('div');
    query.className = 'nv-copilot__query';
    query.setAttribute('data-copilot-query', '');

    const label = document.createElement('span');
    label.className = 'nv-copilot__query-label';
    label.textContent = 'Your question';

    const body = document.createElement('p');
    body.className = 'nv-copilot__query-body';
    body.textContent = content;

    query.appendChild(label);
    query.appendChild(body);
    messagesContainer.appendChild(query);
  }

  function appendAssistantDocument(content, type) {
    const messagesContainer = panelElement?.querySelector('[data-copilot-messages]');
    if (!messagesContainer) return;

    const doc = document.createElement('article');
    doc.className = 'nv-doc';
    if (type === 'refusal') doc.classList.add('nv-doc--refusal');
    if (type === 'error') doc.classList.add('nv-doc--error');
    if (type === 'info') doc.classList.add('nv-doc--info');

    const header = document.createElement('header');
    header.className = 'nv-doc__header';

    const typeEl = document.createElement('span');
    typeEl.className = 'nv-doc__kind';
    typeEl.textContent = type === 'error' ? 'Notice'
      : type === 'refusal' ? 'Governance'
      : type === 'info' ? 'Notice'
      : 'Didactic Explanation';
    header.appendChild(typeEl);

    const title = document.createElement('h2');
    title.className = 'nv-doc__title';
    title.textContent = deriveDocumentTitle(content, type);
    header.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'nv-doc__meta';
    const reading = estimateReadingTime(content);
    const difficulty = document.createElement('span');
    difficulty.className = 'nv-doc__meta-item nv-doc__meta-item--muted';
    difficulty.textContent = 'Reading time';
    const readingValue = document.createElement('span');
    readingValue.className = 'nv-doc__meta-item nv-doc__meta-value';
    readingValue.textContent = `~ ${reading} min`;
    meta.appendChild(difficulty);
    meta.appendChild(readingValue);
    header.appendChild(meta);

    const body = document.createElement('div');
    body.className = 'nv-doc__body';
    if (content) body.innerHTML = renderMarkdown(content);

    const footer = document.createElement('footer');
    footer.className = 'nv-doc__footer';
    const actions = document.createElement('div');
    actions.className = 'nv-doc__actions';
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'nv-doc__action';
    copyBtn.setAttribute('data-doc-action', 'copy');
    copyBtn.setAttribute('aria-label', 'Copy document');
    copyBtn.textContent = 'Copy';
    actions.appendChild(copyBtn);
    const regenerateBtn = document.createElement('button');
    regenerateBtn.type = 'button';
    regenerateBtn.className = 'nv-doc__action';
    regenerateBtn.setAttribute('data-doc-action', 'regenerate');
    regenerateBtn.setAttribute('aria-label', 'Regenerate response');
    regenerateBtn.textContent = 'Regenerate';
    actions.appendChild(regenerateBtn);
    footer.appendChild(actions);

    doc.appendChild(header);
    doc.appendChild(body);
    doc.appendChild(footer);
    messagesContainer.appendChild(doc);

    enhanceCodeBlocks(doc);
    appendContextualRecommendations(doc, content);

    copyBtn.addEventListener('click', () => copyDocumentContent(doc));
    regenerateBtn.addEventListener('click', () => {
      if (lastQuery) {
        const input = panelElement?.querySelector('#nv-agent-input');
        const sendBtn = panelElement?.querySelector('[data-copilot-send]');
        if (input && sendBtn) {
          input.value = lastQuery;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          sendBtn.click();
        }
      }
    });
  }

  function deriveDocumentTitle(content, type) {
    if (!content) return 'Response';
    if (type === 'error' || type === 'refusal' || type === 'info') return 'Response';
    const firstLine = String(content).split('\n').find((line) => line.trim().length > 0) || '';
    const cleaned = firstLine
      .replace(/^#+\s*/, '')
      .replace(/^[-*]\s*/, '')
      .replace(/^>\s*/, '')
      .replace(/[*_`]/g, '')
      .trim();
    if (cleaned.length > 0 && cleaned.length <= 80) return cleaned;
    if (cleaned.length > 80) return cleaned.slice(0, 77).trim() + '…';
    return 'Response';
  }

  function estimateReadingTime(content) {
    if (!content) return 1;
    const words = String(content).trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return minutes;
  }

  function copyDocumentContent(doc) {
    const body = doc.querySelector('.nv-doc__body');
    if (!body) return;
    const text = body.innerText || body.textContent || '';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  /* =========================================================
     M12 Phase 2 — Code Block UX (toolbar, language badge,
     copy, expand/collapse, max-height)
     ========================================================= */

  function enhanceCodeBlocks(doc) {
    const pres = doc.querySelectorAll('.nv-doc__body .nv-md__pre');
    if (!pres.length) return;

    pres.forEach((pre) => {
      if (pre.dataset.nvEnhanced === '1') return;
      pre.dataset.nvEnhanced = '1';

      const code = pre.querySelector('code');
      const rawLanguage = (pre.getAttribute('data-language') || (code?.className?.match(/language-([\w-]+)/)?.[1]) || 'text').toLowerCase();
      const lineCount = (code?.textContent || '').split('\n').length;
      const shouldCollapse = lineCount > 14;

      if (shouldCollapse) {
        pre.classList.add('nv-md__pre--collapsed');
      }

      const toolbar = document.createElement('div');
      toolbar.className = 'nv-md__code-toolbar';

      const lang = document.createElement('span');
      lang.className = 'nv-md__code-language';
      lang.textContent = rawLanguage;
      toolbar.appendChild(lang);

      const actions = document.createElement('div');
      actions.className = 'nv-md__code-actions';

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'nv-md__code-btn';
      copyBtn.setAttribute('aria-label', 'Copy code');
      copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg><span>Copy</span>';
      copyBtn.addEventListener('click', () => {
        const text = code?.textContent || pre.textContent || '';
        if (navigator?.clipboard?.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            copyBtn.dataset.state = 'copied';
            copyBtn.querySelector('span').textContent = 'Copied';
            setTimeout(() => {
              delete copyBtn.dataset.state;
              copyBtn.querySelector('span').textContent = 'Copy';
            }, 1600);
          }).catch(() => {});
        }
      });
      actions.appendChild(copyBtn);

      if (shouldCollapse) {
        const expandBtn = document.createElement('button');
        expandBtn.type = 'button';
        expandBtn.className = 'nv-md__code-btn';
        expandBtn.setAttribute('aria-label', 'Expand code block');
        expandBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg><span>Expand</span>';
        expandBtn.addEventListener('click', () => {
          const expanded = pre.classList.toggle('nv-md__pre--expanded');
          pre.classList.toggle('nv-md__pre--collapsed', !expanded);
          expandBtn.querySelector('span').textContent = expanded ? 'Collapse' : 'Expand';
          expandBtn.setAttribute('aria-label', expanded ? 'Collapse code block' : 'Expand code block');
        });
        actions.appendChild(expandBtn);
      }

      toolbar.appendChild(actions);
      pre.parentNode?.insertBefore(toolbar, pre);
    });
  }

  /* =========================================================
     M12 Phase 2 — Contextual Recommendations
     Depend on response content. Not generic.
     ========================================================= */

  const REC_LIBRARY = [
    { id: 'math-derivation', label: 'See mathematical derivation', match: (t) => /\\(.*\\)|equation|formula|derivation|theorem|gradient|matrix|vector/i.test(t) },
    { id: 'math-proof', label: 'Visual proof', match: (t) => /geometry|topology|manifold|surface|plane/i.test(t) },
    { id: 'math-practice', label: 'Practice derivation', match: (t) => /derivative|integral|sum|product|chain rule/i.test(t) },

    { id: 'code-view', label: 'View implementation', match: (t) => /```/.test(t) || /\b(function|class|method|api|interface|implementation)\b/i.test(t) },
    { id: 'code-modify', label: 'Modify example', match: (t) => /```/.test(t) || /\bexample|snippet|hello world\b/i.test(t) },
    { id: 'code-practice', label: 'Practice coding', match: (t) => /\b(exercise|challenge|implement|build|write a function)\b/i.test(t) },

    { id: 'ai-visual', label: 'Visual explanation', match: (t) => /\b(neural network|architecture|transformer|cnn|rnn|lstm|attention)\b/i.test(t) },
    { id: 'ai-interactive', label: 'Interactive simulation', match: (t) => /\b(training|inference|gradient|backpropagation|forward pass)\b/i.test(t) },
    { id: 'ai-related', label: 'Related architectures', match: (t) => /\b(model|network|layer|encoder|decoder)\b/i.test(t) },

    { id: 'research-paper', label: 'Read seminal paper', match: (t) => /\b(paper|study|research|landmark|attention is all you need)\b/i.test(t) },
    { id: 'research-compare', label: 'Compare approaches', match: (t) => /\b(vs|versus|compared|difference|alternative)\b/i.test(t) },
    { id: 'research-recent', label: 'Recent advances', match: (t) => /\b(state of the art|sota|recent|2024|2025|2026|advances|frontier)\b/i.test(t) },

    { id: 'analogy', label: 'See an analogy', match: (t) => /\b(like|analogy|imagine|think of|similar to)\b/i.test(t) },
    { id: 'misconceptions', label: 'Common misconceptions', match: (t) => /\b(common mistake|misconception|wrong|incorrect|fallacy)\b/i.test(t) },
    { id: 'applications', label: 'Real-world applications', match: (t) => /\b(application|used in|industry|production|real-world|deploy)\b/i.test(t) },
    { id: 'visual-explanation', label: 'Visual explanation', match: (t) => /\b(diagram|chart|graph|plot|visualize|illustration|figure)\b/i.test(t) },
  ];

  const REC_ICONS = {
    'math-derivation': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16v6H4z"/><path d="M4 14h16v6H4z"/></svg>',
    'math-proof': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>',
    'math-practice': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4z"/></svg>',
    'code-view': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    'code-modify': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4z"/></svg>',
    'code-practice': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    'ai-visual': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>',
    'ai-interactive': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>',
    'ai-related': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    'research-paper': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    'research-compare': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 3h5v5M21 8L13 16M8 21H3v-5M3 16l8-8"/></svg>',
    'research-recent': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    'analogy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 3-2 5-3 6-.5.5-1 1.5-1 2.5H9c0-1-.5-2-1-2.5-1-1-3-3-3-6a7 7 0 017-7z"/></svg>',
    'misconceptions': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    'applications': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    'visual-explanation': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  };

  function appendContextualRecommendations(doc, content) {
    if (!content || content.length < 40) return;
    const text = content;
    const matched = REC_LIBRARY.filter(rec => rec.match(text)).slice(0, 5);
    if (matched.length === 0) return;

    const wrap = document.createElement('section');
    wrap.className = 'nv-recs';
    wrap.setAttribute('aria-label', 'Contextual recommendations');

    const title = document.createElement('h4');
    title.className = 'nv-recs__title';
    title.textContent = 'Continue exploring';
    wrap.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'nv-recs__list';
    matched.forEach(rec => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nv-rec';
      btn.innerHTML = `<span class="nv-rec__icon">${REC_ICONS[rec.id] || ''}</span><span>${escapeHtml(rec.label)}</span>`;
      btn.addEventListener('click', () => {
        const input = panelElement?.querySelector('#nv-agent-input');
        const sendBtn = panelElement?.querySelector('[data-copilot-send]');
        if (input && sendBtn) {
          input.value = rec.label;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          sendBtn.click();
        }
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
    wrap.appendChild(list);

    const body = doc.querySelector('.nv-doc__body');
    if (body) body.appendChild(wrap);
  }

  /* =========================================================
     Educational Response Message — Rendering
     ========================================================= */

  function appendEducationalResponseMessage(result) {
    const messagesContainer = panelElement?.querySelector('[data-copilot-messages]');
    if (!messagesContainer) return;

    const msg = document.createElement('div');
    msg.className = 'nv-copilot__message nv-copilot__message--assistant nv-copilot__message--workspace';

    const bubble = document.createElement('div');
    bubble.className = 'nv-copilot__bubble nv-edu-workspace';

    const devMeta = result?.developerMetadata || {};
    const eduReasoning = devMeta?.educationalReasoning || {};
    const learnerModel = devMeta?.learnerModel || {};

    let html = '';

    const detailRows = [];

    // 1. Learning details are useful, but should not compete with the answer.
    const strategy = eduReasoning?.recentDecisions?.[0] || detectTeachingStrategy(result);
    if (strategy) {
      detailRows.push(['Teaching approach', strategy]);
    }

    // 2. Learning Goal
    const goal = extractLearningGoal(result, learnerModel);
    if (goal) {
      detailRows.push(['Learning objective', goal]);
    }

    if (detailRows.length > 0) {
      html += `<details class="nv-edu-workspace__details">
        <summary class="nv-edu-workspace__details-summary">Learning details</summary>
        <div class="nv-edu-workspace__details-body">
          ${detailRows.map(([label, value]) => `<div class="nv-edu-workspace__details-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
        </div>
      </details>`;
    }

    // 3. Main content
    const eduResponse = result.educationalResponse;
    if (eduResponse) {
      html += `<div class="nv-edu-workspace__content">${renderEducationalResponse(eduResponse)}</div>`;
    } else {
      html += `<div class="nv-edu-workspace__content">${renderMarkdown(result.content || 'No response content.')}</div>`;
    }

    // 4. Knowledge Progress (from Learner Model)
    const progress = extractKnowledgeProgress(learnerModel);
    if (progress && progress.length > 0) {
      html += '<div class="nv-edu-workspace__progress">';
      html += '<div class="nv-edu-workspace__progress-label">Knowledge Progress</div>';
      progress.forEach(p => {
        html += `<div class="nv-edu-workspace__progress-item">
          <span class="nv-edu-workspace__progress-name">${escapeHtml(p.name)}</span>
          <div class="nv-edu-workspace__progress-bar">
            <div class="nv-edu-workspace__progress-fill" style="width: ${p.percent}%"></div>
          </div>
          <span class="nv-edu-workspace__progress-percent">${p.percent}%</span>
        </div>`;
      });
      html += '</div>';
    }

    // 5. Cognitive Load Indicator
    const load = eduReasoning?.cognitiveLoad?.level || 0;
    if (load > 50) {
      html += `<div class="nv-edu-workspace__cognitive-load">
        <span class="nv-edu-workspace__cognitive-load-icon">\u26A0\uFE0F</span>
        <span class="nv-edu-workspace__cognitive-load-text">${load > 70 ? 'This topic is getting dense. Let me simplify.' : 'Taking a moment to consolidate.'}</span>
      </div>`;
    }

    // 6. Misconception Alert
    const misconceptions = eduReasoning?.activeMisconceptions || 0;
    if (misconceptions > 0) {
      html += `<div class="nv-edu-workspace__misconception">
        <span class="nv-edu-workspace__misconception-icon">\u{1F4A1}</span>
        <span class="nv-edu-workspace__misconception-text">I noticed a common confusion that many learners have. Let me clarify.</span>
      </div>`;
    }

    // 7. Confidence as natural language
    const confidence = eduReasoning?.cognitiveLoad?.level;
    if (confidence !== undefined) {
      const confText = confidence > 70 ? "I'm confident we've built a solid foundation."
        : confidence > 40 ? "Let me verify one thing first."
        : "I'd like to check your understanding.";
      html += `<div class="nv-edu-workspace__confidence">${escapeHtml(confText)}</div>`;
    }

    // 8. Adaptive Recommendations (instead of generic actions)
    const recommendations = generateAdaptiveRecommendations(result, eduReasoning, learnerModel);
    if (recommendations.length > 0) {
      html += '<div class="nv-edu-workspace__recommendations">';
      html += '<div class="nv-edu-workspace__recommendations-label">Continue learning</div>';
      recommendations.forEach(rec => {
        html += `<button class="nv-edu-workspace__recommendation" data-recommendation="${escapeHtml(rec.prompt)}" type="button">
          <span class="nv-edu-workspace__recommendation-icon" aria-hidden="true">${rec.icon}</span>
          <span class="nv-edu-workspace__recommendation-text">${escapeHtml(rec.label)}</span>
        </button>`;
      });
      html += '</div>';
    }

    bubble.innerHTML = html;
    msg.appendChild(bubble);
    messagesContainer.appendChild(msg);
    autoScrollIfNeeded();

    // Bind recommendation clicks
    msg.querySelectorAll('.nv-edu-workspace__recommendation').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.dataset.recommendation;
        const inputEl = panelElement?.querySelector('#nv-agent-input');
        if (inputEl && prompt) {
          inputEl.value = prompt;
          inputEl.dispatchEvent(new Event('input'));
          handleSubmit();
        }
      });
    });
  }

  function detectTeachingStrategy(result) {
    const content = (result?.content || '').toLowerCase();
    if (content.includes('analogy') || content.includes('imagine')) return 'Analogy-Driven';
    if (content.includes('let me ask') || content.includes('what do you think')) return 'Socratic Guidance';
    if (content.includes('step by step') || content.includes('first.*then')) return 'Step-by-Step';
    if (content.includes('mathematic') || content.includes('equation')) return 'Mathematics-First';
    if (content.includes('code') || content.includes('implement')) return 'Engineering-First';
    if (content.includes('example') || content.includes('for instance')) return 'Worked Example';
    if (content.includes('diagram') || content.includes('visualize')) return 'Visual-First';
    return 'Direct Explanation';
  }

  function extractLearningGoal(result, learnerModel) {
    const goals = learnerModel?.activeLearningGoals || [];
    if (goals.length > 0) return goals[0].goal;
    const content = (result?.content || '').substring(0, 100);
    return content ? `Understanding: ${content}...` : null;
  }

  function extractKnowledgeProgress(learnerModel) {
    const mastered = learnerModel?.masteredConcepts || [];
    const struggling = learnerModel?.strugglingConcepts || [];
    if (mastered.length === 0 && struggling.length === 0) return null;
    const items = [];
    mastered.slice(-3).forEach(c => items.push({ name: c.concept, percent: 100 }));
    struggling.slice(-2).forEach(c => items.push({ name: c.concept, percent: 35 }));
    return items.slice(0, 5);
  }

  function generateAdaptiveRecommendations(result, eduReasoning, learnerModel) {
    const recs = [];
    const content = (result?.content || '').toLowerCase();
    if (content.includes('concept') || content.includes('explain')) {
      recs.push({ icon: '\u{1F4A1}', label: 'Build intuition', prompt: 'Give me an intuitive explanation' });
    }
    if (content.includes('math') || content.includes('equation')) {
      recs.push({ icon: '\u{1F4D0}', label: 'See the math', prompt: 'Show me the mathematical formulation' });
    }
    if (content.includes('code') || content.includes('implement')) {
      recs.push({ icon: '\u{1F9EA}', label: 'Open a lab', prompt: 'Create a visual explanation' });
      recs.push({ icon: '\u{1F680}', label: 'Try an exercise', prompt: 'Show me a hands-on exercise' });
    }
    if (eduReasoning?.cognitiveLoad?.level < 50) {
      recs.push({ icon: '\u2705', label: 'Try practice', prompt: 'Give me practice questions' });
    }
    if (learnerModel?.strugglingConcepts?.length > 0) {
      recs.push({ icon: '\u{1F504}', label: 'Review prerequisites', prompt: 'Help me review the prerequisites' });
    }
    if (recs.length === 0) {
      recs.push({ icon: '\u{1F4A1}', label: 'Build intuition', prompt: 'Tell me more about this' });
      recs.push({ icon: '\u2705', label: 'Try an exercise', prompt: 'Quiz me on this topic' });
    }
    return recs.slice(0, 4);
  }

  /* =========================================================
     Learning Journey — Persistent Progress Display
     ========================================================= */

  function updateLearningJourney(result, learnerModel) {
    // M12 Phase 2: Learning Journey is now rendered exclusively in the sidebar.
    // The legacy inline journey panel was removed (see §12 dead-code removal).
    const sessionList = panelElement?.querySelector('[data-sidebar-session]');
    const topicsList = panelElement?.querySelector('[data-sidebar-topics]');
    const goalEl = panelElement?.querySelector('[data-sidebar-goal]');
    const conceptsList = panelElement?.querySelector('[data-sidebar-concepts]');
    const journeyList = panelElement?.querySelector('[data-sidebar-journey]');
    if (!journeyList) return;

    const mastered = learnerModel?.masteredConcepts || [];
    const struggling = learnerModel?.strugglingConcepts || [];
    const recentlyStudied = learnerModel?.recentlyStudiedTopics || [];
    const goals = learnerModel?.activeLearningGoals || [];

    const renderList = (listEl, items, formatter, emptyText) => {
      if (!listEl) return;
      if (!items || items.length === 0) {
        listEl.innerHTML = `<li class="nv-copilot__sidebar-item nv-copilot__sidebar-item--empty">${escapeHtml(emptyText)}</li>`;
        return;
      }
      listEl.innerHTML = items.map(formatter).map(html => `<li class="nv-copilot__sidebar-item">${html}</li>`).join('');
    };

    if (sessionList) {
      const hasAny = mastered.length || struggling.length || recentlyStudied.length || goals.length;
      renderList(sessionList, hasAny ? ['active'] : [], () => escapeHtml('Active learning session'), 'No active session');
    }

    renderList(topicsList, recentlyStudied.slice(-5), t => escapeHtml(t.topic), 'No topics yet');

    if (goalEl) {
      goalEl.textContent = goals[0]?.goal ? goals[0].goal : 'Not set';
    }

    renderList(conceptsList, mastered.slice(-3), c => escapeHtml(c.concept), 'No concepts yet');

    const journeyItems = [];
    if (goals[0]) journeyItems.push({ label: goals[0].goal, icon: '🎯' });
    recentlyStudied.slice(-3).forEach(t => journeyItems.push({ label: t.topic, icon: '→' }));
    mastered.slice(-2).forEach(c => journeyItems.push({ label: c.concept, icon: '✓' }));
    struggling.slice(-1).forEach(c => journeyItems.push({ label: c.concept, icon: '↻' }));

    renderList(journeyList, journeyItems, item => `${escapeHtml(item.icon || '')} ${escapeHtml(item.label)}`, 'Start a conversation');
  }

  /* =========================================================
     Session Timeline — Activity Log
     ========================================================= */

  let sessionActivities = [];

  function addSessionActivity(type, detail) {
    sessionActivities.push({
      type,
      detail,
      timestamp: new Date().toISOString()
    });
    if (sessionActivities.length > 20) {
      sessionActivities = sessionActivities.slice(-20);
    }
    updateSessionTimeline();
  }

  function updateSessionTimeline() {
    // M12 Phase 2: Session Timeline panel removed (§12). Data structure kept.
    if (!panelElement?.querySelector('[data-copilot-session-timeline]')) return;

    if (sessionActivities.length === 0) {
      timelineEl.style.display = 'none';
      return;
    }

    timelineEl.style.display = 'block';

    const icons = {
      'question': '\u{1F4AC}',
      'explanation': '\u{1F4A1}',
      'practice': '\u{1F9EA}',
      'misconception': '\u26A0\uFE0F',
      'mastery': '\u2705',
      'tool': '\u{1F527}',
      'reflection': '\u{1F4AD}'
    };

    let html = '';
    sessionActivities.slice(-8).forEach(activity => {
      html += `<div class="nv-copilot__timeline-item">
        <span class="nv-copilot__timeline-icon">${icons[activity.type] || '\u{1F4CB}'}</span>
        <span class="nv-copilot__timeline-text">${escapeHtml(activity.detail)}</span>
      </div>`;
    });

    listEl.innerHTML = html;
  }

  /* =========================================================
     Learning Dashboard Toggle
     ========================================================= */

  function initLearningDashboard() {
    const journeyToggle = panelElement?.querySelector('[data-journey-toggle]');
    const journeyContent = panelElement?.querySelector('[data-journey-content]');
    const timelineToggle = panelElement?.querySelector('[data-timeline-toggle]');
    const timelineContent = panelElement?.querySelector('[data-timeline-content]');

    journeyToggle?.addEventListener('click', () => {
      const isHidden = journeyContent?.style.display === 'none';
      if (journeyContent) journeyContent.style.display = isHidden ? 'block' : 'none';
      journeyToggle.querySelector('svg').style.transform = isHidden ? 'rotate(180deg)' : '';
    });

    timelineToggle?.addEventListener('click', () => {
      const isHidden = timelineContent?.style.display === 'none';
      if (timelineContent) timelineContent.style.display = isHidden ? 'block' : 'none';
      timelineToggle.querySelector('svg').style.transform = isHidden ? 'rotate(180deg)' : '';
    });
  }

  /* =========================================================
     Jump to Latest Button
     ========================================================= */

  let isUserScrolledUp = false;

  function initJumpToLatest() {
    const messagesEl = panelElement?.querySelector('[data-copilot-messages]');
    if (!messagesEl) return;

    // Create jump to latest button
    const jumpBtn = document.createElement('button');
    jumpBtn.className = 'nv-copilot__jump-to-latest';
    jumpBtn.textContent = 'Jump to Latest';
    jumpBtn.setAttribute('aria-label', 'Jump to latest message');
    jumpBtn.addEventListener('click', () => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
      isUserScrolledUp = false;
      jumpBtn.classList.remove('nv-copilot__jump-to-latest--visible');
    });
    panelElement?.appendChild(jumpBtn);

    // Detect user scroll
    messagesEl.addEventListener('scroll', () => {
      const isAtBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 50;
      isUserScrolledUp = !isAtBottom;
      if (isAtBottom) {
        jumpBtn.classList.remove('nv-copilot__jump-to-latest--visible');
      }
    });
  }

  function autoScrollIfNeeded() {
    if (!isUserScrolledUp) {
      const messagesEl = panelElement?.querySelector('[data-copilot-messages]');
      if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  /* =========================================================
     Focus Mode / Zen Mode
     ========================================================= */

  let currentViewMode = 'normal'; // 'normal', 'focus', 'zen'

  function initViewModes() {
    // Add mode toggle buttons to header
    const headerActions = panelElement?.querySelector('.nv-copilot__header-actions');
    if (!headerActions) return;

    const modeToggle = document.createElement('div');
    modeToggle.className = 'nv-copilot__mode-toggle';
    modeToggle.innerHTML = `
      <button class="nv-copilot__mode-btn" data-view-mode="focus" title="Focus Mode">Focus</button>
      <button class="nv-copilot__mode-btn" data-view-mode="zen" title="Zen Mode">Zen</button>
    `;
    headerActions.parentElement?.insertBefore(modeToggle, headerActions);

    modeToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-view-mode]');
      if (!btn) return;
      const mode = btn.dataset.viewMode;
      setViewMode(currentViewMode === mode ? 'normal' : mode);
    });

    // Close modes on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && currentViewMode !== 'normal') {
        setViewMode('normal');
      }
    });
  }

  function setViewMode(mode) {
    currentViewMode = mode;
    panelElement?.classList.remove('nv-copilot--focus-mode', 'nv-copilot--zen-mode');
    if (mode === 'focus') panelElement?.classList.add('nv-copilot--focus-mode');
    if (mode === 'zen') panelElement?.classList.add('nv-copilot--zen-mode');

    panelElement?.querySelectorAll('[data-view-mode]').forEach(btn => {
      btn.classList.toggle('nv-copilot__mode-btn--active', btn.dataset.viewMode === mode);
    });
  }

  /* =========================================================
     Command Palette
     ========================================================= */

  let commandPaletteOpen = false;
  let commandPaletteActiveIndex = 0;

  const COMMANDS = [
    { icon: '\u{1F4A1}', label: 'Explain a concept', action: 'explain' },
    { icon: '\u{1F4D0}', label: 'Show mathematics', action: 'math' },
    { icon: '\u{1F9EA}', label: 'Open laboratory', action: 'lab' },
    { icon: '\u2705', label: 'Generate quiz', action: 'quiz' },
    { icon: '\u{1F4CA}', label: 'Create visualization', action: 'visualize' },
    { icon: '\u{1F50D}', label: 'Search concepts', action: 'search' },
    { icon: '\u{1F4DA}', label: 'Research topic', action: 'research' },
    { icon: '\u{1F504}', label: 'Review prerequisites', action: 'review' },
    { icon: '\u{1F3AF}', label: 'Set learning goal', action: 'goal' },
    { icon: '\u{1F4CB}', label: 'View learning journey', action: 'journey' },
    { icon: '\u{1F4DD}', label: 'Take notes', action: 'notes' },
    { icon: '\u2699\uFE0F', label: 'Toggle Developer Mode', action: 'devmode' },
    { icon: '\u{1F5E3}\uFE0F', label: 'Focus Mode', action: 'focus' },
    { icon: '\u{1F31F}', label: 'Zen Mode', action: 'zen' },
  ];

  function initCommandPalette() {
    // Create palette element
    const palette = document.createElement('div');
    palette.className = 'nv-copilot__command-palette';
    palette.setAttribute('role', 'dialog');
    palette.setAttribute('aria-label', 'Command Palette');
    palette.innerHTML = `
      <div class="nv-copilot__command-palette-inner">
        <input class="nv-copilot__command-input" type="text" placeholder="Type a command..." data-command-input aria-label="Command search">
        <div class="nv-copilot__command-results" data-command-results></div>
      </div>
    `;
    panelElement?.appendChild(palette);

    const input = palette.querySelector('[data-command-input]');
    const results = palette.querySelector('[data-command-results]');

    // Render commands
    function renderCommands(filter = '') {
      const filtered = COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(filter.toLowerCase())
      );
      results.innerHTML = filtered.map((cmd, i) => `
        <div class="nv-copilot__command-item ${i === commandPaletteActiveIndex ? 'nv-copilot__command-item--active' : ''}" data-command="${cmd.action}" data-command-index="${i}">
          <span class="nv-copilot__command-item-icon">${cmd.icon}</span>
          <span class="nv-copilot__command-item-text">${cmd.label}</span>
        </div>
      `).join('');
    }

    renderCommands();

    input?.addEventListener('input', () => {
      commandPaletteActiveIndex = 0;
      renderCommands(input.value);
    });

    input?.addEventListener('keydown', (e) => {
      const items = results.querySelectorAll('.nv-copilot__command-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        commandPaletteActiveIndex = Math.min(commandPaletteActiveIndex + 1, items.length - 1);
        renderCommands(input.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        commandPaletteActiveIndex = Math.max(commandPaletteActiveIndex - 1, 0);
        renderCommands(input.value);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeItem = items[commandPaletteActiveIndex];
        if (activeItem) executeCommand(activeItem.dataset.command);
      } else if (e.key === 'Escape') {
        closeCommandPalette();
      }
    });

    results.addEventListener('click', (e) => {
      const item = e.target.closest('[data-command]');
      if (item) executeCommand(item.dataset.command);
    });

    // Close on backdrop click
    palette.addEventListener('click', (e) => {
      if (e.target === palette) closeCommandPalette();
    });

    // Keyboard shortcut: Ctrl+K / Cmd+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          commandPaletteOpen ? closeCommandPalette() : openCommandPalette();
        }
      }
    });
  }

  function openCommandPalette() {
    commandPaletteOpen = true;
    commandPaletteActiveIndex = 0;
    const palette = panelElement?.querySelector('.nv-copilot__command-palette');
    const input = palette?.querySelector('[data-command-input]');
    palette?.classList.add('nv-copilot__command-palette--open');
    input?.focus();
    input.value = '';
    input?.dispatchEvent(new Event('input'));
  }

  function closeCommandPalette() {
    commandPaletteOpen = false;
    const palette = panelElement?.querySelector('.nv-copilot__command-palette');
    palette?.classList.remove('nv-copilot__command-palette--open');
  }

  function executeCommand(action) {
    closeCommandPalette();
    const inputEl = panelElement?.querySelector('#nv-agent-input');
    if (!inputEl) return;

    const prompts = {
      'explain': 'Explain this concept in detail',
      'math': 'Show me the mathematical formulation',
      'lab': 'Create a hands-on laboratory exercise',
      'quiz': 'Generate a quiz to test my understanding',
      'visualize': 'Create a visual explanation',
      'search': 'Search for related concepts',
      'research': 'Show me the research context',
      'review': 'Help me review the prerequisites',
      'goal': 'Set a learning goal for me',
      'journey': 'Show my learning journey',
      'notes': 'Help me take notes on this topic',
      'devmode': handleToggleDeveloperMode,
      'focus': () => setViewMode(currentViewMode === 'focus' ? 'normal' : 'focus'),
      'zen': () => setViewMode(currentViewMode === 'zen' ? 'normal' : 'zen')
    };

    const prompt = prompts[action];
    if (typeof prompt === 'function') {
      prompt();
    } else if (prompt) {
      inputEl.value = prompt;
      inputEl.dispatchEvent(new Event('input'));
      handleSubmit();
    }
  }

  /* =========================================================
     Keyboard Shortcuts
     ========================================================= */

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (!isOpen) return;

      // / to focus input
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const inputEl = panelElement?.querySelector('#nv-agent-input');
        inputEl?.focus();
      }

      // Ctrl+K / Cmd+K for command palette (handled in initCommandPalette)
    });
  }

  /* =========================================================
     Professional Error UX
     ========================================================= */

  function getProfessionalErrorMessage(error) {
    if (!error) return 'An unexpected issue occurred. Your session has been preserved.';
    const msg = error.message || String(error);
    if (msg.includes('ECONNREFUSED') || msg.includes('fetch')) {
      return 'The local model is temporarily unavailable. Your session has been preserved.';
    }
    if (msg.includes('timeout') || msg.includes('AbortError')) {
      return 'The response took too long. Let me try a simpler approach.';
    }
    return 'An issue occurred while processing. Please try again.';
  }

  /* =========================================================
     Developer Metadata — Update
     ========================================================= */

  function updateDeveloperMetadata(metadata) {
    const devPanel = panelElement?.querySelector('[data-developer-panel]');
    if (!devPanel || !isDeveloperMode) return;

    // Pipeline
    const pipelineEl = devPanel.querySelector('[data-dev-pipeline]');
    if (pipelineEl) {
      const pipeline = metadata.pipeline || 'rule-based';
      pipelineEl.textContent = pipeline === 'agentic' ? 'Agentic' : 'Rule-based';
      pipelineEl.className = pipeline === 'agentic' ? 'nv-copilot__dev-value nv-copilot__dev-value--success' : 'nv-copilot__dev-value';
    }

    // Provider
    const providerEl = devPanel.querySelector('[data-dev-provider]');
    if (providerEl) providerEl.textContent = metadata.provider || '—';

    // Model
    const modelEl = devPanel.querySelector('[data-dev-model]');
    if (modelEl) modelEl.textContent = metadata.model || '—';

    // Real LLM
    const isRealLlmEl = devPanel.querySelector('[data-dev-is-real-llm]');
    if (isRealLlmEl) {
      const isReal = metadata.isRealLLM || false;
      isRealLlmEl.textContent = isReal ? 'Yes' : 'No';
      isRealLlmEl.className = isReal ? 'nv-copilot__dev-value nv-copilot__dev-badge nv-copilot__dev-value--success' : 'nv-copilot__dev-value nv-copilot__dev-badge';
    }

    // Agentic
    const agenticEnabledEl = devPanel.querySelector('[data-dev-agentic-enabled]');
    if (agenticEnabledEl) {
      const enabled = metadata.agenticEnabled || metadata.pipeline === 'agentic';
      agenticEnabledEl.textContent = enabled ? 'Enabled' : 'Disabled';
      agenticEnabledEl.className = enabled ? 'nv-copilot__dev-value nv-copilot__dev-value--success' : 'nv-copilot__dev-value';
    }

    // Agentic Loop Loaded
    const agenticLoopLoadedEl = devPanel.querySelector('[data-dev-agentic-loop-loaded]');
    if (agenticLoopLoadedEl) {
      const loaded = metadata.agenticLoopLoaded !== false;
      agenticLoopLoadedEl.textContent = loaded ? 'Yes' : 'No';
      agenticLoopLoadedEl.className = loaded ? 'nv-copilot__dev-value nv-copilot__dev-value--success' : 'nv-copilot__dev-value nv-copilot__dev-value--warning';
    }

    // Mock/Test Mode
    const mockUsedEl = devPanel.querySelector('[data-dev-mock-used]');
    if (mockUsedEl) {
      const mockUsed = metadata.mockUsed || false;
      mockUsedEl.textContent = mockUsed ? 'Yes' : 'No';
      mockUsedEl.className = mockUsed ? 'nv-copilot__dev-value nv-copilot__dev-badge nv-copilot__dev-value--warning' : 'nv-copilot__dev-value nv-copilot__dev-badge nv-copilot__dev-value--success';
    }

    // Educational Intelligence
    const teachingStrategyEl = devPanel.querySelector('[data-dev-teaching-strategy]');
    if (teachingStrategyEl) {
      teachingStrategyEl.textContent = metadata.teachingStrategy || '—';
    }

    const learningObjectiveEl = devPanel.querySelector('[data-dev-learning-objective]');
    if (learningObjectiveEl) {
      learningObjectiveEl.textContent = metadata.learningObjective || '—';
    }

    const difficultyEl = devPanel.querySelector('[data-dev-difficulty]');
    if (difficultyEl) {
      difficultyEl.textContent = metadata.difficulty || '—';
    }

    const misconceptionsEl = devPanel.querySelector('[data-dev-misconceptions]');
    if (misconceptionsEl) {
      misconceptionsEl.textContent = metadata.misconceptionsConsidered || '—';
    }

    const analogyEl = devPanel.querySelector('[data-dev-analogy]');
    if (analogyEl) {
      analogyEl.textContent = metadata.analogyUsed || '—';
    }

    const teachingProgressionEl = devPanel.querySelector('[data-dev-teaching-progression]');
    if (teachingProgressionEl) {
      teachingProgressionEl.textContent = metadata.teachingProgression || '—';
    }

    // Iterations
    const iterationsEl = devPanel.querySelector('[data-dev-iterations]');
    if (iterationsEl) {
      iterationsEl.textContent = metadata.iterations != null ? String(metadata.iterations) : '—';
    }

    // Stopped By
    const stoppedByEl = devPanel.querySelector('[data-dev-stopped-by]');
    if (stoppedByEl) {
      stoppedByEl.textContent = metadata.stoppedBy || '—';
    }

    // Tools Used
    const toolsUsedEl = devPanel.querySelector('[data-dev-tools-used]');
    if (toolsUsedEl) {
      const tools = metadata.toolsUsed || [];
      toolsUsedEl.textContent = tools.length > 0 ? tools.join(', ') : '—';
    }

    // Timeline
    const timelineEl = devPanel.querySelector('[data-dev-timeline]');
    if (timelineEl) {
      const timeline = metadata.timeline || [];
      if (timeline.length > 0) {
        const lines = timeline.map(entry => {
          const icon = entry.status === 'completed' ? '✓' : entry.status === 'running' ? '⏳' : '✗';
          const duration = entry.durationMs != null ? ` ${entry.durationMs}ms` : '';
          return `${icon} ${entry.label || entry.toolName || entry.type}${duration}`;
        });
        timelineEl.textContent = lines.join(' → ');
      } else {
        timelineEl.textContent = '—';
      }
    }

    // Evidence Count
    const evidenceCountEl = devPanel.querySelector('[data-dev-evidence-count]');
    if (evidenceCountEl) {
      const count = metadata.evidenceCount || 0;
      evidenceCountEl.textContent = String(count);
      evidenceCountEl.className = count > 0 ? 'nv-copilot__dev-value nv-copilot__dev-value--success' : 'nv-copilot__dev-value';
    }

    // Real Evidence
    const isRealEvidenceEl = devPanel.querySelector('[data-dev-is-real-evidence]');
    if (isRealEvidenceEl) {
      const isReal = metadata.isRealEvidence || false;
      isRealEvidenceEl.textContent = isReal ? 'Yes' : 'No';
      isRealEvidenceEl.className = isReal ? 'nv-copilot__dev-value nv-copilot__dev-badge nv-copilot__dev-value--success' : 'nv-copilot__dev-value nv-copilot__dev-badge';
    }

    // Adapter
    const adapterEl = devPanel.querySelector('[data-dev-adapter-status]');
    if (adapterEl) {
      const adapterAvailable = metadata.evidence?.adapterAvailable !== false;
      adapterEl.textContent = adapterAvailable ? 'Available' : 'Not Loaded';
      adapterEl.className = adapterAvailable ? 'nv-copilot__dev-value nv-copilot__dev-value--success' : 'nv-copilot__dev-value nv-copilot__dev-value--warning';
    }

    // Evidence Quality Status
    const evidenceQualityEl = devPanel.querySelector('[data-dev-evidence-quality-status]');
    if (evidenceQualityEl) {
      const eqStatus = metadata.evidenceQualityStatus || 'unknown';
      evidenceQualityEl.textContent = eqStatus;
      evidenceQualityEl.className = eqStatus === 'collected' ? 'nv-copilot__dev-value nv-copilot__dev-value--success' : eqStatus === 'limitation' ? 'nv-copilot__dev-value nv-copilot__dev-value--warning' : 'nv-copilot__dev-value';
    }

    // Fallback Active
    const fallbackActiveEl = devPanel.querySelector('[data-dev-fallback-active]');
    if (fallbackActiveEl) {
      const fallback = metadata.fallbackUsed || false;
      fallbackActiveEl.textContent = fallback ? 'Yes' : 'No';
      fallbackActiveEl.className = fallback ? 'nv-copilot__dev-value nv-copilot__dev-value--warning' : 'nv-copilot__dev-value nv-copilot__dev-value--success';
    }

    // Fallback Reason
    const fallbackReasonEl = devPanel.querySelector('[data-dev-fallback-reason]');
    if (fallbackReasonEl) {
      fallbackReasonEl.textContent = metadata.fallbackReason || 'None';
      fallbackReasonEl.className = metadata.fallbackReason ? 'nv-copilot__dev-value nv-copilot__dev-value--warning' : 'nv-copilot__dev-value';
    }

    // Confidence
    const confidenceEl = devPanel.querySelector('[data-dev-confidence]');
    if (confidenceEl) {
      const conf = metadata.confidence;
      if (conf != null) {
        const pct = typeof conf === 'number' ? Math.round(conf * 100) + '%' : conf;
        confidenceEl.textContent = pct;
      } else {
        confidenceEl.textContent = '—';
      }
    }

    // Learner Model
    const lm = metadata.learnerModel;
    if (lm) {
      const expertiseEl = devPanel.querySelector('[data-dev-learner-expertise]');
      if (expertiseEl) {
        const exp = lm.estimatedExpertise;
        expertiseEl.textContent = exp ? `${exp.level > 70 ? 'Advanced' : exp.level > 40 ? 'Intermediate' : 'Beginner'} (${Math.round(exp.confidence * 100)}%)` : '—';
      }

      const mathEl = devPanel.querySelector('[data-dev-learner-math]');
      if (mathEl) {
        const math = lm.mathematicalMaturity;
        mathEl.textContent = math ? `${math.level > 70 ? 'Strong' : math.level > 40 ? 'Moderate' : 'Developing'} (${Math.round(math.confidence * 100)}%)` : '—';
      }

      const progEl = devPanel.querySelector('[data-dev-learner-programming]');
      if (progEl) {
        const prog = lm.programmingProficiency;
        progEl.textContent = prog ? `${prog.level > 70 ? 'Proficient' : prog.level > 40 ? 'Comfortable' : 'Learning'} (${Math.round(prog.confidence * 100)}%)` : '—';
      }

      const styleEl = devPanel.querySelector('[data-dev-learner-style]');
      if (styleEl) {
        const style = lm.preferredExplanationStyle;
        styleEl.textContent = style ? `${style.value} (${Math.round(style.confidence * 100)}%)` : '—';
      }

      const masteredEl = devPanel.querySelector('[data-dev-learner-mastered]');
      if (masteredEl) {
        const mastered = lm.masteredConcepts || [];
        masteredEl.textContent = mastered.length > 0 ? mastered.slice(-5).map(c => c.concept).join(', ') : '—';
      }

      const strugglingEl = devPanel.querySelector('[data-dev-learner-struggling]');
      if (strugglingEl) {
        const struggling = lm.strugglingConcepts || [];
        strugglingEl.textContent = struggling.length > 0 ? struggling.slice(-3).map(c => c.concept).join(', ') : '—';
      }

      const misconceptionsEl = devPanel.querySelector('[data-dev-learner-misconceptions]');
      if (misconceptionsEl) {
        const misconceptions = (lm.misconceptionHistory || []).filter(m => !m.resolved);
        misconceptionsEl.textContent = misconceptions.length > 0 ? misconceptions.slice(-3).map(m => m.misconception).join(', ') : '—';
      }

      const goalsEl = devPanel.querySelector('[data-dev-learner-goals]');
      if (goalsEl) {
        const goals = lm.activeLearningGoals || [];
        goalsEl.textContent = goals.length > 0 ? goals.map(g => g.goal).join(', ') : '—';
      }

      const versionEl = devPanel.querySelector('[data-dev-learner-version]');
      if (versionEl) {
        versionEl.textContent = lm.version ? `v${lm.version}` : '—';
      }

      const updateSourceEl = devPanel.querySelector('[data-dev-learner-update-source]');
      if (updateSourceEl) {
        const updateSource = metadata.learnerModelUpdateSource;
        updateSourceEl.textContent = updateSource || '—';
        updateSourceEl.className = updateSource ? 'nv-copilot__dev-value nv-copilot__dev-value--success' : 'nv-copilot__dev-value';
      }
    }

    // Knowledge Retrieval
    const ret = metadata.retrieval;
    if (ret) {
      const sourcesEl = devPanel.querySelector('[data-dev-retrieval-sources]');
      if (sourcesEl) {
        sourcesEl.textContent = ret.sources ? ret.sources.join(', ') : '—';
      }

      const countEl = devPanel.querySelector('[data-dev-retrieval-count]');
      if (countEl) {
        countEl.textContent = ret.retrievedCount != null ? `${ret.retrievedCount}/${ret.totalCount}` : '—';
      }

      const compressionEl = devPanel.querySelector('[data-dev-retrieval-compression]');
      if (compressionEl) {
        compressionEl.textContent = ret.compressionRatio != null ? `${Math.round(ret.compressionRatio * 100)}%` : '—';
      }

      const durationEl = devPanel.querySelector('[data-dev-retrieval-duration]');
      if (durationEl) {
        durationEl.textContent = ret.durationMs != null ? `${ret.durationMs}ms` : '—';
      }

      const categoriesEl = devPanel.querySelector('[data-dev-retrieval-categories]');
      if (categoriesEl) {
        categoriesEl.textContent = ret.categories ? ret.categories.join(', ') : '—';
      }

      const cacheEl = devPanel.querySelector('[data-dev-retrieval-cache]');
      if (cacheEl) {
        cacheEl.textContent = ret.fromCache ? 'Yes' : 'No';
        cacheEl.className = ret.fromCache ? 'nv-copilot__dev-value nv-copilot__dev-value--success' : 'nv-copilot__dev-value';
      }
    }

    // Educational Intelligence
    const edu = metadata.educationalReasoning;
    if (edu) {
      const cogLoadEl = devPanel.querySelector('[data-dev-edu-cognitive-load]');
      if (cogLoadEl) {
        const load = edu.cognitiveLoad?.level || 0;
        cogLoadEl.textContent = `${load}%`;
        cogLoadEl.className = load > 60 ? 'nv-copilot__dev-value nv-copilot__dev-value--warning' : 'nv-copilot__dev-value';
      }

      const eduMisconceptionsEl = devPanel.querySelector('[data-dev-edu-misconceptions]');
      if (eduMisconceptionsEl) {
        eduMisconceptionsEl.textContent = String(edu.activeMisconceptions || 0);
      }

      const decisionsEl = devPanel.querySelector('[data-dev-edu-decisions]');
      if (decisionsEl) {
        decisionsEl.textContent = edu.recentDecisions?.length > 0 ? edu.recentDecisions.join(', ') : '—';
      }

      const reflectionsEl = devPanel.querySelector('[data-dev-edu-reflections]');
      if (reflectionsEl) {
        reflectionsEl.textContent = edu.recentReflections?.length > 0 ? edu.recentReflections.join(', ') : '—';
      }

      const masteredEl = devPanel.querySelector('[data-dev-edu-mastered]');
      if (masteredEl) {
        masteredEl.textContent = edu.progress?.conceptsMastered != null ? String(edu.progress.conceptsMastered) : '—';
      }

      const inProgressEl = devPanel.querySelector('[data-dev-edu-in-progress]');
      if (inProgressEl) {
        const intro = edu.progress?.conceptsIntroduced || 0;
        const mastered = edu.progress?.conceptsMastered || 0;
        inProgressEl.textContent = String(intro - mastered);
      }

      const interactionsEl = devPanel.querySelector('[data-dev-edu-interactions]');
      if (interactionsEl) {
        interactionsEl.textContent = edu.progress?.totalInteractions != null ? String(edu.progress.totalInteractions) : '—';
      }

      const planEl = devPanel.querySelector('[data-dev-edu-plan]');
      if (planEl) {
        planEl.textContent = edu.planGoal || '—';
      }
    }

    // System Health
    const health = metadata.health;
    if (health) {
      const providerHealthEl = devPanel.querySelector('[data-dev-health-provider]');
      if (providerHealthEl) {
        const status = health.provider?.status || 'unknown';
        providerHealthEl.textContent = status;
        providerHealthEl.className = status === 'healthy' ? 'nv-copilot__dev-value nv-copilot__dev-value--success' : 'nv-copilot__dev-value nv-copilot__dev-value--warning';
      }

      const retrievalHealthEl = devPanel.querySelector('[data-dev-health-retrieval]');
      if (retrievalHealthEl) {
        const cacheHits = health.retrieval?.cacheHits || 0;
        const cacheMisses = health.retrieval?.cacheMisses || 0;
        retrievalHealthEl.textContent = `${cacheHits} hits / ${cacheMisses} misses`;
      }

      const memoryHealthEl = devPanel.querySelector('[data-dev-health-memory]');
      if (memoryHealthEl) {
        const mem = health.memory || {};
        memoryHealthEl.textContent = `${mem.sessions || 0} sessions, ${mem.messages || 0} msgs`;
      }

      const errorsHealthEl = devPanel.querySelector('[data-dev-health-errors]');
      if (errorsHealthEl) {
        const errCount = health.errors?.count || 0;
        errorsHealthEl.textContent = String(errCount);
        errorsHealthEl.className = errCount > 0 ? 'nv-copilot__dev-value nv-copilot__dev-value--warning' : 'nv-copilot__dev-value';
      }

      const perfHealthEl = devPanel.querySelector('[data-dev-health-performance]');
      if (perfHealthEl) {
        const perf = health.performance || {};
        perfHealthEl.textContent = perf.memory || '—';
      }
    }

    // Benchmark
    const bm = metadata.benchmark;
    if (bm) {
      const overallEl = devPanel.querySelector('[data-dev-benchmark-overall]');
      if (overallEl) {
        const score = bm.overallScore || 0;
        overallEl.textContent = `${Math.round(score * 100)}%`;
        overallEl.className = score > 0.7 ? 'nv-copilot__dev-value nv-copilot__dev-value--success' : score > 0.4 ? 'nv-copilot__dev-value' : 'nv-copilot__dev-value nv-copilot__dev-value--warning';
      }

      const samplesEl = devPanel.querySelector('[data-dev-benchmark-samples]');
      if (samplesEl) {
        samplesEl.textContent = String(bm.totalSamples || 0);
      }

      const pedagogicalEl = devPanel.querySelector('[data-dev-benchmark-pedagogical]');
      if (pedagogicalEl) {
        const p = bm.metrics?.pedagogicalQuality?.score || 0;
        pedagogicalEl.textContent = `${Math.round(p * 100)}%`;
      }

      const technicalEl = devPanel.querySelector('[data-dev-benchmark-technical]');
      if (technicalEl) {
        const t = bm.metrics?.technicalAccuracy?.score || 0;
        technicalEl.textContent = `${Math.round(t * 100)}%`;
      }

      const researchEl = devPanel.querySelector('[data-dev-benchmark-research]');
      if (researchEl) {
        const r = bm.metrics?.researchQuality?.score || 0;
        researchEl.textContent = `${Math.round(r * 100)}%`;
      }

      const hallucinationsEl = devPanel.querySelector('[data-dev-benchmark-hallucinations]');
      if (hallucinationsEl) {
        hallucinationsEl.textContent = String(bm.hallucinationCount || 0);
        hallucinationsEl.className = (bm.hallucinationCount || 0) > 0 ? 'nv-copilot__dev-value nv-copilot__dev-value--warning' : 'nv-copilot__dev-value';
      }
    }
  }

  /* =========================================================
     Clarification Response — Rendering
     ========================================================= */

  function appendClarificationMessage(clarification) {
    const messagesContainer = panelElement?.querySelector('[data-copilot-messages]');
    if (!messagesContainer) return;

    const msg = document.createElement('div');
    msg.className = 'nv-copilot__message nv-copilot__message--assistant nv-copilot__message--clarification';

    const bubble = document.createElement('div');
    bubble.className = 'nv-copilot__bubble nv-clarification';

    let html = `<div class="nv-clarification__header">
      <span class="nv-clarification__icon" aria-hidden="true">\u{1F50D}</span>
      <span class="nv-clarification__title">I need a bit more context</span>
    </div>`;

    html += `<div class="nv-clarification__question">${escapeHtml(clarification.clarificationQuestion)}</div>`;

    if (clarification.missingEvidence && clarification.missingEvidence.length > 0) {
      html += '<div class="nv-clarification__missing">';
      html += '<span class="nv-clarification__missing-label">Missing context:</span>';
      html += '<div class="nv-clarification__missing-list">';
      clarification.missingEvidence.forEach(item => {
        html += `<span class="nv-clarification__missing-item">${escapeHtml(item.replace(/-/g, ' '))}</span>`;
      });
      html += '</div></div>';
    }

    if (clarification.suggestedNextPrompts && clarification.suggestedNextPrompts.length > 0) {
      html += '<div class="nv-clarification__suggestions">';
      clarification.suggestedNextPrompts.forEach(prompt => {
        html += `<button class="nv-clarification__chip" data-clarification-prompt="${escapeHtml(prompt)}" type="button">${escapeHtml(prompt)}</button>`;
      });
      html += '</div>';
    }

    bubble.innerHTML = html;
    msg.appendChild(bubble);
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Bind chip clicks
    msg.querySelectorAll('.nv-clarification__chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.dataset.clarificationPrompt;
        const inputEl = panelElement?.querySelector('#nv-agent-input');
        if (inputEl && prompt) {
          inputEl.value = prompt;
          inputEl.dispatchEvent(new Event('input'));
          inputEl.focus();
        }
      });
    });
  }

  function appendStructuredMessage(result) {
    const messagesContainer = panelElement?.querySelector('[data-copilot-messages]');
    if (!messagesContainer) return;

    const msg = document.createElement('div');
    msg.className = 'nv-copilot__message nv-copilot__message--assistant';

    const bubble = document.createElement('div');
    bubble.className = 'nv-copilot__bubble';

    let html = '';
    if (result.topic) {
      html += `<div class="nv-copilot__topic">${escapeHtml(result.topic)}</div>`;
    }

    if (result.sections && result.sections.length > 0) {
      result.sections.forEach((section) => {
        const isCollapsed = collapsedSections.has(section.title);
        html += `<div class="nv-agent-section ${isCollapsed ? 'nv-agent-section--collapsed' : ''}" data-section="${escapeHtml(section.title)}">
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

    bubble.innerHTML = html;
    msg.appendChild(bubble);
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Bind section toggles
    msg.querySelectorAll('.nv-agent-section__toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const section = toggle.closest('.nv-agent-section');
        if (section) {
          section.classList.toggle('nv-agent-section--collapsed');
          const title = toggle.textContent.trim();
          if (section.classList.contains('nv-agent-section--collapsed')) {
            collapsedSections.add(title);
          } else {
            collapsedSections.delete(title);
          }
          savePreference('collapsed', [...collapsedSections]);
        }
      });
    });
  }

  function appendTypingIndicator() {
    const messagesContainer = panelElement?.querySelector('[data-copilot-messages]');
    if (!messagesContainer) return null;

    const id = 'typing-' + Date.now();
    const msg = document.createElement('div');
    msg.className = 'nv-copilot__message nv-copilot__message--assistant nv-copilot__message--typing';
    msg.id = id;
    msg.innerHTML = `<div class="nv-copilot__bubble nv-copilot__typing">
      <span class="nv-copilot__typing-dot"></span>
      <span class="nv-copilot__typing-dot"></span>
      <span class="nv-copilot__typing-dot"></span>
    </div>`;
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return id;
  }

  function removeTypingIndicator(id) {
    if (!id) return;
    const el = panelElement?.querySelector('#' + id);
    if (el) el.remove();
  }

  function renderSectionContent(section) {
    if (section.type === 'comparison-table') {
      return renderMarkdownTable(section.content);
    }
    if (section.type === 'socratic-questions') {
      return renderSocraticQuestions(section.content);
    }
    if (section.type === 'visual-card') {
      return `<div class="nv-agent-visual-card">${renderMarkdown(section.content || '')}</div>`;
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
      return `<div class="nv-agent-lab-card">${renderMarkdown(section.content || '')}</div>`;
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
      return `<div class="nv-agent-engineering-card">${renderMarkdown(section.content || '')}</div>`;
    }
    if (section.type === 'reinforcement-card') {
      return `<div class="nv-agent-reinforcement-card">${renderMarkdown(section.content || '')}</div>`;
    }
    if (section.type === 'knowledge-card') {
      return `<div class="nv-agent-knowledge-card">${renderMarkdown(section.content || '')}</div>`;
    }
    if (section.type === 'narrative-card') {
      return `<div class="nv-agent-narrative-card">${renderMarkdown(section.content || '')}</div>`;
    }
    if (section.type === 'curiosity-card') {
      return `<div class="nv-agent-curiosity-card">${renderMarkdown(section.content || '')}</div>`;
    }
    return renderMarkdown(section.content || '');
  }

  function renderResearchCard(section) {
    const confidence = section.confidence ? `<span class="nv-agent-confidence-badge" data-confidence="${escapeHtml(section.confidence)}">${escapeHtml(section.confidence)}</span>` : '';
    return `<div class="nv-agent-research-card">${confidence}${renderMarkdown(section.content || '')}</div>`;
  }

  function renderConfidenceCard(section) {
    return `<div class="nv-agent-confidence-card">
      <span class="nv-agent-confidence-badge" data-confidence="${escapeHtml(section.confidence || section.content || '')}">${escapeHtml(section.confidence || section.content || '')}</span>
      <div>${renderMarkdown(section.content || '')}</div>
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
    const steps = text.split('\n').map((line) => line.trim()).filter(Boolean).filter((line) => line !== '\u2193');
    if (steps.length === 0) return renderMarkdown(text);
    let html = '<ol class="nv-agent-execution-flow">';
    steps.forEach((step) => {
      html += `<li class="nv-agent-execution-flow__item">${renderMarkdown(step)}</li>`;
    });
    html += '</ol>';
    return html;
  }

  function renderTimeline(text) {
    if (!text) return '';
    const items = text.split('\n').filter(l => l.trim()).map(l => l.replace(/^\d+[\.)]\s*/, '').trim());
    if (items.length === 0) return renderMarkdown(text);
    let html = '<ol class="nv-agent-timeline">';
    items.forEach((item) => {
      html += `<li class="nv-agent-timeline__item">${renderMarkdown(item)}</li>`;
    });
    html += '</ol>';
    return html;
  }

  function renderMarkdownTable(text) {
    if (!text) return '';
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return renderMarkdown(text);
    let html = '<div class="nv-agent-table-wrapper"><table class="nv-agent-table">';
    lines.forEach((line, i) => {
      if (line.match(/^\|[\s-|]+\|$/)) return;
      const cells = line.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
      const tag = i === 0 ? 'th' : 'td';
      html += '<tr>';
      cells.forEach(cell => {
        html += `<${tag}>${renderMarkdown(cell)}</${tag}>`;
      });
      html += '</tr>';
    });
    html += '</table></div>';
    return html;
  }

  function renderSocraticQuestions(text) {
    if (!text) return '';
    const questions = text.split('\n').filter(l => l.trim().endsWith('?'));
    if (questions.length === 0) return renderMarkdown(text);
    let html = '<ol class="nv-agent-socratic-list">';
    questions.forEach(q => {
      html += `<li class="nv-agent-socratic-item">${renderMarkdown(q.replace(/^\d+[\.\)]\s*/, ''))}</li>`;
    });
    html += '</ol>';
    return html;
  }

  /* =========================================================
     Educational Response — Section Icons
     ========================================================= */

  const SECTION_ICONS = {
    'explanation': '\u{1F4D6}',
    'key-concepts': '\u{1F511}',
    'important-observations': '\u{26A0}\uFE0F',
    'examples': '\u{1F4CB}',
    'mathematical-insight': '\u{1F4D0}',
    'engineering-perspective': '\u{1F3ED}',
    'applications': '\u{1F30D}',
    'research-notes': '\u{1F52C}',
    'visual-suggestions': '\u{1F3A8}',
    'laboratory-suggestions': '\u{1F9EA}',
    'assessment-suggestions': '\u{2705}',
    'common-misconceptions': '\u{1F6AB}',
    'related-concepts': '\u{1F517}',
    'learning-path-recommendations': '\u{1F9ED}',
    'summary': '\u{1F4DD}',
    'next-steps': '\u{27A1}\uFE0F',
    'references': '\u{1F4DA}',
    'confidence': '\u{1F4CA}'
  };

  const CARD_ICONS = {
    'concept': '\u{1F4A1}',
    'comparison': '\u{2194}\uFE0F',
    'timeline': '\u{1F553}',
    'warning': '\u{26A0}\uFE0F',
    'misconception': '\u{1F6AB}',
    'research': '\u{1F52C}',
    'application': '\u{1F3ED}',
    'laboratory': '\u{1F9EA}',
    'assessment': '\u{2705}',
    'reference': '\u{1F4DA}',
    'visual': '\u{1F3A8}',
    'code': '\u{1F4BB}',
    'formula': '\u{1F4D0}',
    'step-by-step': '\u{1F4CB}'
  };

  const LOADING_STAGES = [
    'Thinking',
    'Planning Response',
    'Building Educational Sections',
    'Generating Cards',
    'Preparing Actions',
    'Complete'
  ];

  /* =========================================================
     Educational Response — Rendering Functions
     ========================================================= */

  function renderEducationalResponse(educationalResponse) {
    if (!educationalResponse) return '';

    let html = '';

    // 1. Main content bubble
    html += `<div class="nv-edu__content">${renderMarkdown(educationalResponse.content)}</div>`;

    // 2. Educational sections
    if (educationalResponse.sections && educationalResponse.sections.length > 0) {
      html += '<div class="nv-edu__sections">';
      educationalResponse.sections.forEach(section => {
        html += renderEducationalSection(section);
      });
      html += '</div>';
    }

    // 3. Educational cards
    if (educationalResponse.cards && educationalResponse.cards.length > 0) {
      html += '<div class="nv-edu__cards">';
      educationalResponse.cards.forEach(card => {
        html += renderEducationalCard(card);
      });
      html += '</div>';
    }

    // 4. Suggested actions
    if (educationalResponse.actions && educationalResponse.actions.length > 0) {
      html += '<div class="nv-edu__actions">';
      educationalResponse.actions.forEach(action => {
        html += renderEducationalAction(action);
      });
      html += '</div>';
    }

    // 5. Summary
    if (educationalResponse.summary) {
      html += `<div class="nv-edu__summary">
        <div class="nv-edu__summary-label">Summary</div>
        <div class="nv-edu__summary-content">${escapeHtml(educationalResponse.summary)}</div>
      </div>`;
    }

    // 6. Next steps
    if (educationalResponse.nextSteps && educationalResponse.nextSteps.length > 0) {
      html += '<div class="nv-edu__next-steps">';
      html += '<div class="nv-edu__next-steps-label">Next Steps</div>';
      html += '<ul class="nv-edu__next-steps-list">';
      educationalResponse.nextSteps.forEach(step => {
        html += `<li>${escapeHtml(step)}</li>`;
      });
      html += '</ul></div>';
    }

    // 7. Confidence badge
    if (educationalResponse.confidence) {
      html += `<div class="nv-edu__confidence">
        <span class="nv-edu__confidence-badge" data-confidence="${educationalResponse.confidence}">${educationalResponse.confidence}</span>
      </div>`;
    }

    // 8. Developer metadata (collapsed)
    if (educationalResponse.metadata && isDeveloperMode) {
      html += renderDeveloperMetadata(educationalResponse.metadata);
    }

    return html;
  }

  function renderEducationalSection(section) {
    const icon = SECTION_ICONS[section.type] || '\u{1F4CB}';
    const isCollapsed = collapsedSections.has(`edu-${section.id}`);
    const shouldCollapse = ['research-notes', 'references', 'confidence', 'learning-path-recommendations'].includes(section.type);

    return `<div class="nv-edu__section ${isCollapsed || shouldCollapse ? 'nv-edu__section--collapsed' : ''}" data-edu-section="${section.id}">
      <button class="nv-edu__section-toggle" type="button" aria-expanded="${!(isCollapsed || shouldCollapse)}">
        <span class="nv-edu__section-icon" aria-hidden="true">${icon}</span>
        <span class="nv-edu__section-title">${escapeHtml(section.title)}</span>
        <span class="nv-edu__section-chevron" aria-hidden="true">\u203a</span>
      </button>
      <div class="nv-edu__section-content">
        ${renderMarkdown(section.content)}
      </div>
    </div>`;
  }

  function renderEducationalCard(card) {
    const icon = CARD_ICONS[card.type] || '\u{1F4CB}';

    let bodyHtml = '';

    // Special rendering for certain card types
    if (card.type === 'code') {
      bodyHtml = renderCodeCard(card);
    } else if (card.type === 'formula') {
      bodyHtml = renderFormulaCard(card);
    } else if (card.type === 'timeline') {
      bodyHtml = renderTimelineCard(card);
    } else if (card.type === 'warning') {
      bodyHtml = renderWarningCard(card);
    } else if (card.type === 'misconception') {
      bodyHtml = renderMisconceptionCard(card);
    } else if (card.type === 'step-by-step') {
      bodyHtml = renderStepByStepCard(card);
    } else {
      bodyHtml = `<div class="nv-edu__card-body">${renderMarkdown(card.content)}</div>`;
    }

    return `<div class="nv-edu__card nv-edu__card--${card.type}" data-edu-card="${card.id}">
      <div class="nv-edu__card-header">
        <span class="nv-edu__card-icon" aria-hidden="true">${icon}</span>
        <span class="nv-edu__card-title">${escapeHtml(card.title)}</span>
      </div>
      ${bodyHtml}
    </div>`;
  }

  function renderCodeCard(card) {
    return `<div class="nv-edu__card-body">
      <div class="nv-edu__code-block">
        <div class="nv-edu__code-header">
          <span class="nv-edu__code-lang">Code</span>
          <button class="nv-edu__code-copy" type="button" data-copy="${escapeHtml(card.content)}" aria-label="Copy code">Copy</button>
        </div>
        <pre><code>${escapeHtml(card.content)}</code></pre>
      </div>
    </div>`;
  }

  function renderFormulaCard(card) {
    return `<div class="nv-edu__card-body">
      <div class="nv-edu__formula-block">
        <code>${escapeHtml(card.content)}</code>
      </div>
    </div>`;
  }

  function renderTimelineCard(card) {
    const items = card.content.split('\n').filter(l => l.trim());
    let html = '<div class="nv-edu__card-body"><div class="nv-edu__timeline">';
    items.forEach(item => {
      html += `<div class="nv-edu__timeline-item">
        <div class="nv-edu__timeline-dot"></div>
        <div class="nv-edu__timeline-content">${renderMarkdown(item)}</div>
      </div>`;
    });
    html += '</div></div>';
    return html;
  }

  function renderWarningCard(card) {
    return `<div class="nv-edu__card-body nv-edu__card-body--warning">
      <div class="nv-edu__warning-icon" aria-hidden="true">\u{26A0}\uFE0F</div>
      <div class="nv-edu__warning-content">${renderMarkdown(card.content)}</div>
    </div>`;
  }

  function renderMisconceptionCard(card) {
    const parts = card.content.split('\n').filter(l => l.trim());
    return `<div class="nv-edu__card-body">
      <div class="nv-edu__misconception">
        <div class="nv-edu__misconception-wrong">
          <div class="nv-edu__misconception-label">Common Misconception</div>
          <div>${renderMarkdown(parts[0] || card.content)}</div>
        </div>
        <div class="nv-edu__misconception-arrow">\u2192</div>
        <div class="nv-edu__misconception-correct">
          <div class="nv-edu__misconception-label">Correct Understanding</div>
          <div>${renderMarkdown(parts[1] || '')}</div>
        </div>
      </div>
    </div>`;
  }

  function renderStepByStepCard(card) {
    const steps = card.content.split('\n').filter(l => l.trim());
    let html = '<div class="nv-edu__card-body"><ol class="nv-edu__steps">';
    steps.forEach(step => {
      html += `<li class="nv-edu__step">${renderMarkdown(step)}</li>`;
    });
    html += '</ol></div>';
    return html;
  }

  function renderEducationalAction(action) {
    return `<button class="nv-edu__action-chip" data-edu-action="${action.type}" data-prompt="${escapeHtml(action.label)}" type="button" aria-label="${escapeHtml(action.description)}">
      <span class="nv-edu__action-icon" aria-hidden="true">${action.icon}</span>
      <span class="nv-edu__action-label">${escapeHtml(action.label)}</span>
    </button>`;
  }

  function renderDeveloperMetadata(metadata) {
    return `<div class="nv-edu__dev-metadata" data-edu-dev-metadata>
      <button class="nv-edu__dev-toggle" type="button" aria-expanded="false">
        <span class="nv-edu__dev-icon" aria-hidden="true">\u{1F527}</span>
        Developer Metadata
        <span class="nv-edu__dev-chevron" aria-hidden="true">\u203a</span>
      </button>
      <div class="nv-edu__dev-content" style="display: none;">
        <div class="nv-edu__dev-row"><span>Provider</span><span>${escapeHtml(metadata.provider || '—')}</span></div>
        <div class="nv-edu__dev-row"><span>Model</span><span>${escapeHtml(metadata.model || '—')}</span></div>
        <div class="nv-edu__dev-row"><span>AI Mode</span><span>${escapeHtml(metadata.mode || '—')}</span></div>
        <div class="nv-edu__dev-row"><span>Response Style</span><span>${escapeHtml(metadata.style || '—')}</span></div>
        <div class="nv-edu__dev-row"><span>Pipeline Time</span><span>${metadata.latencyMs || 0}ms</span></div>
        <div class="nv-edu__dev-row"><span>Validation</span><span>${escapeHtml(metadata.validationStatus || '—')}</span></div>
        <div class="nv-edu__dev-row"><span>Sections</span><span>${metadata.sectionCount || 0}</span></div>
        <div class="nv-edu__dev-row"><span>Cards</span><span>${metadata.cardCount || 0}</span></div>
        <div class="nv-edu__dev-row"><span>Actions</span><span>${metadata.actionCount || 0}</span></div>
      </div>
    </div>`;
  }

  /* =========================================================
     Educational Response — Loading Experience
     ========================================================= */

  function appendLoadingIndicator() {
    const messagesContainer = panelElement?.querySelector('[data-copilot-messages]');
    if (!messagesContainer) return null;

    const id = 'loading-' + Date.now();
    const msg = document.createElement('div');
    msg.className = 'nv-copilot__message nv-copilot__message--assistant nv-copilot__message--loading';
    msg.id = id;
    msg.innerHTML = `<div class="nv-copilot__bubble nv-edu__loading">
      <div class="nv-edu__loading-stages">
        ${LOADING_STAGES.map((stage, i) => `
          <div class="nv-edu__loading-stage ${i === 0 ? 'nv-edu__loading-stage--active' : ''}" data-stage="${i}">
            <span class="nv-edu__loading-dot"></span>
            <span class="nv-edu__loading-text">${stage}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Animate stages
    let currentStage = 0;
    const interval = setInterval(() => {
      currentStage++;
      if (currentStage >= LOADING_STAGES.length) {
        clearInterval(interval);
        return;
      }
      const stages = msg.querySelectorAll('.nv-edu__loading-stage');
      stages.forEach((stage, i) => {
        stage.classList.toggle('nv-edu__loading-stage--active', i === currentStage);
        stage.classList.toggle('nv-edu__loading-stage--done', i < currentStage);
      });
    }, 400);

    return id;
  }

  function removeLoadingIndicator(id) {
    if (!id) return;
    const el = panelElement?.querySelector('#' + id);
    if (el) el.remove();
  }

  /* =========================================================
     Educational Response — Empty Response
     ========================================================= */

  function renderEmptyResponse() {
    return `<div class="nv-edu__empty">
      <div class="nv-edu__empty-icon" aria-hidden="true">\u{1F914}</div>
      <div class="nv-edu__empty-title">The AI could not generate an educational response.</div>
      <div class="nv-edu__empty-suggestions">
        <div class="nv-edu__empty-label">Try:</div>
        <ul class="nv-edu__empty-list">
          <li>Rephrasing your question</li>
          <li>Selecting another mode</li>
          <li>Asking for more context</li>
        </ul>
      </div>
    </div>`;
  }

  /* =========================================================
     Educational Response — Action Handler
     ========================================================= */

  function handleEducationalAction(actionType, prompt) {
    const inputEl = panelElement?.querySelector('#nv-agent-input');
    if (inputEl && prompt) {
      inputEl.value = prompt;
      inputEl.dispatchEvent(new Event('input'));
    }
  }

  function handleResponseAction(action) {
    if (!lastResult && action !== 'copy') return;

    switch (action) {
      case 'copy':
        copyResponseToClipboard();
        break;
      case 'regenerate':
        regenerateResponse();
        break;
      case 'simplify':
        sendMoreAction('Explain this concept in simpler terms');
        break;
      case 'deepen':
        sendMoreAction('Give me a deeper technical explanation');
        break;
      case 'quiz':
        sendMoreAction('Generate practice questions for this concept');
        break;
      case 'diagram':
        sendMoreAction('Generate a diagram for this concept');
        break;
      case 'lab':
        sendMoreAction('Create a laboratory exercise for this concept');
        break;
      case 'flashcards':
        sendMoreAction('Generate flashcards for this concept');
        break;
      case 'summary':
        sendMoreAction('Summarize this concept');
        break;
      case 'visual':
        sendMoreAction('Create a visual explanation for this concept');
        break;
      case 'compare':
        sendMoreAction('Compare this with related concepts');
        break;
    }
  }

  function sendMoreAction(prompt) {
    const inputEl = panelElement?.querySelector('#nv-agent-input');
    if (inputEl) {
      inputEl.value = prompt;
      inputEl.dispatchEvent(new Event('input'));
    }
    handleSubmit();
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

  function showToast(message) {
    const existing = document.querySelector('.nv-copilot-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'nv-copilot-toast';
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('nv-copilot-toast--visible');
      setTimeout(() => {
        toast.classList.remove('nv-copilot-toast--visible');
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    });
  }

  function showGuardrailNotice(message) {
    const notice = panelElement?.querySelector('[data-copilot-guardrail]');
    const textEl = panelElement?.querySelector('[data-copilot-guardrail-text]');
    if (notice && textEl) {
      textEl.textContent = message;
      notice.style.display = 'flex';
    }
  }

  function handleToggleHistory() {
    const toggle = panelElement?.querySelector('.nv-copilot__history-toggle');
    const list = panelElement?.querySelector('[data-copilot-history-list]');
    if (!toggle || !list) return;

    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    list.style.display = expanded ? 'none' : 'block';

    if (!expanded) {
      renderHistoryList();
    }
  }

  function renderHistoryList() {
    const list = panelElement?.querySelector('[data-copilot-history-list]');
    if (!list) return;

    list.innerHTML = '';

    if (interactionHistory.length === 0) {
      list.innerHTML = '<li class="nv-copilot__history-empty">No conversations yet.</li>';
      return;
    }

    [...interactionHistory].reverse().forEach((entry) => {
      const li = document.createElement('li');
      li.className = 'nv-copilot__history-item';
      li.dataset.query = entry.query;
      li.innerHTML = `
        <div class="nv-copilot__history-query">${escapeHtml(entry.query?.substring(0, 80))}${entry.query?.length > 80 ? '...' : ''}</div>
        <div class="nv-copilot__history-status ${entry.result?.type === 'governed-refusal' ? 'refused' : 'success'}">
          ${entry.result?.type === 'governed-refusal' ? 'Refused' : entry.result?.type === 'error' ? 'Error' : 'Success'}
        </div>
        <div class="nv-copilot__history-time">${formatTime(entry.timestamp)}</div>
      `;
      list.appendChild(li);
    });
  }

  function toggleSidebar() {
    if (!panelElement) return;
    const isOpening = !panelElement.classList.contains('nv-copilot--sidebar-open');
    panelElement.classList.toggle('nv-copilot--sidebar-open', isOpening);
    const toggle = panelElement.querySelector('[data-sidebar-toggle]');
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(isOpening));
      toggle.setAttribute('aria-label', isOpening ? 'Close learning context' : 'Open learning context');
    }
  }

  function closeSidebar() {
    panelElement?.classList.remove('nv-copilot--sidebar-open');
    const toggle = panelElement?.querySelector('[data-sidebar-toggle]');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open learning context');
    }
  }

  function updateHistoryCount() {
    const countEl = panelElement?.querySelector('[data-copilot-history-count]');
    if (countEl) {
      countEl.textContent = String(interactionHistory.length);
    }
  }

  function openPanel() {
    if (!panelElement) return;
    isOpen = true;
    panelElement.classList.add('nv-copilot--open');
    panelElement.classList.add('nv-copilot--workspace');
    panelElement.setAttribute('aria-hidden', 'false');
    panelElement.inert = false;
    panelElement.removeAttribute('inert');
    document.querySelector('#nv-agent-trigger')?.setAttribute('aria-expanded', 'true');
    updateContextDisplay();
    updateSmartSuggestions();

    // Restore conversation from persistence
    if (runtimeBridge) {
      const restored = runtimeBridge.restoreSession();
      if (restored && restored.restored && restored.messages && restored.messages.length > 0) {
        restoreConversationFromPersistence(restored);
        showStatusIndicator('Restored conversation');
      }
    }

    const inputEl = panelElement.querySelector('#nv-agent-input');
    if (inputEl) inputEl.focus();
  }

  function restoreConversationFromPersistence(restored) {
    const messagesContainer = panelElement?.querySelector('[data-copilot-messages]');
    if (!messagesContainer) return;

    // Hide welcome if we have messages
    const welcomeEl = messagesContainer.querySelector('.nv-copilot__welcome');
    if (welcomeEl && restored.messages.length > 0) {
      welcomeEl.style.display = 'none';
    }

    // Render persisted messages
    for (const msg of restored.messages) {
      if (msg.type === 'user' && msg.contentPreview) {
        appendMessage('user', msg.contentPreview);
      } else if (msg.type === 'assistant' && msg.contentPreview) {
        appendMessage('assistant', msg.contentPreview);
      }
    }

    // Update history count
    updateHistoryCount();
  }

  function showStatusIndicator(message) {
    const messagesContainer = panelElement?.querySelector('[data-copilot-messages]');
    if (!messagesContainer) return;

    const status = document.createElement('div');
    status.className = 'nv-copilot__status-indicator';
    status.textContent = message;
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    messagesContainer.appendChild(status);

    // Remove after 3 seconds
    setTimeout(() => {
      status.classList.add('nv-copilot__status-indicator--fade');
      setTimeout(() => status.remove(), 300);
    }, 3000);
  }

  function closePanel() {
    if (!panelElement) return;
    isOpen = false;
    panelElement.classList.remove('nv-copilot--open');
    closeSidebar();
    panelElement.setAttribute('aria-hidden', 'true');
    panelElement.inert = true;
    panelElement.setAttribute('inert', '');
    document.querySelector('#nv-agent-trigger')?.setAttribute('aria-expanded', 'false');

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
    updateSmartSuggestions,
    getCurrentMode: () => currentMode,
    getCurrentStyle: () => currentStyle,
    getLastResult: () => lastResult,
    isDeveloperMode: () => isDeveloperMode,
    appendMessage,
    enhanceCodeBlocks,
    appendContextualRecommendations
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.renderMarkdown = renderMarkdown;
  window.NeuralVerse.formatMarkdown = formatMarkdown;
  window.NeuralVerse.escapeHtml = escapeHtml;
}

export {
  createAgentPanelController,
  renderMarkdown,
  formatMarkdown,
  escapeHtml
};
