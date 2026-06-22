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
    if (window.NV_DEBUG) console.log(`Router resolving hash: ${hash}`);

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
        if (window.NV_DEBUG) console.warn(`Route ${matchedRoute.path} is defined but not implemented yet.`);
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
      if (window.NV_DEBUG) console.warn(`Route not found for: ${hash}`);
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
    this.routeTransitionCleanup = null;
    this.templates = {
      home: `
        <div class="nv-stack nv-stack--gap-md nv-hero-observatory">
          <header class="nv-stack nv-stack--gap-xs">
          </header>
          <div class="nv-panel">
            <div class="nv-empty-state nv-hero-brand-lockup">
              <div class="nv-empty-state__visual nv-brand-home-visual" aria-hidden="true">
                <img src="assets/brand/neuralverse-lockup.png" alt="">
              </div>
              <p class="nv-empty-state__message">
                NeuralVerse is an advanced agentic scientific platform designed to orchestrate reinforcement learning pipelines, cognitive modeling tasks, and specialized deep learning paths.
              </p>
              <div class="nv-empty-state__actions">
                <a href="#/learning" class="nv-button" data-variant="primary">View Learning Paths</a>
              </div>
            </div>
          </div>
        </div>
      `,
      learning: `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md" data-curriculum-root></div>
        </div>
      `,
      'learning-detail': `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md" data-curriculum-root></div>
        </div>
      `,
      'learning-path': `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md" data-curriculum-root></div>
        </div>
      `,
      'lesson-detail': `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md" data-curriculum-root></div>
        </div>
      `,
      'artifact-detail': `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md" data-curriculum-root></div>
        </div>
      `,
      modules: `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md" data-curriculum-root></div>
        </div>
      `,
      'module-detail': `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md" data-curriculum-root></div>
        </div>
      `,
      workspace: `
        <div class="nv-stack nv-stack--gap-md">
          <h1 class="nv-sr-only">Workspace</h1>
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
              <div class="nv-empty-state__visual" aria-hidden="true">
                <svg viewBox="0 0 100 100" width="80" height="80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto;" aria-hidden="true">
                  <rect x="25" y="25" width="50" height="50" rx="6" stroke="rgba(138, 180, 248, 0.2)" stroke-width="1.5" stroke-dasharray="3 3"/>
                  <circle cx="50" cy="50" r="15" stroke="var(--sys-color-accent-primary)" stroke-width="1.75"/>
                  <line x1="50" y1="20" x2="50" y2="35" stroke="var(--sys-color-accent-primary)" stroke-width="1.75"/>
                  <line x1="50" y1="65" x2="50" y2="80" stroke="var(--sys-color-accent-primary)" stroke-width="1.75"/>
                  <line x1="20" y1="50" x2="35" y2="50" stroke="var(--sys-color-accent-primary)" stroke-width="1.75"/>
                  <line x1="65" y1="50" x2="80" y2="50" stroke="var(--sys-color-accent-primary)" stroke-width="1.75"/>
                </svg>
              </div>
              <h4 class="nv-empty-state__title">No Active Simulation</h4>
              <p class="nv-empty-state__message">
                Configure your environment node parameters in the sidebar or rail navigation to deploy an AI agent instance.
              </p>
              <div class="nv-empty-state__actions">
                <button class="nv-button" data-variant="primary">Initialize Agent Loop</button>
              </div>
            </div>
          </div>
        </div>
      `,
      content: `
        <div class="nv-stack nv-stack--gap-md">
          <h1 class="nv-sr-only">Content Viewer</h1>
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
        <div class="nv-stack nv-stack--gap-md nv-topology-bg" style="min-height: 100vh;">
          <!-- Resume Banner Placement -->
          <div id="resume-banner-container"></div>

          <!-- Hero Header -->
          <header class="nv-cluster nv-cluster--gap-md" style="justify-content: space-between; align-items: center; width: 100%;">
            <div class="nv-stack nv-stack--gap-xs">
              <h1 class="nv-sr-only">Retrieval Workspace</h1>
            </div>
            <div class="nv-cluster nv-cluster--gap-sm" style="align-items: center;">
              <span id="session-restored-indicator" class="nv-badge" data-variant="success" style="opacity: 0; transition: opacity 0.5s ease; font-size: 0.65rem;">Session Restored</span>
              <button id="playground-focus-button" class="nv-button" data-variant="secondary" style="font-size: 0.75rem; padding: 4px 10px; min-block-size: unset;" aria-label="Toggle focus mode">Focus Mode</button>
              <button id="playground-preferences-button" class="nv-button" data-variant="secondary" style="font-size: 0.75rem; padding: 4px 10px; min-block-size: unset;" aria-label="Toggle workspace preferences">⚙ Prefs</button>
              <button id="playground-clear-session-button" class="nv-button" data-variant="secondary" style="font-size: 0.75rem; padding: 4px 10px; min-block-size: unset;" aria-label="Clear active session data">Clear Session</button>
            </div>
          </header>

          <!-- Preferences Panel -->
          <div id="preferences-panel" class="nv-panel nv-stack nv-stack--gap-sm" style="display: none; background-color: var(--sys-color-surface-container-high); border: 1px solid var(--sys-color-border-subtle); margin-bottom: 2px;">
            <h3 style="margin: 0; font-size: var(--sys-font-body-size);">Workspace Preferences</h3>
            <div class="nv-grid nv-grid--cols-3" style="gap: var(--sys-space-stack-sm);">
              <div class="nv-stack nv-stack--gap-xs">
                <label for="pref-default-mode" style="font-size: 0.65rem; color: var(--sys-color-text-secondary);">Default Mode:</label>
                <select id="pref-default-mode" class="nv-input" style="font-size: 0.7rem; padding: 2px 6px; min-block-size: unset;">
                  <option value="search">Search Mode</option>
                  <option value="graph">Graph Mode</option>
                  <option value="discovery">Discovery Mode</option>
                  <option value="compare">Compare Mode</option>
                </select>
              </div>
              <div class="nv-stack nv-stack--gap-xs">
                <label for="pref-default-tab" style="font-size: 0.65rem; color: var(--sys-color-text-secondary);">Default Inspector Tab:</label>
                <select id="pref-default-tab" class="nv-input" style="font-size: 0.7rem; padding: 2px 6px; min-block-size: unset;">
                  <option value="reference">Reference</option>
                  <option value="evidence">Evidence</option>
                  <option value="relationship">Relationship</option>
                </select>
              </div>
              <div class="nv-stack nv-stack--gap-xs">
                <label for="pref-density" style="font-size: 0.65rem; color: var(--sys-color-text-secondary);">Layout Density:</label>
                <select id="pref-density" class="nv-input" style="font-size: 0.7rem; padding: 2px 6px; min-block-size: unset;">
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
              <div class="nv-stack nv-stack--gap-xs">
                <label for="pref-relationship-filter" style="font-size: 0.65rem; color: var(--sys-color-text-secondary);">Default Relation Filter:</label>
                <select id="pref-relationship-filter" class="nv-input" style="font-size: 0.7rem; padding: 2px 6px; min-block-size: unset;">
                  <option value="all">All Relationships</option>
                  <option value="cites">Cites</option>
                  <option value="supports">Supports / Uses</option>
                  <option value="contrasts">Contrasts</option>
                  <option value="implements">Implements</option>
                  <option value="depends_on">Depends On / Extends</option>
                  <option value="related">Related</option>
                </select>
              </div>
              <div class="nv-stack nv-stack--gap-xs" style="justify-content: center;">
                <label style="font-size: 0.65rem; color: var(--sys-color-text-secondary); display: flex; align-items: center; gap: var(--sys-space-inline-xs); cursor: pointer;">
                  <input type="checkbox" id="pref-auto-open" checked /> Auto-open Inspector
                </label>
              </div>
              <div class="nv-stack nv-stack--gap-xs">
                <label for="pref-inspector-width" style="font-size: 0.65rem; color: var(--sys-color-text-secondary);">Inspector Width:</label>
                <select id="pref-inspector-width" class="nv-input" style="font-size: 0.7rem; padding: 2px 6px; min-block-size: unset;">
                  <option value="300px">Narrow (300px)</option>
                  <option value="340px">Standard (340px)</option>
                  <option value="420px">Wide (420px)</option>
                  <option value="480px">Extra Wide (480px)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Custom Quick Actions Bar -->
          <div class="quick-actions-bar nv-cluster nv-cluster--gap-xs" style="align-items: center; justify-content: space-between; margin-bottom: 2px;">
            <div id="quick-actions-list" class="nv-cluster nv-cluster--gap-xs"></div>
            <button id="customize-actions-button" class="nv-button" data-variant="ghost" style="padding: 2px 8px; font-size: 0.65rem; min-block-size: unset;" aria-label="Customize pinned quick actions">Customize Shortcuts</button>
          </div>
          <div id="quick-actions-customize-panel" class="nv-panel" style="display: none; background-color: var(--sys-color-surface-container-high); padding: var(--sys-space-stack-xs); border: 1px dashed var(--sys-color-border-subtle); margin-bottom: 4px;">
            <h4 style="margin: 0 0 var(--sys-space-stack-xs) 0; font-size: 0.7rem; color: var(--sys-color-text-secondary);">Toggle Quick Actions</h4>
            <div class="nv-cluster nv-cluster--gap-sm" id="customize-checkboxes-container"></div>
          </div>

          <!-- Research Live Snapshot -->
          <div id="research-snapshot-container" class="nv-panel nv-workspace-dashboard-shell">
          </div>


          <!-- Knowledge Synthesis Pipeline (Compact & Collapsible) -->
          <details class="nv-panel" style="background-color: var(--sys-color-surface-container-low); border: var(--sys-border-subtle) solid var(--sys-color-border-subtle);">
            <summary style="font-size: var(--sys-font-body-size); font-weight: var(--ref-font-weight-semibold); color: var(--sys-color-text-primary); cursor: pointer; user-select: none;">
              Research Pipeline
            </summary>
            <div style="margin-top: var(--sys-space-stack-sm);">
              <p style="font-size: var(--sys-font-caption-size); color: var(--sys-color-text-secondary); margin-bottom: var(--sys-space-stack-sm);">
                Your investigation connects sources, explores relationships, finds relevant context, and synthesizes evidence into research-ready insight.
              </p>
              <div class="retrieval-pipeline">
                <div class="pipeline-step">
                  <div class="pipeline-step-badge">1</div>
                  <h4>Collect Sources</h4>
                  <p>Gather papers, notes, documentation, and research materials.</p>
                </div>
                <div class="pipeline-arrow" aria-hidden="true">➔</div>
                <div class="pipeline-step">
                  <div class="pipeline-step-badge">2</div>
                  <h4>Explore Connections</h4>
                  <p>Identify semantic links, citations, and related concepts.</p>
                </div>
                <div class="pipeline-arrow" aria-hidden="true">➔</div>
                <div class="pipeline-step">
                  <div class="pipeline-step-badge">3</div>
                  <h4>Find Relevant Context</h4>
                  <p>Surface the information most relevant to your query.</p>
                </div>
                <div class="pipeline-arrow" aria-hidden="true">➔</div>
                <div class="pipeline-step">
                  <div class="pipeline-step-badge">4</div>
                  <h4>Synthesize Evidence</h4>
                  <p>Combine findings into a coherent research summary.</p>
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
                <button class="workspace-tab" data-mode="presentation" role="tab" aria-selected="false" id="tab-presentation">Presentation</button>
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
                  <h3 style="margin: 0 0 var(--sys-space-stack-xs) 0; font-size: var(--sys-font-body-size);">Reference Library</h3>
                  <div id="seeded-references-list" class="nv-grid nv-grid--cols-2">
                    <!-- Dynamic seeded list of references -->
                  </div>
                </div>
              </section>

              <!-- Mode 2: Graph Mode -->
              <section id="mode-graph" class="exploration-mode" aria-labelledby="tab-graph">
                <div class="nv-panel nv-stack nv-stack--gap-xs" style="position: relative;">
                  <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between; align-items: center; flex-wrap: wrap; width: 100%;">
                    <h3 style="margin: 0; font-size: var(--sys-font-body-size);">Interactive Topology Graph</h3>
                    <!-- Graph Controls: Filters & Hop selector -->
                    <div class="nv-cluster nv-cluster--gap-xs" style="align-items: center;">
                      <!-- Filter Select -->
                      <label for="graph-filter-select" style="font-size: 0.65rem; color: var(--sys-color-text-secondary);">Filter:</label>
                      <select id="graph-filter-select" class="nv-input" style="padding: 2px 6px; font-size: 0.65rem; min-block-size: unset; width: auto;" aria-label="Filter relationships by type">
                        <option value="all">All Relationships</option>
                        <option value="cites">Cites</option>
                        <option value="supports">Supports / Uses</option>
                        <option value="contrasts">Contrasts</option>
                        <option value="implements">Implements</option>
                        <option value="depends_on">Depends On / Extends</option>
                        <option value="related">Related</option>
                      </select>

                      <!-- Hop Depth Select -->
                      <label for="graph-hop-select" style="font-size: 0.65rem; color: var(--sys-color-text-secondary); margin-left: var(--sys-space-inline-xs);">Depth:</label>
                      <select id="graph-hop-select" class="nv-input" style="padding: 2px 6px; font-size: 0.65rem; min-block-size: unset; width: auto;" aria-label="Graph neighborhood expansion depth">
                        <option value="full">Full Graph</option>
                        <option value="1-hop">1-Hop Neighbors</option>
                        <option value="2-hop">2-Hop Neighbors</option>
                      </select>
                    </div>
                  </div>
                  <!-- Progressive Filter Chips Container -->
                  <div id="graph-filter-chips-container" class="nv-cluster nv-cluster--gap-xs" style="display: none; align-items: center; padding: 2px 0; margin-bottom: var(--sys-space-stack-xs);"></div>
                  <div class="graph-container nv-scientific-panel" style="position: relative; overflow: hidden; min-height: 480px;">
                    <svg id="visual-graph-svg" class="graph-svg" aria-label="Reference network topology graph" style="display: block; width: 100%; height: 100%;">
                      <!-- Graph links and nodes will be dynamically injected here -->
                    </svg>
                    <!-- Graph Empty State Overlay -->
                    <div id="graph-empty-state-overlay" class="nv-empty-state" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; background-color: var(--sys-color-surface-container-lowest); border: 1px dashed var(--sys-color-border-subtle); z-index: 5; pointer-events: auto; padding: 20px; text-align: center; border-radius: 8px;">
                      <div class="nv-empty-state-icon" aria-hidden="true" style="font-size: 1.5rem; margin-bottom: 8px;">🕸️</div>
                      <p id="graph-empty-state-message" class="nv-muted" style="font-size: var(--sys-font-body-size); font-weight: var(--ref-font-weight-medium); color: var(--sys-color-text-primary); margin-bottom: var(--sys-space-stack-xs);">No Selected Reference</p>
                      <p id="graph-empty-state-subtext" class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;"></p>
                    </div>
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
                <div id="compare-workspace-container" class="nv-panel nv-stack nv-stack--gap-sm"></div>
              </section>

              <!-- Mode 5: Research Presentation Mode -->
              <section id="mode-presentation" class="exploration-mode" aria-labelledby="tab-presentation">
                <div id="presentation-container" class="nv-panel nv-stack nv-stack--gap-sm"></div>
              </section>

            </main>

            <!-- Region 3: Inspector Space Column Wrapper -->
            <div class="inspector-column">
              <aside class="inspector-space nv-scientific-panel" aria-label="Inspector Space">

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

          </div>

          <!-- Region 4: Research Memory Layer -->
          <footer class="memory-layer" aria-label="Research Memory Layer" id="memory-layer-section">
            <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between; align-items: center; margin-bottom: var(--sys-space-stack-xs); border-bottom: var(--sys-border-subtle) solid var(--sys-color-border-subtle); padding-bottom: 4px;">
              <h3 style="margin: 0; font-size: var(--sys-font-body-size); color: var(--sys-color-text-primary);">Research Memory Layer</h3>
              <button id="memory-toggle-collapse-button" class="nv-button" data-variant="ghost" style="padding: 2px 6px; font-size: 0.65rem; min-block-size: unset;" aria-label="Toggle memory layer visibility">Collapse Layer</button>
            </div>
            <div class="memory-grid" id="memory-layer-grid">
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
          <h1 class="nv-sr-only">Page not found</h1>
          <div class="nv-panel">
            <div class="nv-empty-state">
              <div class="nv-empty-state__visual" aria-hidden="true">
                <svg viewBox="0 0 100 100" width="80" height="80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto;" aria-hidden="true">
                  <polygon points="50,15 90,85 10,85" stroke="var(--sys-color-semantic-error, #f28b82)" stroke-width="1.75" stroke-linejoin="round"/>
                  <line x1="50" y1="35" x2="50" y2="60" stroke="var(--sys-color-semantic-error, #f28b82)" stroke-width="2"/>
                  <circle cx="50" cy="73" r="3" fill="var(--sys-color-semantic-error, #f28b82)"/>
                </svg>
              </div>
              <h4 class="nv-empty-state__title">Page not found</h4>
              <p class="nv-empty-state__message">
                The destination you selected is not available.
              </p>
              <div class="nv-empty-state__actions">
                <a href="#/" class="nv-button" data-variant="primary">Return Home</a>
              </div>
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
    if (window.NV_DEBUG) console.log(`Rendering view: ${viewId}`);

    let rendered = false;
    // Attempt to load from static files
    try {
      const pathParts = window.location.pathname.split('/');
      let dirPath = '';
      if (window.location.pathname.endsWith('/')) {
        dirPath = window.location.pathname;
      } else {
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart.includes('.') || lastPart === '') {
          dirPath = pathParts.slice(0, -1).join('/') + '/';
        } else {
          dirPath = pathParts.join('/') + '/';
        }
      }
      const response = await fetch(`${dirPath}pages/${viewId}.html?v=10`);
      if (response.ok) {
        const html = await response.text();
        this.container.innerHTML = html;
        rendered = true;
      }
    } catch (e) {
      if (window.NV_DEBUG) console.warn(`Fetch failed (likely file:// protocol CORS limit). Falling back to inline JS template for: ${viewId}`);
    }

    // Fallback to inline template
    if (!rendered) {
      const template = this.templates[viewId] || this.templates['not-found'];
      this.container.innerHTML = template;
    }

    this.applyRouteTransition(viewId);

    // Dispatch custom event to notify all components that page content has been rendered
    window.dispatchEvent(new CustomEvent('nv:routerendered', { detail: { routeId: viewId } }));
    window.NeuralVerseBackground?.neuralGalaxy?.refresh?.({
      route: window.location.hash || '#/',
      routeId: viewId
    });
  }

  applyRouteTransition(viewId) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.routeTransitionCleanup) {
      this.routeTransitionCleanup();
      this.routeTransitionCleanup = null;
    }

    this.container.dataset.routeTransitionView = viewId;
    this.container.classList.remove('nv-route-enter');
    this.container.style.opacity = '';

    if (prefersReducedMotion) {
      return;
    }

    // Restart the lightweight enter animation after content is already rendered.
    this.container.offsetHeight;
    this.container.classList.add('nv-route-enter');

    const finish = () => {
      this.container.classList.remove('nv-route-enter');
      this.container.removeEventListener('animationend', finish);
      this.routeTransitionCleanup = null;
    };

    this.routeTransitionCleanup = () => {
      this.container.classList.remove('nv-route-enter');
      this.container.removeEventListener('animationend', finish);
    };

    this.container.addEventListener('animationend', finish);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const router = new HashRouter(window.ROUTES || [], window.navigationState);
  window.router = router;

  const viewController = new ViewController(window.navigationState);
  window.viewController = viewController;
});
