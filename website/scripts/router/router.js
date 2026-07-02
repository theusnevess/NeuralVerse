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
<section class="nv-home nv-home-v3" data-home-root>
  <!-- Hero Section with Composition Layout -->
  <section class="nv-home-hero" aria-labelledby="home-v3-title">
    <div class="nv-hero-content">
      <div class="nv-observatory-badge">
        <span class="nv-badge-dot"></span>
        <span class="nv-badge-text">Platform Registry v3.0 // Active Observatory</span>
      </div>
      
      <h1 id="home-v3-title" class="nv-hero-title">
        A Governed Knowledge Observatory for AI Engineering.
      </h1>
      
      <p class="nv-hero-subtitle">
        NeuralVerse turns AI research, curriculum, and engineering into a structured topology. Track concepts, deploy interactive laboratories, and compound knowledge in a local-first workspace.
      </p>
      
      <div class="nv-hero-actions" aria-label="Primary actions">
        <a href="#/learning" class="nv-button" data-variant="primary">Start Learning</a>
        <a href="#/retrieval-playground" class="nv-button" data-variant="ghost">Inspect the Graph</a>
      </div>

      <!-- Telemetry Metrics Grid -->
      <div class="nv-hero-telemetry" aria-label="Observatory status metrics">
        <div class="nv-telemetry-item">
          <span class="nv-telemetry-value">8,000+</span>
          <span class="nv-telemetry-label">Canonical Concepts</span>
        </div>
        <div class="nv-telemetry-item">
          <span class="nv-telemetry-value">120</span>
          <span class="nv-telemetry-label">Interactive Labs</span>
        </div>
        <div class="nv-telemetry-item">
          <span class="nv-telemetry-value">2,500+</span>
          <span class="nv-telemetry-label">Research Papers</span>
        </div>
        <div class="nv-telemetry-item">
          <span class="nv-telemetry-value">38</span>
          <span class="nv-telemetry-label">Learning Paths</span>
        </div>
        <div class="nv-telemetry-item">
          <span class="nv-telemetry-value">80</span>
          <span class="nv-telemetry-label">Engineering Projects</span>
        </div>
      </div>
    </div>

    <!-- Living Scientific Visualization -->
    <div class="nv-hero-visual" aria-hidden="true">
      <div class="nv-visual-container">
        <!-- Grid overlay -->
        <div class="nv-visual-grid-overlay"></div>
        <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" class="nv-topology-svg">
          <defs>
            <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="var(--sys-color-accent-primary)" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="var(--sys-color-accent-primary)" stop-opacity="0"/>
            </radialGradient>
          </defs>
          
          <!-- Outer orbital ring -->
          <circle cx="250" cy="250" r="210" stroke="var(--sys-color-border-subtle)" stroke-width="1" stroke-dasharray="3 9" />
          <circle cx="250" cy="250" r="150" stroke="var(--sys-color-border-subtle)" stroke-width="1" />
          <circle cx="250" cy="250" r="90" stroke="var(--sys-color-border-subtle)" stroke-width="1" stroke-dasharray="2 4" />
          
          <!-- Crosshair guides -->
          <line x1="250" y1="20" x2="250" y2="480" stroke="var(--sys-color-border-subtle)" stroke-width="0.5" stroke-opacity="0.5" />
          <line x1="20" y1="250" x2="480" y2="250" stroke="var(--sys-color-border-subtle)" stroke-width="0.5" stroke-opacity="0.5" />
          
          <!-- Connection lines -->
          <path d="M250 250 L140 140 M250 250 L380 180 M250 250 L320 350 M250 250 L120 320" stroke="var(--sys-color-accent-primary)" stroke-opacity="0.15" stroke-width="1.5" />
          <path d="M140 140 L380 180 L320 350 L120 320 Z" stroke="var(--sys-color-accent-primary)" stroke-opacity="0.08" stroke-width="1" stroke-dasharray="4 4" />
          
          <!-- Moving signal pulses along orbital lines -->
          <circle r="4" fill="var(--sys-color-accent-primary)" class="nv-pulse-node">
            <animateMotion path="M140 140 L380 180 L320 350 L120 320 Z" dur="18s" repeatCount="indefinite" />
          </circle>

          <!-- Core System Node -->
          <g class="nv-graph-node" transform="translate(250, 250)">
            <circle r="18" fill="url(#node-glow)" />
            <circle r="8" fill="var(--sys-color-accent-primary)" />
            <circle r="14" stroke="var(--sys-color-accent-primary)" stroke-opacity="0.3" stroke-width="1" />
          </g>
          
          <!-- Satellite Node A -->
          <g class="nv-graph-node" transform="translate(140, 140)">
            <circle r="10" fill="url(#node-glow)" />
            <circle r="5" fill="var(--sys-color-accent-primary)" />
            <text x="12" y="4" fill="var(--sys-color-text-secondary)" font-family="var(--sys-font-code-family)" font-size="8" letter-spacing="0.05em">NV.AGENTS</text>
          </g>
          
          <!-- Satellite Node B -->
          <g class="nv-graph-node" transform="translate(380, 180)">
            <circle r="10" fill="url(#node-glow)" />
            <circle r="5" fill="var(--sys-color-accent-primary)" />
            <text x="12" y="4" fill="var(--sys-color-text-secondary)" font-family="var(--sys-font-code-family)" font-size="8" letter-spacing="0.05em">NV.LABS</text>
          </g>
          
          <!-- Satellite Node C -->
          <g class="nv-graph-node" transform="translate(320, 350)">
            <circle r="10" fill="url(#node-glow)" />
            <circle r="5" fill="var(--sys-color-accent-primary)" />
            <text x="12" y="4" fill="var(--sys-color-text-secondary)" font-family="var(--sys-font-code-family)" font-size="8" letter-spacing="0.05em">NV.GRAPH</text>
          </g>
          
          <!-- Satellite Node D -->
          <g class="nv-graph-node" transform="translate(120, 320)">
            <circle r="10" fill="url(#node-glow)" />
            <circle r="5" fill="var(--sys-color-accent-primary)" />
            <text x="-65" y="4" fill="var(--sys-color-text-secondary)" font-family="var(--sys-font-code-family)" font-size="8" letter-spacing="0.05em">NV.MEM</text>
          </g>

          <!-- Constellation hints -->
          <circle cx="210" cy="180" r="1.5" fill="var(--sys-color-text-muted)" opacity="0.3" />
          <circle cx="340" cy="120" r="2.5" fill="var(--sys-color-text-muted)" opacity="0.4" />
          <circle cx="290" cy="300" r="1.5" fill="var(--sys-color-text-muted)" opacity="0.3" />
          <circle cx="160" cy="270" r="2" fill="var(--sys-color-text-muted)" opacity="0.3" />
          
          <!-- Scientific coordinates telemetry -->
          <text x="15" y="485" fill="var(--sys-color-text-muted)" font-family="var(--sys-font-code-family)" font-size="8" opacity="0.5">LATENCY: 12ms</text>
          <text x="400" y="485" fill="var(--sys-color-text-muted)" font-family="var(--sys-font-code-family)" font-size="8" opacity="0.5" text-anchor="end">AZIMUTH: 184.22</text>
        </svg>
      </div>
    </div>
  </section>

  <!-- Continuity Console Strip (Onboarding / active session telemetry) -->
  <section class="nv-observatory-console-strip" aria-label="Observatory Session Continuity">
    <!-- Onboarding State -->
    <div class="nv-console-onboarding" data-home-onboarding>
      <div class="nv-console-panel">
        <div class="nv-console-header">
          <span class="nv-console-dot nv-console-dot--standby"></span>
          <span class="nv-console-title">Observatory Status: Standby</span>
        </div>
        <p class="nv-console-text">Begin with a structured learning path, or open the workspace to resume active state memory tracking.</p>
        <div class="nv-console-actions">
          <a href="#/learning" class="nv-button" data-variant="secondary">Explore Paths</a>
          <a href="#/workspace" class="nv-button" data-variant="ghost">Open Workspace</a>
        </div>
      </div>
    </div>

    <!-- Active Session State -->
    <div class="nv-console-session" data-home-session hidden>
      <div class="nv-console-panel">
        <div class="nv-console-header">
          <span class="nv-console-dot nv-console-dot--active"></span>
          <span class="nv-console-title">Observatory Status: Active Session</span>
        </div>
        
        <div class="nv-console-grid">
          <!-- Continue Card -->
          <div class="nv-console-card" data-workspace-continue hidden>
            <span class="nv-card-eyebrow">CONTINUE FOCUS</span>
            <h2 class="nv-card-title">Resume Active Unit</h2>
            <dl class="nv-card-meta">
              <div class="nv-meta-row"><dt>Path</dt><dd data-workspace-continue-path>None</dd></div>
              <div class="nv-meta-row"><dt>Module</dt><dd data-workspace-continue-module>None</dd></div>
              <div class="nv-meta-row"><dt>Content</dt><dd data-workspace-continue-content>None</dd></div>
            </dl>
            <div class="nv-card-actions">
              <a class="nv-button" data-variant="primary" href="#/content" data-workspace-continue-action>Resume</a>
            </div>
          </div>

          <!-- Last Opened Card -->
          <div class="nv-console-card" data-workspace-last-opened hidden>
            <span class="nv-card-eyebrow">LAST OPENED</span>
            <h2 class="nv-card-title" data-workspace-last-opened-title>None</h2>
            <dl class="nv-card-meta">
              <div class="nv-meta-row"><dt>Module</dt><dd data-workspace-last-opened-module>None</dd></div>
              <div class="nv-meta-row"><dt>Path</dt><dd data-workspace-last-opened-path>None</dd></div>
              <div class="nv-meta-row"><dt>Timestamp</dt><dd data-workspace-last-opened-time>None</dd></div>
            </dl>
            <div class="nv-card-actions">
              <a class="nv-button" data-variant="secondary" href="#/content" data-workspace-last-opened-action>Open Again</a>
            </div>
          </div>

          <!-- Progress Panel -->
          <div class="nv-console-progress">
            <span class="nv-card-eyebrow">TELEMETRY SUMMARY</span>
            <h2 class="nv-card-title">Learning Continuity</h2>
            <dl class="nv-card-meta">
              <div class="nv-meta-row"><dt>Path</dt><dd data-workspace-orientation-path>—</dd></div>
              <div class="nv-meta-row"><dt>Module</dt><dd data-workspace-orientation-module>—</dd></div>
              <div class="nv-meta-row"><dt>Content</dt><dd data-workspace-orientation-content>—</dd></div>
              <div class="nv-meta-row"><dt>Progress</dt><dd data-workspace-path-summary-progress>—</dd></div>
              <div class="nv-meta-row"><dt>Status</dt><dd data-workspace-path-summary-status>—</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stage 1: Scientific Vision -->
  <section class="nv-observatory-section nv-section-vision" aria-labelledby="vision-title">
    <div class="nv-section-grid">
      <div class="nv-section-copy">
        <p class="nv-section-kicker">01 // Scientific Vision</p>
        <h2 id="vision-title" class="nv-section-title">An Operating System for AI Engineering.</h2>
        <p class="nv-section-text">
          Traditional learning systems present AI as a sequence of videos or code templates. NeuralVerse conceptualizes machine learning as a governed topological tree of competencies. By treating models as transparent structures, the platform enables engineers to observe, parameterize, and verify state-of-the-art networks deterministically.
        </p>
      </div>
      <div class="nv-section-illustration">
        <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="nv-diagram-svg">
          <rect width="400" height="240" rx="12" fill="var(--sys-color-surface-base)" stroke="var(--sys-color-border-subtle)" />
          <!-- Instrument ticks -->
          <line x1="20" y1="20" x2="30" y2="20" stroke="var(--sys-color-accent-primary)" stroke-width="1.5" />
          <line x1="20" y1="20" x2="20" y2="30" stroke="var(--sys-color-accent-primary)" stroke-width="1.5" />
          
          <line x1="380" y1="220" x2="370" y2="220" stroke="var(--sys-color-accent-primary)" stroke-width="1.5" />
          <line x1="380" y1="220" x2="380" y2="210" stroke="var(--sys-color-accent-primary)" stroke-width="1.5" />

          <!-- Block A: Didactic Orchestrator -->
          <rect x="40" y="45" width="120" height="40" rx="4" fill="var(--sys-color-surface-raised)" stroke="var(--sys-color-border-subtle)" />
          <text x="100" y="69" fill="var(--sys-color-text-primary)" font-family="var(--sys-font-code-family)" font-size="10" text-anchor="middle">Didactic Orchestrator</text>
          
          <!-- Block B: Agent Registry -->
          <rect x="240" y="45" width="120" height="40" rx="4" fill="var(--sys-color-surface-raised)" stroke="var(--sys-color-border-subtle)" />
          <text x="300" y="69" fill="var(--sys-color-text-primary)" font-family="var(--sys-font-code-family)" font-size="10" text-anchor="middle">Agent Registry</text>

          <!-- Block C: Evidence Trail -->
          <rect x="140" y="145" width="120" height="40" rx="4" fill="var(--sys-color-surface-raised)" stroke="var(--sys-color-border-subtle)" />
          <text x="200" y="169" fill="var(--sys-color-text-primary)" font-family="var(--sys-font-code-family)" font-size="10" text-anchor="middle">Evidence System</text>

          <!-- Connectors -->
          <path d="M160 65 L240 65" stroke="var(--sys-color-accent-primary)" stroke-dasharray="3 3" />
          <path d="M100 85 L100 120 L140 165" stroke="var(--sys-color-accent-primary)" stroke-opacity="0.6" />
          <path d="M300 85 L300 120 L260 165" stroke="var(--sys-color-accent-primary)" stroke-opacity="0.6" />
          
          <circle cx="200" cy="65" r="3" fill="var(--sys-color-accent-primary)" />
        </svg>
      </div>
    </div>
  </section>

  <!-- Stage 2: Knowledge Observatory -->
  <section class="nv-observatory-section nv-section-observatory" aria-labelledby="observatory-title">
    <div class="nv-section-grid nv-grid-reverse">
      <div class="nv-section-copy">
        <p class="nv-section-kicker">02 // Knowledge Observatory</p>
        <h2 id="observatory-title" class="nv-section-title">Not a Course List. A Map of Understanding.</h2>
        <p class="nv-section-text">
          Courses structure learning linearly, creating knowledge silos. NeuralVerse projects curriculum modules into a comprehensive knowledge graph. As you explore concepts (such as Vector Embeddings or Sparse Representation), the platform traces parent requirements and child dependents, mapping your progress dynamically.
        </p>
      </div>
      <div class="nv-section-illustration">
        <div class="nv-concept-atlas">
          <div class="nv-atlas-halo"></div>
          <div class="nv-atlas-grid"></div>
          <div class="nv-atlas-node nv-atlas-node--active" style="top: 25%; left: 30%;">
            <span class="nv-atlas-label">Embeddings</span>
          </div>
          <div class="nv-atlas-node" style="top: 50%; left: 50%;">
            <span class="nv-atlas-label">Attention</span>
          </div>
          <div class="nv-atlas-node" style="top: 75%; left: 25%;">
            <span class="nv-atlas-label">Retrieval</span>
          </div>
          <div class="nv-atlas-node" style="top: 40%; left: 75%;">
            <span class="nv-atlas-label">Evaluation</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stage 3 & 4: Learning Graph & Research (Editorial Panels) -->
  <section class="nv-observatory-section nv-section-panels" aria-labelledby="panels-title">
    <p class="nv-section-kicker">03 & 04 // Mathematical Grounding & Genealogy</p>
    <h2 id="panels-title" class="nv-section-title nv-title-center">Built for Rigorous Development.</h2>
    
    <!-- 2+1 Editorial layout -->
    <div class="nv-editorial-layout">
      <!-- Row 1: Two cards -->
      <div class="nv-panel-row">
        <article class="nv-scientific-panel">
          <div class="nv-panel-header">
            <span class="nv-panel-idx">GEN-01</span>
            <h3>Traceable Knowledge</h3>
          </div>
          <div class="nv-panel-visual">
            <svg viewBox="0 0 100 40" fill="none" class="nv-mini-svg">
              <circle cx="20" cy="20" r="4" fill="var(--sys-color-accent-primary)" />
              <circle cx="50" cy="20" r="4" fill="var(--sys-color-accent-primary)" />
              <circle cx="80" cy="20" r="4" fill="var(--sys-color-accent-primary)" />
              <line x1="24" y1="20" x2="46" y2="20" stroke="var(--sys-color-accent-primary)" stroke-dasharray="2 2" />
              <line x1="54" y1="20" x2="76" y2="20" stroke="var(--sys-color-accent-primary)" />
            </svg>
          </div>
          <p class="nv-panel-desc">All concepts, verified answers, and agent evaluations reference peer-reviewed research papers and documentation. No raw claims without evidence.</p>
        </article>

        <article class="nv-scientific-panel">
          <div class="nv-panel-header">
            <span class="nv-panel-idx">GEN-02</span>
            <h3>Reproducible Labs</h3>
          </div>
          <div class="nv-panel-visual">
            <svg viewBox="0 0 100 40" fill="none" class="nv-mini-svg">
              <rect x="10" y="10" width="20" height="20" fill="none" stroke="var(--sys-color-accent-primary)" stroke-width="1.5"/>
              <path d="M40 20 L60 20" stroke="var(--sys-color-accent-primary)" stroke-width="1.5" />
              <rect x="70" y="10" width="20" height="20" fill="var(--sys-color-accent-primary)" opacity="0.4" stroke="var(--sys-color-accent-primary)" stroke-width="1.5"/>
            </svg>
          </div>
          <p class="nv-panel-desc">Interactive model simulators run in sandboxed JavaScript loops locally. Play with hyperparameters and immediately see analytical evaluations.</p>
        </article>
      </div>

      <!-- Row 2: Large feature card -->
      <article class="nv-scientific-panel nv-panel-featured">
        <div class="nv-featured-grid">
          <div class="nv-featured-copy">
            <span class="nv-panel-idx">GEN-03</span>
            <h3>Cumulative Research Trails</h3>
            <p class="nv-panel-desc">
              NeuralVerse connects your learning sessions to a semantic database. When you review concepts or execute labs, a structured memory graph grows locally on your browser. Your notes, bookmarks, and evaluations compound over time, providing a traceable path to AI mastery.
            </p>
          </div>
          <div class="nv-featured-visual">
            <svg viewBox="0 0 200 120" fill="none" class="nv-medium-svg">
              <circle cx="100" cy="60" r="45" stroke="var(--sys-color-border-subtle)" stroke-width="1" />
              <circle cx="100" cy="60" r="25" stroke="var(--sys-color-border-subtle)" stroke-width="1" stroke-dasharray="2 4" />
              <!-- Web of nodes -->
              <g fill="var(--sys-color-accent-primary)">
                <circle cx="100" cy="15" r="4" />
                <circle cx="145" cy="60" r="4" />
                <circle cx="100" cy="105" r="4" />
                <circle cx="55" cy="60" r="4" />
                <circle cx="100" cy="60" r="5" />
              </g>
              <line x1="100" y1="19" x2="100" y2="55" stroke="var(--sys-color-accent-primary)" stroke-opacity="0.4" />
              <line x1="141" y1="60" x2="105" y2="60" stroke="var(--sys-color-accent-primary)" stroke-opacity="0.4" />
              <line x1="100" y1="101" x2="100" y2="65" stroke="var(--sys-color-accent-primary)" stroke-opacity="0.4" />
              <line x1="59" y1="60" x2="95" y2="60" stroke="var(--sys-color-accent-primary)" stroke-opacity="0.4" />
            </svg>
          </div>
        </div>
      </article>
    </div>
  </section>

  <!-- Stage 5 & 6: Laboratories & Applications -->
  <section class="nv-observatory-section nv-section-labs" aria-labelledby="labs-title">
    <div class="nv-section-grid">
      <div class="nv-section-copy">
        <p class="nv-section-kicker">05 & 06 // Laboratories & Transfer</p>
        <h2 id="labs-title" class="nv-section-title">Deterministic Local Experimentation.</h2>
        <p class="nv-section-text">
          Run neural nets, calculate cosine similarities, construct decision boundaries, or visualize embedding projections without external servers. NeuralVerse hosts local laboratory instruments where mathematical theories become interactively inspectable.
        </p>
        <div class="nv-lab-metrics">
          <div class="nv-metric-item">
            <span class="nv-metric-no">12+</span>
            <span class="nv-metric-txt">Interactive Simulators</span>
          </div>
          <div class="nv-metric-item">
            <span class="nv-metric-no">100%</span>
            <span class="nv-metric-txt">Local Execution</span>
          </div>
        </div>
      </div>
      <div class="nv-section-illustration">
        <div class="nv-observatory-console">
          <div class="nv-console-screen">
            <div class="nv-screen-header">
              <span class="nv-screen-title">COSINE_SIMILARITY_ENGINE</span>
              <span class="nv-screen-status">READY</span>
            </div>
            <div class="nv-screen-body">
              <div class="nv-vector-graph">
                <!-- Simple coordinate system -->
                <line x1="10" y1="90" x2="90" y2="90" stroke="var(--sys-color-border-subtle)" stroke-width="1"/>
                <line x1="10" y1="10" x2="10" y2="90" stroke="var(--sys-color-border-subtle)" stroke-width="1"/>
                <!-- Vectors -->
                <line x1="10" y1="90" x2="60" y2="30" stroke="var(--sys-color-accent-primary)" stroke-width="2" marker-end="url(#arrow)"/>
                <line x1="10" y1="90" x2="80" y2="70" stroke="var(--sys-color-accent-primary)" stroke-width="2" stroke-opacity="0.5"/>
                <!-- Angle arc -->
                <path d="M 30 80 A 20 20 0 0 0 25 70" fill="none" stroke="var(--sys-color-accent-primary)" stroke-width="1" />
              </div>
              <div class="nv-vector-data">
                <span class="nv-data-label">VEC_A: [0.82, 0.57]</span>
                <span class="nv-data-label">VEC_B: [0.94, 0.12]</span>
                <span class="nv-data-value">SIMILARITY: 0.884</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stage 7 & 8: Projects & Curriculum -->
  <section class="nv-observatory-section nv-section-curriculum" aria-labelledby="curriculum-title">
    <div class="nv-section-grid nv-grid-reverse">
      <div class="nv-section-copy">
        <p class="nv-section-kicker">07 & 08 // Projects & Syllabus</p>
        <h2 id="curriculum-title" class="nv-section-title">An Structured Path to Mastery.</h2>
        <p class="nv-section-text">
          Progress from the foundations of machine learning up to frontier autonomous systems. The curriculum is mapped as modular competencies, requiring you to write code, solve mathematical challenges, and build actual pipelines to progress.
        </p>
      </div>
      <div class="nv-section-illustration">
        <div class="nv-curriculum-roadmap">
          <div class="nv-roadmap-line"></div>
          
          <div class="nv-roadmap-checkpoint">
            <span class="nv-cp-dot nv-cp-dot--completed"></span>
            <div class="nv-cp-content">
              <h4>01 // Classical Foundations</h4>
              <p>Bayesian classification, dimensionality reduction, SVMs</p>
            </div>
          </div>
          
          <div class="nv-roadmap-checkpoint">
            <span class="nv-cp-dot nv-cp-dot--active"></span>
            <div class="nv-cp-content">
              <h4>02 // Vector Representation</h4>
              <p>Cosine distance, dense index structures, semantic search</p>
            </div>
          </div>
          
          <div class="nv-roadmap-checkpoint">
            <span class="nv-cp-dot"></span>
            <div class="nv-cp-content">
              <h4>03 // RAG Systems</h4>
              <p>Chunking strategies, metadata filtering, verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stage 9 & 10: Evidence & Start Learning (CTA Terminal) -->
  <section class="nv-observatory-section nv-section-cta" aria-labelledby="cta-title">
    <div class="nv-cta-terminal">
      <div class="nv-terminal-header">
        <span class="nv-terminal-status-dot"></span>
        <h2 id="cta-title">INITIATE OBSERVATORY ACCESS</h2>
      </div>
      <p class="nv-terminal-desc">
        Begin your exploration of governed machine learning. Access the curriculum, open laboratories, and build your private local knowledge repository.
      </p>
      <div class="nv-terminal-actions">
        <a href="#/learning" class="nv-button" data-variant="primary">Start Learning</a>
        <a href="#/workspace" class="nv-button" data-variant="ghost">Open Workspace</a>
      </div>
      <div class="nv-terminal-footer">
        <span>SECURITY_LEVEL: VERIFIED</span>
        <span>DATABASE_STATUS: PERSISTED_LOCAL</span>
      </div>
    </div>
  </section>
