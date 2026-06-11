/**
 * Hash-based router & View Controller
 */
class HashRouter {
  constructor(routes, stateManager) {
    this.routes = routes;
    this.stateManager = stateManager;
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRouting());
    window.addEventListener('load', () => this.handleRouting());
  }

  handleRouting() {
    const hash = window.location.hash || '#/';
    console.log(`Router resolving hash: ${hash}`);

    let matchedRoute = null;
    let matchedParams = {};

    for (const route of this.routes) {
      const match = hash.match(route.pattern);
      if (match) {
        matchedRoute = route;
        // Parse parameters if dynamic route
        if (route.path.includes(':')) {
          const keys = route.path.split('/').filter(part => part.startsWith(':')).map(key => key.substring(1));
          keys.forEach((key, index) => {
            matchedParams[key] = match[index + 1];
          });
        }
        break;
      }
    }

    if (matchedRoute) {
      if (matchedRoute.isImplemented) {
        this.stateManager.setCurrentRoute(matchedRoute, matchedParams);
      } else {
        console.warn(`Route ${matchedRoute.path} is defined but not implemented yet.`);
        this.stateManager.setCurrentRoute({
          id: 'not-found',
          path: hash,
          label: matchedRoute.label || 'Not Implemented',
          title: 'Route Not Implemented',
          description: `The route "${hash}" is defined in the registry but has not been implemented yet.`,
          region: 'R3 Workspace',
          isImplemented: false
        });
      }
    } else {
      console.error(`Route not found for: ${hash}`);
      this.stateManager.setCurrentRoute({
        id: 'not-found',
        path: hash,
        label: 'Not Found',
        title: '404 - Not Found',
        description: `The requested workspace node "${hash}" does not exist in the platform schema.`,
        region: 'R3 Workspace',
        isImplemented: false
      });
    }
  }

  navigate(path) {
    window.location.hash = path;
  }
}

