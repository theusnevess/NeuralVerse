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