</section>
      `,
      learning: `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md">
            <h1 class="nv-sr-only">Learning Paths</h1>
          </div>
        </div>
      `,
      'learning-detail': `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md" data-curriculum-root>
            <h1 class="nv-sr-only">Learning Path Details</h1>
          </div>
        </div>
      `,
      'learning-path': `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md" data-curriculum-root>
            <h1 class="nv-sr-only">Learning Path Details</h1>
          </div>
        </div>
      `,
      'lesson-detail': `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md" data-curriculum-root>
            <h1 class="nv-sr-only">Lesson Details</h1>
          </div>
        </div>
      `,
      'artifact-detail': `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md" data-curriculum-root>
            <h1 class="nv-sr-only">Artifact Details</h1>
          </div>
        </div>
      `,
      modules: `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md" data-curriculum-root>
            <h1 class="nv-sr-only">Curriculum Modules</h1>
          </div>
        </div>
      `,
      'knowledge-graph': `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md" data-knowledge-graph-root>
            <h1 class="nv-sr-only">Knowledge Graph</h1>
          </div>
        </div>
      `,
      'module-detail': `
        <div class="nv-stack nv-stack--gap-md">
          <div class="nv-stack nv-stack--gap-md" data-curriculum-root>
            <h1 class="nv-sr-only">Module Details</h1>
          </div>
        </div>
      `,
      workspace: `
        <div id="nv-workspace-content-body" class="nv-stack nv-stack--gap-md">
          <h1 class="nv-sr-only">Personalized Learning & Study Dashboard</h1>
          <article class="nv-card nv-review-dashboard" data-review-dashboard aria-label="Today's Reviews">
            <header class="nv-card__header">
              <h2 class="nv-card__title">Today's Reviews</h2>
              <p class="nv-card__subtitle">Spaced repetition (SM-2) — deterministic, local-first</p>
            </header>
            <div class="nv-card__body">
              <dl class="nv-review-dashboard__metrics" aria-label="Review summary">
                <div class="nv-review-dashboard__metric">
                  <dt>Due today</dt>
                  <dd data-review-dashboard-due-today>0</dd>
                </div>
                <div class="nv-review-dashboard__metric">
                  <dt>Overdue</dt>
                  <dd data-review-dashboard-overdue>0</dd>
                </div>
                <div class="nv-review-dashboard__metric">
                  <dt>Completed today</dt>
                  <dd data-review-dashboard-reviewed-today>0</dd>
                </div>
              </dl>
              <div class="nv-review-dashboard__next">
                <h3 class="nv-review-dashboard__next-title">Next scheduled review</h3>
                <p>
                  <strong data-review-dashboard-next-item>Nothing scheduled</strong>
                  <span class="nv-muted" data-review-dashboard-next-time>—</span>
                </p>
              </div>
              <div class="nv-review-dashboard__upcoming">
                <h3 class="nv-review-dashboard__upcoming-title">Upcoming</h3>
                <ul data-review-dashboard-upcoming aria-label="Upcoming reviews"></ul>
              </div>
              <div class="nv-review-dashboard__actions">
                <button type="button" class="nv-button" data-variant="primary" data-review-dashboard-start aria-label="Start review session">Start Review</button>
                <button type="button" class="nv-button" data-variant="secondary" data-review-dashboard-continue aria-label="Continue review session">Continue</button>
                <button type="button" class="nv-button" data-variant="ghost" data-review-dashboard-skip aria-label="Skip current review">Skip</button>
              </div>
              <p class="nv-review-dashboard__empty" data-review-dashboard-empty hidden>All caught up.</p>
            </div>
          </article>
          <article class="nv-card" data-recent-labs-card aria-label="Recent Laboratories">
            <header class="nv-card__header">
              <h2 class="nv-card__title">Recent Laboratories</h2>
              <p class="nv-card__subtitle">Interactive experiments — deterministic, local-first</p>
            </header>
            <div class="nv-card__body" data-recent-labs-mount>
              <p class="nv-muted">No laboratories visited yet.</p>
            </div>
          </article>
           <article class="nv-card" data-pinned-memories-card aria-label="Pinned Memories">
            <header class="nv-card__header">
              <h2 class="nv-card__title">Pinned Memories</h2>
              <p class="nv-card__subtitle">Your most important notes and bookmarks</p>
            </header>
            <div class="nv-card__body" data-pinned-memories-mount>
              <p class="nv-muted">No pinned memories yet.</p>
            </div>
          </article>
          <article class="nv-card" data-semantic-suggestions-card aria-label="Semantic Suggestions">
            <header class="nv-card__header">
              <h2 class="nv-card__title">Semantic Suggestions</h2>
              <p class="nv-card__subtitle">Deterministic concept recommendations</p>
            </header>
            <div class="nv-card__body" data-semantic-suggestions-mount>
              <p class="nv-muted">No semantic context available.</p>
            </div>
          </article>
          <article class="nv-card" data-recent-viz-card aria-label="Recent Visualizations">
            <header class="nv-card__header">
              <h2 class="nv-card__title">Recent Visualizations</h2>
              <p class="nv-card__subtitle">Parametric visualizations — deterministic, local-first</p>
            </header>
            <div class="nv-card__body" data-recent-viz-mount>
              <p class="nv-muted">No visualizations visited yet. <a href="#/visualizations">Browse visualizations</a></p>
            </div>
          </article>
          <article class="nv-card" data-pinned-viz-card aria-label="Pinned Visualizations">
            <header class="nv-card__header">
              <h2 class="nv-card__title">Pinned Visualizations</h2>
              <p class="nv-card__subtitle">Your favorite parametric visualizations</p>
            </header>
            <div class="nv-card__body" data-pinned-viz-mount>
              <p class="nv-muted">No pinned visualizations yet. <a href="#/visualizations">Explore visualizations</a></p>
            </div>
          </article>
          <div class="nv-search-loading">
            <div class="nv-search-loading-spinner"></div>
            <div class="nv-search-loading-text">Loading personalization dashboard...</div>
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
      laboratory: `
        <div class="nv-lab-index" data-lab-index>
          <header class="nv-lab-index-header">
            <h1>Interactive Laboratories</h1>
            <p>Browse and launch deterministic educational experiments. All execution happens locally in your browser.</p>
          </header>
          <div data-lab-index-content>
            <div class="nv-search-loading">
              <div class="nv-search-loading-spinner"></div>
              <div class="nv-search-loading-text">Loading laboratories...</div>
            </div>
          </div>
        </div>
      `,
      memory: `
        <div class="nv-memory" data-memory-root>
          <header class="nv-memory-header">
            <h1>Memory</h1>
            <p>Organize your learning notes, bookmarks, and study context.</p>
            <div class="nv-memory-header-actions">
              <button class="nv-button" data-variant="primary" data-memory-action="create" aria-label="Create new memory">New Memory</button>
              <button class="nv-button" data-variant="secondary" data-memory-action="toggle-archived" aria-label="Show archived memories">Archived</button>
              <select class="nv-lab-select" data-memory-sort aria-label="Sort memories">
                <option value="updatedAt">Last Updated</option>
                <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
              </select>
              <select class="nv-lab-select" data-memory-filter-type aria-label="Filter by type">
                <option value="">All Types</option>
                <option value="note">Notes</option>
                <option value="bookmark">Bookmarks</option>
                <option value="highlight">Highlights</option>
                <option value="workspace">Workspace</option>
                <option value="laboratory">Laboratory</option>
                <option value="review">Review</option>
                <option value="search">Search</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </header>
          <div class="nv-memory-body">
            <section class="nv-memory-pinned" data-memory-pinned-section aria-label="Pinned Memories">
              <h2>Pinned Memories</h2>
              <div data-memory-pinned-mount></div>
            </section>
            <section class="nv-memory-recent" data-memory-recent-section aria-label="Recent Memories">
              <h2>Recent Memories</h2>
              <div data-memory-recent-mount></div>
            </section>
            <section class="nv-memory-collections" data-memory-collections-section aria-label="Collections">
              <h2>Collections</h2>
              <div data-memory-collections-mount></div>
            </section>
          </div>
          <div class="nv-memory-editor-overlay" data-memory-editor-overlay hidden aria-label="Memory editor">
            <div class="nv-memory-editor" data-memory-editor role="dialog" aria-labelledby="memory-editor-title">
              <h2 id="memory-editor-title">New Memory</h2>
              <form data-memory-editor-form>
                <div class="nv-memory-form-group">
                  <label for="memory-type">Type</label>
                  <select id="memory-type" name="type" required>
                    <option value="note">Note</option>
                    <option value="bookmark">Bookmark</option>
                    <option value="highlight">Highlight</option>
                    <option value="workspace">Workspace</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="review">Review</option>
                    <option value="search">Search</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div class="nv-memory-form-group">
                  <label for="memory-title">Title</label>
                  <input type="text" id="memory-title" name="title" required placeholder="Memory title">
                </div>
                <div class="nv-memory-form-group">
                  <label for="memory-summary">Summary</label>
                  <input type="text" id="memory-summary" name="summary" placeholder="Brief summary">
                </div>
                <div class="nv-memory-form-group">
                  <label for="memory-content">Content</label>
                  <textarea id="memory-content" name="content" rows="6" placeholder="Detailed content..."></textarea>
                </div>
                <div class="nv-memory-form-group">
                  <label for="memory-tags">Tags (comma-separated)</label>
                  <input type="text" id="memory-tags" name="tags" placeholder="tag1, tag2, tag3">
                </div>
                <div class="nv-memory-form-group">
                  <label for="memory-concepts">Related Concepts (comma-separated)</label>
                  <input type="text" id="memory-concepts" name="relatedConcepts" placeholder="concept1, concept2">
                </div>
                <div class="nv-memory-form-group">
                  <label for="memory-artifacts">Related Artifacts (comma-separated)</label>
                  <input type="text" id="memory-artifacts" name="relatedArtifacts" placeholder="artifact1, artifact2">
                </div>
                <div class="nv-memory-form-actions">
                  <button type="submit" class="nv-button" data-variant="primary">Save</button>
                  <button type="button" class="nv-button" data-variant="ghost" data-memory-action="cancel-edit">Cancel</button>
                </div>
              </form>
            </div>
          </div>
          <dialog class="nv-memory-dialog" data-memory-confirm-dialog aria-labelledby="memory-confirm-title">
            <h3 id="memory-confirm-title">Confirm Deletion</h3>
            <p data-memory-confirm-message>Are you sure you want to delete this memory?</p>
            <div class="nv-memory-dialog-actions">
              <button class="nv-button" data-variant="danger" data-memory-action="confirm-delete">Delete</button>
              <button class="nv-button" data-variant="ghost" data-memory-action="cancel-delete">Cancel</button>
            </div>
          </dialog>
        </div>
      `,
      'memory-detail': `
        <div class="nv-memory" data-memory-root>
          <div class="nv-memory-detail" data-memory-detail-mount>
            <p>Loading memory...</p>
          </div>
        </div>
      `,
      'laboratory-detail': `
        <div class="nv-lab-viewer" data-lab-viewer>
          <div class="nv-lab-viewer-header">
            <a href="#/laboratory" class="nv-lab-back-btn" aria-label="Back to laboratories">Back</a>
            <h2 data-lab-title>Loading...</h2>
            <span class="nv-lab-header-summary" data-lab-summary></span>
          </div>
          <div class="nv-lab-parameter-panel" data-lab-parameters>
            <h3>Parameters</h3>
          </div>
          <div class="nv-lab-visualization-panel">
            <div class="nv-lab-metadata" data-lab-metadata></div>
            <div data-lab-visualization></div>
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

    const viewId = route.id === 'content-detail'
      ? 'content'
      : route.id === 'not-found'
        ? 'not-found'
        : (route.isImplemented ? route.id : 'not-found');
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
      if (dirPath.startsWith('//')) {
        dirPath = '/' + dirPath.replace(/^\/+/, '');
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