class ViewController {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.container = document.querySelector('.nv-main-workspace');
    this.templates = {
      home: `
        <div class="nv-stack nv-stack--gap-md">
          <header class="nv-stack nv-stack--gap-xs">
            <h1 class="nv-context-title">Home Dashboard</h1>
            <p class="nv-muted">Select an operation node or access specialized educational sandboxes.</p>
          </header>
          <div class="nv-panel">
            <div class="nv-empty-state">
              <div class="nv-empty-state-icon" aria-hidden="true">🌌</div>
              <h2 class="nv-empty-state-title">Welcome to NeuralVerse</h2>
              <p class="nv-empty-state-description">
                NeuralVerse is an advanced agentic scientific platform designed to orchestrate reinforcement learning pipelines, cognitive modeling tasks, and specialized deep learning paths.
              </p>
              <a href="#/learning" class="nv-button" data-variant="primary">View Learning Paths</a>
            </div>
          </div>
        </div>
      `,
      learning: `
        <div class="nv-stack nv-stack--gap-md">
          <header class="nv-stack nv-stack--gap-xs">
            <h1 class="nv-context-title">Learning Paths</h1>
            <p class="nv-muted">Select an academic track to begin scientific and agentic training.</p>
          </header>
          <div class="nv-grid nv-grid--cols-2">
            <div class="nv-card">
              <span class="nv-badge" data-variant="info" style="align-self: flex-start;">Path 01</span>
              <h3>Reinforcement Learning & Agents</h3>
              <p class="nv-muted">Master Markov Decision Processes, Q-learning, Policy Gradients, and multi-agent system execution graphs.</p>
              <div style="margin-top: auto; padding-top: var(--sys-space-stack-sm);">
                <a href="#/modules" class="nv-button" data-variant="secondary">Explore Track</a>
              </div>
            </div>
            <div class="nv-card">
              <span class="nv-badge" data-variant="neutral" style="align-self: flex-start;">Path 02</span>
              <h3>Cognitive Architecture Models</h3>
              <p class="nv-muted">Investigate bio-inspired neural networks, attention mechanisms, and sparse memory registers.</p>
              <div style="margin-top: auto; padding-top: var(--sys-space-stack-sm);">
                <button class="nv-button" data-variant="secondary" disabled style="opacity: 0.5; cursor: not-allowed;">Locked</button>
              </div>
            </div>
          </div>
        </div>
      `,
      modules: `
        <div class="nv-stack nv-stack--gap-md">
          <header class="nv-stack nv-stack--gap-xs">
            <h1 class="nv-context-title">Course Modules</h1>
            <p class="nv-muted">Core study units and cognitive science guides.</p>
          </header>
          <div class="nv-stack nv-stack--gap-sm">
            <div class="nv-card">
              <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between;">
                <h3>Module 1: Foundations of Deep Learning</h3>
                <span class="nv-badge" data-variant="success">Completed</span>
              </div>
              <p class="nv-muted">Backpropagation algorithms, stochastic gradient descent, and activation functions catalog.</p>
            </div>
            <div class="nv-card">
              <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between;">
                <h3>Module 2: Agent Decision Processes</h3>
                <span class="nv-badge" data-variant="info">Active</span>
              </div>
              <p class="nv-muted">State representations, value approximation formulas, and exploration vs. exploitation metrics.</p>
              <div style="margin-top: var(--sys-space-stack-xs);">
                <a href="#/content" class="nv-button" data-variant="primary">Start Study</a>
              </div>
            </div>
            <div class="nv-card">
              <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between;">
                <h3>Module 3: Multi-Agent Environment Grids</h3>
                <span class="nv-badge" data-variant="neutral">Locked</span>
              </div>
              <p class="nv-muted">Cooperative swarm communication, game theory matrices, and emergent behaviors simulation.</p>
            </div>
          </div>
        </div>
      `,
      workspace: `
        <div class="nv-stack nv-stack--gap-md">
          <header class="nv-stack nv-stack--gap-xs">
            <h1 class="nv-context-title">Agent Workspace</h1>
            <p class="nv-muted">Deploy, configure, and monitor live AI agents in real-time.</p>
          </header>
          <div class="nv-grid nv-grid--cols-3">
            <div class="nv-card">
              <span class="nv-badge" data-variant="success" style="align-self: flex-start;">Active</span>
              <h3>Model Training</h3>
              <p class="nv-muted">Compute nodes status and epoch progression logging.</p>
            </div>
            <div class="nv-card">
              <span class="nv-badge" data-variant="info" style="align-self: flex-start;">Ready</span>
              <h3>Agent Orchestrator</h3>
              <p class="nv-muted">Coordinate agentic loops and decision boundary graphs.</p>
            </div>
            <div class="nv-card">
              <span class="nv-badge" data-variant="neutral" style="align-self: flex-start;">Idle</span>
              <h3>Dataset Sandbox</h3>
              <p class="nv-muted">Clean and query datasets for reinforcement learning input.</p>
            </div>
          </div>
          <div class="nv-panel">
            <div class="nv-empty-state">
              <div class="nv-empty-state-icon" aria-hidden="true">⚙</div>
              <h2 class="nv-empty-state-title">No Active Simulation</h2>
              <p class="nv-empty-state-description">
                Configure your environment node parameters in the sidebar or rail navigation to deploy an AI agent instance.
              </p>
              <button class="nv-button" data-variant="primary">Initialize Agent Loop</button>
            </div>
          </div>
        </div>
      `,
      content: `
        <div class="nv-stack nv-stack--gap-md">
          <header class="nv-stack nv-stack--gap-xs">
            <h1 class="nv-context-title">Content Viewer</h1>
            <p class="nv-muted">Access scientific publications, references, and guidebooks.</p>
          </header>
          <div class="nv-panel">
            <div style="max-width: var(--sys-a11y-reading-width-enhanced); margin-inline: auto; display: flex; flex-direction: column; gap: var(--sys-space-stack-md);">
              <div class="nv-cluster nv-cluster--gap-sm">
                <span class="nv-badge" data-variant="info">Guide</span>
                <span class="nv-badge" data-variant="neutral">5 min read</span>
              </div>
              <h2>Introduction to Reinforcement Learning (RL)</h2>
              <p>
                Reinforcement learning is an area of machine learning concerned with how intelligent agents ought to take actions in an environment in order to maximize the notion of cumulative reward. Reinforcement learning is one of three basic machine learning paradigms, alongside supervised learning and unsupervised learning.
              </p>
              <p>
                Unlike supervised learning, RL does not need labelled input/output pairs to be presented, and it does not need sub-optimal actions to be explicitly corrected. Instead, the focus is on finding a balance between exploration (of uncharted territory) and exploitation (of current knowledge).
              </p>
              <hr>
              <p class="nv-muted" style="font-size: var(--sys-font-caption-size);">
                References: Sutton, R. S. and Barto, A. G. (2018). Reinforcement Learning: An Introduction. MIT Press.
              </p>
            </div>
          </div>
        </div>
      `,
      'retrieval-playground': `
        <div class="nv-stack nv-stack--gap-md">
          <!-- Hero Header -->
          <header class="nv-stack nv-stack--gap-xs">
            <h1 class="nv-context-title">Retrieval Foundation Playground</h1>
            <p class="nv-muted">Explore semantic references, direct relational topologies, keyword indexes, and compiler evidence outputs.</p>
          </header>

          <!-- Hero Introduction Panel -->
          <section class="nv-panel nv-stack nv-stack--gap-sm" aria-labelledby="playground-intro-title">
            <h2 id="playground-intro-title" style="font-size: var(--ref-font-size-500); font-weight: var(--ref-font-weight-semibold); color: var(--sys-color-text-primary); margin: 0;">
              Retrieval Engine Core (NV-500)
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--sys-space-layout-gap); margin-top: var(--sys-space-stack-xs);">
              <div>
                <p style="font-size: var(--sys-font-body-size); line-height: var(--ref-font-line-height-relaxed); color: var(--sys-color-text-secondary); margin-bottom: var(--sys-space-stack-sm);">
                  The <strong>Retrieval Foundation (NV-500)</strong> acts as the persistent knowledge layer for NeuralVerse, structuring raw unstructured data into formal cognitive constructs.
                </p>
                <p style="font-size: var(--sys-font-body-size); line-height: var(--ref-font-line-height-relaxed); color: var(--sys-color-text-secondary);">
                  By isolating data registries and graph-based relationships from LLMs and agent controllers, it guarantees strict verification, tracing, and deterministic recall of factual context.
                </p>
              </div>
              <div>
                <p style="font-size: var(--sys-font-body-size); line-height: var(--ref-font-line-height-relaxed); color: var(--sys-color-text-secondary); margin-bottom: var(--sys-space-stack-sm);">
                  This simulation integrates a <strong>Reference Registry</strong> and a <strong>Relationship Graph</strong> with a fast keyword-scoring <strong>Retrieval Index</strong> to establish bidirectional linkages between nodes.
                </p>
                <p style="font-size: var(--sys-font-body-size); line-height: var(--ref-font-line-height-relaxed); color: var(--sys-color-text-secondary);">
                  The <strong>Evidence Compiler</strong> aggregates these elements to formulate structured context summaries, evaluating factual confidence levels for execution engines.
                </p>
              </div>
            </div>
          </section>

          <!-- Pipeline Visualization -->
          <section class="nv-panel" aria-labelledby="pipeline-title">
            <h3 id="pipeline-title" style="font-size: var(--sys-font-heading-size); font-weight: var(--sys-font-heading-weight); margin-bottom: var(--sys-space-stack-xs);">
              Knowledge Synthesis Pipeline
            </h3>
            <div class="retrieval-pipeline">
              <div class="pipeline-step">
                <div class="pipeline-step-badge">1</div>
                <h4>Reference Registry</h4>
                <p>Stores validated papers, codebase repos, and local study notes.</p>
              </div>
              <div class="pipeline-arrow" aria-hidden="true">➔</div>
              <div class="pipeline-step">
                <div class="pipeline-step-badge">2</div>
                <h4>Relationship Graph</h4>
                <p>Maps cross-document links, strengths, and citation context.</p>
              </div>
              <div class="pipeline-arrow" aria-hidden="true">➔</div>
              <div class="pipeline-step">
                <div class="pipeline-step-badge">3</div>
                <h4>Retrieval Index</h4>
                <p>Tokenizes and scores queries to identify key context matches.</p>
              </div>
              <div class="pipeline-arrow" aria-hidden="true">➔</div>
              <div class="pipeline-step">
                <div class="pipeline-step-badge">4</div>
                <h4>Evidence Compiler</h4>
                <p>Consolidates paths into a final research assistant insight.</p>
              </div>
            </div>
          </section>

          <!-- Seeded Dataset Panel -->
          <section class="nv-panel" aria-labelledby="seeded-dataset-title">
            <h3 id="seeded-dataset-title">Seeded Reference Corpora</h3>
            <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin-bottom: var(--sys-space-stack-xs);">
              Select any reference entity below to inspect its detailed metadata, outbound/inbound relationships, or compile its connections.
            </p>
            <div id="seeded-references-list" class="nv-grid nv-grid--cols-2" style="margin-top: var(--sys-space-stack-sm);" role="list">
              <!-- Dynamic list of seeded references -->
            </div>
          </section>

          <!-- Search and Compile Controls Panel -->
          <section class="nv-panel nv-stack nv-stack--gap-sm" aria-labelledby="controls-title">
            <h3 id="controls-title">Search & Compilation Control Console</h3>
            <div class="nv-cluster nv-cluster--gap-sm" style="align-items: center; width: 100%;">
              <input type="text" id="playground-search-input" class="nv-input" placeholder="Search topics (e.g. Transformer, nlp, vision, pytorch)..." style="flex: 1; min-width: 200px;" aria-label="Search references query" />
              <button id="playground-search-button" class="nv-button" data-variant="primary" aria-label="Search references">Search Registry</button>
              <button id="playground-compile-query-button" class="nv-button" data-variant="secondary" aria-label="Compile evidence from query">Compile From Query</button>
            </div>
            <div id="playground-search-feedback" class="nv-muted" style="font-size: var(--sys-font-caption-size); min-height: 1.2em;" aria-live="polite">
              No active query.
            </div>
          </section>

          <!-- Results Section -->
          <div class="playground-results-grid">
            <!-- Search Results Panel -->
            <section class="nv-panel nv-stack nv-stack--gap-xs" aria-labelledby="search-results-title">
              <h3 id="search-results-title">Search Results</h3>
              <div id="search-results-container">
                <!-- Search Results list or Empty State -->
              </div>
            </section>

            <!-- Selected Reference Panel -->
            <section class="nv-panel nv-stack nv-stack--gap-xs" aria-labelledby="selected-reference-title" style="display: flex; flex-direction: column;">
              <h3 id="selected-reference-title">Selected Reference</h3>
              <div id="selected-reference-container" style="flex: 1;">
                <!-- Selected Reference Details or Empty State -->
              </div>
              <div style="margin-top: var(--sys-space-stack-md);">
                <button id="playground-compile-ref-button" class="nv-button" data-variant="secondary" style="width: 100%;" disabled aria-label="Compile evidence from selected reference">
                  Compile From Selected Reference
                </button>
              </div>
            </section>

            <!-- Direct Relationships Panel -->
            <section class="nv-panel nv-stack nv-stack--gap-xs" aria-labelledby="relationships-title">
              <h3 id="relationships-title">Direct Graph Relationships</h3>
              <div id="relationships-container">
                <!-- Relationships list or Empty State -->
              </div>
            </section>
          </div>

          <!-- Evidence Compiler Panel -->
          <section class="nv-panel" aria-labelledby="evidence-compilation-title">
            <h3 id="evidence-compilation-title">Evidence Compiler Synthesis Output</h3>
            <div id="evidence-compilation-container" style="margin-top: var(--sys-space-stack-sm);">
              <!-- Compiled Evidence or Empty State -->
            </div>
          </section>
        </div>
      `,
      'not-found': `
        <div class="nv-stack nv-stack--gap-md">
          <header class="nv-stack nv-stack--gap-xs">
            <h1 class="nv-context-title">Route Resolution Fallback</h1>
            <p class="nv-muted">Platform node or view is currently unavailable.</p>
          </header>
          <div class="nv-panel">
            <div class="nv-empty-state">
              <div class="nv-empty-state-icon" aria-hidden="true">⚠️</div>
              <h2 class="nv-empty-state-title">Node Not Found</h2>
              <p class="nv-empty-state-description">
                The workspace or route path you selected does not exist or has not been fully implemented in this MVP v0.1 release.
              </p>
              <a href="#/" class="nv-button" data-variant="primary">Return Home</a>
            </div>
          </div>
        </div>
      `
    };
    this.init();
  }

  init() {
    this.stateManager.subscribe((state) => this.render(state));
  }

  async render(state) {
    this.container = document.querySelector('#nv-workspace-content-body') || document.querySelector('.nv-main-workspace');
    if (!this.container) return;

    const route = state.currentRoute;
    if (!route) return;

    const viewId = route.id === 'not-found' ? 'not-found' : (route.isImplemented ? route.id : 'not-found');
    console.log(`Rendering view: ${viewId}`);

    // Attempt to load from static files
    try {
      const response = await fetch(`./pages/${viewId}.html`);
      if (response.ok) {
        const html = await response.text();
        this.container.innerHTML = html;
        return;
      }
    } catch (e) {
      console.warn(`Fetch failed (likely file:// protocol CORS limit). Falling back to inline JS template for: ${viewId}`);
    }

    // Fallback to inline template
    const template = this.templates[viewId] || this.templates['not-found'];
    this.container.innerHTML = template;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const router = new HashRouter(window.ROUTES || [], window.navigationState);
  window.router = router;

  const viewController = new ViewController(window.navigationState);
  window.viewController = viewController;
});
