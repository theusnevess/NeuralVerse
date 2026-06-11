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
          <header class="nv-cluster nv-cluster--gap-md" style="justify-content: space-between; align-items: center; width: 100%;">
            <div class="nv-stack nv-stack--gap-xs">
              <h1 class="nv-context-title" style="margin: 0;">Retrieval Workspace</h1>
              <p class="nv-muted" style="margin: 0;">Advanced Knowledge Exploration and Evidence Synthesis Environment.</p>
            </div>
            <div class="nv-cluster nv-cluster--gap-sm" style="align-items: center;">
              <span id="session-restored-indicator" class="nv-badge" data-variant="success" style="opacity: 0; transition: opacity 0.5s ease; font-size: 0.65rem;">Session Restored</span>
              <button id="playground-clear-session-button" class="nv-button" data-variant="secondary" style="font-size: 0.75rem; padding: 4px 10px; min-block-size: unset;" aria-label="Clear active session data">Clear Session</button>
            </div>
          </header>

          <!-- Knowledge Synthesis Pipeline (Compact & Collapsible) -->
          <details class="nv-panel" style="background-color: var(--sys-color-surface-container-low); border: var(--sys-border-subtle) solid var(--sys-color-border-subtle);">
            <summary style="font-size: var(--sys-font-body-size); font-weight: var(--ref-font-weight-semibold); color: var(--sys-color-text-primary); cursor: pointer; user-select: none;">
              View Pipeline Infrastructure (NV-500 Core)
            </summary>
            <div style="margin-top: var(--sys-space-stack-sm);">
              <p style="font-size: var(--sys-font-caption-size); color: var(--sys-color-text-secondary); margin-bottom: var(--sys-space-stack-sm);">
                The NV-500 Retrieval Foundation isolates data registries and citation topology from LLMs, ensuring verifiable, deterministic research compilation.
              </p>
              <div class="retrieval-pipeline">
                <div class="pipeline-step">
                  <div class="pipeline-step-badge">1</div>
                  <h4>Reference Registry</h4>
                  <p>Stores papers, repositories, and local study notes.</p>
                </div>
                <div class="pipeline-arrow" aria-hidden="true">➔</div>
                <div class="pipeline-step">
                  <div class="pipeline-step-badge">2</div>
                  <h4>Relationship Graph</h4>
                  <p>Maps cross-document links, strength, and citation context.</p>
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
            </div>
          </details>

          <!-- Canonical Workspace Grid Layout -->
          <div class="workspace-layout">

            <!-- Region 2: Exploration Space -->
            <main class="exploration-space" aria-label="Exploration Space">

              <!-- Exploration Switcher Tabs -->
              <div class="workspace-tabs" role="tablist" aria-label="Exploration Modes">
                <button class="workspace-tab active" data-mode="search" role="tab" aria-selected="true" id="tab-search">Search Mode</button>
                <button class="workspace-tab" data-mode="graph" role="tab" aria-selected="false" id="tab-graph">Graph Mode</button>
                <button class="workspace-tab" data-mode="discovery" role="tab" aria-selected="false" id="tab-discovery">Discovery Mode</button>
                <button class="workspace-tab" data-mode="compare" role="tab" aria-selected="false" id="tab-compare">Compare Mode</button>
              </div>

              <!-- Mode 1: Search Mode -->
              <section id="mode-search" class="exploration-mode active" aria-labelledby="tab-search">
                <!-- Search and Compile Controls Console -->
                <div class="nv-panel nv-stack nv-stack--gap-sm">
                  <h3 style="margin: 0; font-size: var(--sys-font-body-size);">Search Console</h3>
                  <div class="nv-cluster nv-cluster--gap-sm" style="align-items: center; width: 100%;">
                    <input type="text" id="playground-search-input" class="nv-input" placeholder="Search references..." style="flex: 1; min-width: 200px;" aria-label="Search query" />
                    <button id="playground-search-button" class="nv-button" data-variant="primary" aria-label="Search Registry">Search Registry</button>
                    <button id="playground-save-query-button" class="nv-button" data-variant="secondary" style="background-color: var(--sys-color-surface-container-high); color: var(--sys-color-text-primary);" aria-label="Save current search query" disabled>Save Query</button>
                    <button id="playground-compile-query-button" class="nv-button" data-variant="secondary" aria-label="Compile Evidence from Query">Compile From Query</button>
                  </div>
                  <div id="playground-search-feedback" class="nv-muted" style="font-size: var(--sys-font-caption-size); min-height: 1.2em;" aria-live="polite">
                    No active query.
                  </div>
                </div>

                <!-- Search Results Grid -->
                <div class="nv-panel">
                  <h3 style="margin: 0 0 var(--sys-space-stack-xs) 0; font-size: var(--sys-font-body-size);">Search Results</h3>
                  <div id="search-results-container" class="playground-results-grid">
                    <!-- Dynamic search results lists or empty state -->
                  </div>
                </div>

                <!-- Seeded Reference List inside Search Mode for easy browsing -->
                <div class="nv-panel">
                  <h3 style="margin: 0 0 var(--sys-space-stack-xs) 0; font-size: var(--sys-font-body-size);">Reference Registry Database</h3>
                  <div id="seeded-references-list" class="nv-grid nv-grid--cols-2">
                    <!-- Dynamic seeded list of references -->
                  </div>
                </div>
              </section>

              <!-- Mode 2: Graph Mode -->
              <section id="mode-graph" class="exploration-mode" aria-labelledby="tab-graph">
                <div class="nv-panel nv-stack nv-stack--gap-xs">
                  <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: var(--sys-font-body-size);">Interactive Topology Graph</h3>
                    <span class="nv-muted" style="font-size: var(--sys-font-caption-size);">Click nodes to select. Shift-click to trace.</span>
                  </div>
                  <div class="graph-container">
                    <svg id="visual-graph-svg" class="graph-svg" aria-label="Reference network topology graph">
                      <!-- Graph links and nodes will be dynamically injected here -->
                    </svg>
                  </div>
                </div>
              </section>

              <!-- Mode 3: Discovery Mode -->
              <section id="mode-discovery" class="exploration-mode" aria-labelledby="tab-discovery">
                <div class="nv-panel nv-stack nv-stack--gap-sm">
                  <h3 style="margin: 0; font-size: var(--sys-font-body-size);">Research Discovery Dashboard</h3>
                  <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">Automated topological telemetry and quick recommendations.</p>
                  <div class="nv-grid nv-grid--cols-3" style="gap: var(--sys-space-stack-sm); margin-top: var(--sys-space-stack-xs);">
                    <div class="nv-card" style="cursor: default;">
                      <h5 style="margin: 0 0 4px 0; font-size: 0.65rem;">Registry Size</h5>
                      <p style="margin: 0; font-size: 1.25rem; font-weight: var(--ref-font-weight-bold); color: var(--sys-color-accent-primary);" id="discovery-stat-size">0</p>
                    </div>
                    <div class="nv-card" style="cursor: default;">
                      <h5 style="margin: 0 0 4px 0; font-size: 0.65rem;">Relation Count</h5>
                      <p style="margin: 0; font-size: 1.25rem; font-weight: var(--ref-font-weight-bold); color: var(--sys-color-accent-primary);" id="discovery-stat-relations">0</p>
                    </div>
                    <div class="nv-card" style="cursor: default;">
                      <h5 style="margin: 0 0 4px 0; font-size: 0.65rem;">Graph Density</h5>
                      <p style="margin: 0; font-size: 1.25rem; font-weight: var(--ref-font-weight-bold); color: var(--sys-color-accent-primary);" id="discovery-stat-density">0.00</p>
                    </div>
                  </div>
                  <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs);"></div>
                  <div>
                    <h4 style="font-size: var(--sys-font-caption-size); text-transform: uppercase; color: var(--sys-color-text-secondary); margin-bottom: var(--sys-space-stack-xs);">Key Research Anchors</h4>
                    <div id="discovery-anchors-container" class="nv-stack nv-stack--gap-xs">
                      <!-- Recommended read files dynamic list -->
                    </div>
                  </div>
                </div>
              </section>

              <!-- Mode 4: Compare Mode -->
              <section id="mode-compare" class="exploration-mode" aria-labelledby="tab-compare">
                <div class="nv-panel nv-stack nv-stack--gap-sm">
                  <h3 style="margin: 0; font-size: var(--sys-font-body-size);">Cross-Reference Comparison</h3>
                  <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">Compare type, status, citations, and metadata details side-by-side.</p>
                  <div style="overflow-x: auto;">
                    <table class="compare-table" id="compare-workspace-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Source</th>
                          <th>Direct Relations</th>
                        </tr>
                      </thead>
                      <tbody id="compare-table-body">
                        <!-- Dynamically populated reference rows -->
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

            </main>

            <!-- Region 3: Inspector Space -->
            <aside class="inspector-space" aria-label="Inspector Space">

              <!-- Inspector Tabs -->
              <div class="inspector-tabs" role="tablist" aria-label="Inspector Panels">
                <button class="inspector-tab active" data-tab="reference" role="tab" aria-selected="true" id="tab-insp-ref">Reference</button>
                <button class="inspector-tab" data-tab="evidence" role="tab" aria-selected="false" id="tab-insp-ev">Evidence</button>
                <button class="inspector-tab" data-tab="relationship" role="tab" aria-selected="false" id="tab-insp-rel">Relationship</button>
              </div>

              <!-- Panel 1: Reference Inspector -->
              <section id="inspector-panel-reference" class="inspector-panel active" aria-labelledby="tab-insp-ref">
                <div id="selected-reference-container" style="flex: 1;">
                  <!-- Active reference state details -->
                </div>
                <!-- Discovery Space (Carousel, Related, Similar, Citation Continuations, Dead-End Suggestions) -->
                <div id="discovery-container" class="nv-stack nv-stack--gap-xs" style="margin-top: var(--sys-space-stack-sm);"></div>
                <div class="nv-stack nv-stack--gap-xs" style="margin-top: var(--sys-space-stack-md); padding-top: var(--sys-space-stack-sm); border-top: var(--sys-border-subtle) solid var(--sys-color-border-subtle);">
                  <div class="nv-cluster nv-cluster--gap-sm">
                    <button id="playground-pin-button" class="nv-button" data-variant="secondary" style="flex: 1;" disabled>
                      Pin Reference
                    </button>
                    <button id="playground-compile-ref-button" class="nv-button" data-variant="primary" style="flex: 1;" disabled>
                      Compile Evidence
                    </button>
                  </div>
                </div>
              </section>

              <!-- Panel 2: Evidence Inspector -->
              <section id="inspector-panel-evidence" class="inspector-panel" aria-labelledby="tab-insp-ev">
                <div id="evidence-compilation-container" style="flex: 1;">
                  <!-- Evidence Compiler detailed output -->
                </div>
              </section>

              <!-- Panel 3: Relationship Inspector -->
              <section id="inspector-panel-relationship" class="inspector-panel" aria-labelledby="tab-insp-rel">
                <div id="selected-relationship-container" style="flex: 1;">
                  <!-- Selected direct citation link details -->
                </div>
                <!-- Relationship Neighborhood Container -->
                <div id="relationship-neighborhood-container" class="nv-stack nv-stack--gap-xs" style="margin-top: var(--sys-space-stack-sm);"></div>
              </section>

            </aside>

          </div>

          <!-- Region 4: Research Memory Layer -->
          <footer class="memory-layer" aria-label="Research Memory Layer">
            <div class="memory-grid">
              <!-- Column 1: Pinned References -->
              <div class="memory-column">
                <h4>Pinned References</h4>
                <ul id="memory-pinned-list" class="memory-list" aria-label="Pinned references">
                  <!-- Dynamic pinned list -->
                </ul>
              </div>

              <!-- Column 2: Recently Viewed -->
              <div class="memory-column">
                <h4>Recently Viewed</h4>
                <ul id="memory-recent-list" class="memory-list" aria-label="Recently viewed references">
                  <!-- Dynamic recently viewed list -->
                </ul>
              </div>

              <!-- Column 3: Saved Queries -->
              <div class="memory-column">
                <h4>Saved Queries</h4>
                <ul id="memory-queries-list" class="memory-list" aria-label="Saved queries">
                  <!-- Dynamic saved search queries list -->
                </ul>
              </div>

              <!-- Column 4: Knowledge Trail -->
              <div class="memory-column">
                <div class="nv-cluster nv-cluster--gap-xs" style="justify-content: space-between; align-items: center; margin-bottom: var(--sys-space-stack-xs);">
                  <h4 style="margin: 0;">Knowledge Trail</h4>
                  <button id="playground-clear-trail-button" class="nv-button" data-variant="secondary" style="padding: 1px 4px; font-size: 0.6rem; min-block-size: unset;" aria-label="Clear knowledge trail logs">Clear</button>
                </div>
                <ul id="memory-trail-list" class="memory-list" style="max-height: 180px; overflow-y: auto;" aria-label="Knowledge trail activity log">
                  <!-- Dynamic knowledge trail activity log -->
                </ul>
              </div>
            </div>
          </footer>

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
