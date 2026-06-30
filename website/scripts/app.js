import { createCurriculumController } from "./curriculum/curriculum-controller.js?v=1";
import { createContentController } from "./content/content-controller.js?v=9";
import { createProgressController } from "./progress/progress-controller.js?v=9";
import { createWorkspaceController } from "./workspace/workspace-controller.js?v=11";
import { installSpacedRepetition } from "./spaced-repetition/index.js?v=2";
import { createReviewSettingsController } from "./spaced-repetition/review-settings-controller.js?v=1";
import { installAnswerVerification } from "./answer-verification/index.js?v=2";
import { createBreadcrumbsController } from "./navigation/breadcrumbs-controller.js?v=10";
import { createCurriculumSearchController } from "./curriculum/curriculum-search.js?v=14";
import { createKnowledgeGraphController } from "./knowledge-graph/knowledge-graph-controller.js?v=1";
import { createAgentRegistry } from "./agents/agent-registry.js?v=1";
import { createAgentGuardrails } from "./agents/agent-guardrails.js?v=1";
import { createAgentContextBuilder } from "./agents/agent-context-builder.js?v=1";
import { createAgentContract } from "./agents/agent-contracts.js?v=1";
import { createDidacticOrchestrator } from "./agents/didactic-orchestrator.js?v=1";
import { createDidacticArchitectureAgent } from "./agents/didactic-architecture-agent.js?v=2";
import { createCurriculumDependencyAgent } from "./agents/curriculum-dependency-agent.js?v=1";
import { createVisualInteractiveMediaAgent } from "./agents/visual-interactive-media-agent.js?v=1";
import { createCodeSimulationLaboratoryAgent } from "./agents/code-simulation-laboratory-agent.js?v=1";
import { createResearchStateOfArtAgent } from "./agents/research-state-of-art-agent.js?v=1";
import { createApplicationProfessionalTransferAgent } from "./agents/application-professional-transfer-agent.js?v=1";
import { createAssessmentReinforcementAgent } from "./agents/assessment-reinforcement-agent.js?v=1";
import { createObsidianKnowledgeGovernanceAgent } from "./agents/obsidian-knowledge-governance-agent.js?v=1";
import { createStorytellingLearningJourneyAgent } from "./agents/storytelling-learning-journey-agent.js?v=1";
import { createCuriosityEngagementAgent } from "./agents/curiosity-engagement-agent.js?v=1";
import { createAgentPanelController } from "./agents/agent-panel-controller.js?v=1";

window.NV_DEBUG = window.NV_DEBUG || false;

document.addEventListener("DOMContentLoaded", () => {
  if (window.NV_DEBUG) console.log('NeuralVerse App Shell Initialized');

  // Set the current year in the footer
  const yearElement = document.querySelector('.nv-footer-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }

  // Initialize the spaced repetition engine (SM-2) — must run before any
  // controller that depends on review state.
  installSpacedRepetition();

  // Initialize the deterministic answer verification engine (NV-1100-P6).
  // Exposes verifyAnswer() and a storage-backed history on window.NeuralVerse.
  installAnswerVerification();

  // Initialize the read-only curriculum controller.
  const curriculumController = createCurriculumController({
    root: document,
  });

  curriculumController.init();

  // Initialize the curriculum search controller
  const searchController = createCurriculumSearchController({
    root: document,
  });

  searchController.init();
  wireReviewSearchShortcuts(searchController);

  // Initialize the content controller
  const contentController = createContentController({
    root: document,
  });

  contentController.init();

  // Initialize the progress controller
  const progressController = createProgressController({
    root: document,
  });

  progressController.init().catch((error) => {
    console.error("Progress controller failed to initialize.", error);
  });

  // Initialize the workspace controller
  const workspaceController = createWorkspaceController({
    root: document,
    navigationState: window.navigationState,
    workspaceState: window.NeuralVerse?.workspaceState,
  });

  workspaceController.init().catch((error) => {
    console.error("Workspace controller failed to initialize.", error);
  });

  // Initialize the breadcrumbs controller
  const breadcrumbsController = createBreadcrumbsController({
    root: document,
  });

  breadcrumbsController.init();

  const knowledgeGraphController = createKnowledgeGraphController({
    root: document,
  });

  knowledgeGraphController.init();

  // Initialize the laboratory system (NV-1100-P7)
  // Load all lab definitions and wire persistence integration
  window.NeuralVerse.initLaboratorySystem();
  const laboratoryController = window.NeuralVerse.createLaboratoryController({
    root: document,
  });
  window.NeuralVerse.laboratoryController = laboratoryController;

  // NV-1100-P10: Register heavy subsystems for deferred initialization
  if (window.NeuralVerse.DeferredInitManager) {
    var DIM = window.NeuralVerse.DeferredInitManager;

    DIM.register('laboratory', function () {
      return Promise.resolve();
    });

    DIM.register('visualization', function () {
      if (window.NeuralVerse?.vizSystem) {
        window.NeuralVerse.vizSystem.init();
      }
      if (window.NeuralVerse?.createVisualizationController) {
        var vc = window.NeuralVerse.createVisualizationController({ root: document });
        vc.init();
        window.NeuralVerse.visualizationController = vc;
      }
      return Promise.resolve();
    });

    DIM.register('semantic-learning', function () {
      if (window.NeuralVerse?.semanticLearning) {
        return window.NeuralVerse.semanticLearning.init();
      }
      return Promise.resolve();
    });

    DIM.register('advanced-memory', function () {
      if (window.NeuralVerse?.MemoryStorage) {
        window.NeuralVerse.MemoryStorage.load();
      }
      if (window.NeuralVerse?.MemoryIndexer) {
        window.NeuralVerse.MemoryIndexer.buildIndex();
      }
      if (window.NeuralVerse?.MemoryExportImport) {
        window.NeuralVerse.MemoryExportImport.integrateWithPersistenceManager();
      }
      if (window.NeuralVerse?.SessionContinuity) {
        window.NeuralVerse.SessionContinuity.loadSession();
      }
      return Promise.resolve();
    });

    DIM.register('shared-knowledge', function () {
      if (window.NeuralVerse?.sharedKnowledgeService) {
        return window.NeuralVerse.sharedKnowledgeService.initialize();
      }
      return Promise.resolve();
    });
  }

  // Initialize the agent panel controller
  const agentPanelController = createAgentPanelController({
    root: document,
  });

  agentPanelController.init();

  // Register the Didactic Architecture Agent with the orchestrator
  const didacticArchAgent = window.NeuralVerse?.didacticArchitectureAgent;
  const orchestrator = window.NeuralVerse?.didacticOrchestrator;
  if (didacticArchAgent && orchestrator?.registerRealAgent) {
    orchestrator.registerRealAgent('didactic-architecture', didacticArchAgent);
  }

  // Register the Curriculum & Dependency Agent with the orchestrator
  const curriculumDepAgent = window.NeuralVerse?.curriculumDependencyAgent;
  if (curriculumDepAgent && orchestrator?.registerRealAgent) {
    orchestrator.registerRealAgent('curriculum-dependency', curriculumDepAgent);
  }

  // Register the Visual & Interactive Media Agent with the orchestrator
  const visualMediaAgent = window.NeuralVerse?.visualInteractiveMediaAgent;
  if (visualMediaAgent && orchestrator?.registerRealAgent) {
    orchestrator.registerRealAgent('visual-interactive-media', visualMediaAgent);
  }

  // Register the Code, Simulation & Laboratory Agent with the orchestrator
  const codeLabAgent = window.NeuralVerse?.codeSimulationLaboratoryAgent;
  if (codeLabAgent && orchestrator?.registerRealAgent) {
    orchestrator.registerRealAgent('code-simulation-lab', codeLabAgent);
  }

  // Register the Research & State-of-the-Art Agent with the orchestrator
  const researchAgent = window.NeuralVerse?.researchStateOfArtAgent;
  if (researchAgent && orchestrator?.registerRealAgent) {
    orchestrator.registerRealAgent('research-state-of-art', researchAgent);
  }

  // Register the Application & Professional Transfer Agent with the orchestrator
  const transferAgent = window.NeuralVerse?.applicationProfessionalTransferAgent;
  if (transferAgent && orchestrator?.registerRealAgent) {
    orchestrator.registerRealAgent('application-professional-transfer', transferAgent);
  }

  // Register the Assessment & Reinforcement Agent with the orchestrator
  const assessmentAgent = window.NeuralVerse?.assessmentReinforcementAgent;
  if (assessmentAgent && orchestrator?.registerRealAgent) {
    orchestrator.registerRealAgent('assessment-reinforcement', assessmentAgent);
  }

  // Register the Obsidian & Knowledge Governance Agent with the orchestrator
  const obsidianAgent = window.NeuralVerse?.obsidianKnowledgeGovernanceAgent;
  if (obsidianAgent && orchestrator?.registerRealAgent) {
    orchestrator.registerRealAgent('obsidian-knowledge-governance', obsidianAgent);
  }

  // Register the Storytelling & Learning Journey Agent with the orchestrator
  const storytellingAgent = window.NeuralVerse?.storytellingLearningJourneyAgent;
  if (storytellingAgent && orchestrator?.registerRealAgent) {
    orchestrator.registerRealAgent('storytelling-learning-journey', storytellingAgent);
  }

  // Register the Curiosity & Engagement Agent with the orchestrator
  const curiosityAgent = window.NeuralVerse?.curiosityEngagementAgent;
  if (curiosityAgent && orchestrator?.registerRealAgent) {
    orchestrator.registerRealAgent('curiosity-engagement', curiosityAgent);
  }

  // Bind agent trigger button
  const agentTrigger = document.querySelector('#nv-agent-trigger');
  if (agentTrigger) {
    agentTrigger.addEventListener('click', () => {
      agentPanelController.togglePanel();
    });
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.agentPanelController = agentPanelController;
  window.NeuralVerse.curriculumController = curriculumController;
  window.NeuralVerse.searchController = searchController;
  window.NeuralVerse.contentController = contentController;
  window.NeuralVerse.progressController = progressController;
  window.NeuralVerse.workspaceController = workspaceController;
  window.NeuralVerse.breadcrumbsController = breadcrumbsController;
  window.NeuralVerse.knowledgeGraphController = knowledgeGraphController;

  // NV-1100-P7: Handle laboratory routes
  window.addEventListener('nv:routerendered', function (e) {
    var routeId = e.detail && e.detail.routeId;
    if (routeId === 'laboratory') {
      laboratoryController.loadLabIndex();
    } else if (routeId === 'laboratory-detail') {
      var hash = window.location.hash || '';
      var match = hash.match(/^#\/laboratory\/([a-z0-9-]+)$/);
      var slug = match ? match[1] : null;
      if (slug) {
        laboratoryController.loadLabBySlug(slug);
      }
    }
  });

  // NV-1100-P10: Initialize deferred subsystems
  if (window.NeuralVerse?.DeferredInitManager) {
    window.NeuralVerse.DeferredInitManager.initialize('advanced-memory');
    window.NeuralVerse.DeferredInitManager.initialize('semantic-learning');
    window.NeuralVerse.DeferredInitManager.initialize('visualization');
  } else {
    // Fallback: eager initialization if deferred manager unavailable
    if (window.NeuralVerse?.MemoryStorage) {
      window.NeuralVerse.MemoryStorage.load();
    }
    if (window.NeuralVerse?.MemoryIndexer) {
      window.NeuralVerse.MemoryIndexer.buildIndex();
    }
    if (window.NeuralVerse?.MemoryExportImport) {
      window.NeuralVerse.MemoryExportImport.integrateWithPersistenceManager();
    }
    if (window.NeuralVerse?.SessionContinuity) {
      window.NeuralVerse.SessionContinuity.loadSession();
    }
    if (window.NeuralVerse?.semanticLearning) {
      window.NeuralVerse.semanticLearning.init();
    }
    if (window.NeuralVerse?.vizSystem) {
      window.NeuralVerse.vizSystem.init();
    }
    if (window.NeuralVerse?.createVisualizationController) {
      var vizController = window.NeuralVerse.createVisualizationController({ root: document });
      vizController.init();
      window.NeuralVerse.visualizationController = vizController;
    }
  }

  // NV-1100-P8: Handle memory routes
  window.addEventListener('nv:routerendered', function (e) {
    var routeId = e.detail && e.detail.routeId;
    if (routeId === 'memory') {
      var mount = document.querySelector('[data-memory-root]');
      if (mount && window.NeuralVerse?.createMemoryUIController) {
        var memCtrl = window.NeuralVerse.createMemoryUIController({ root: document });
        memCtrl.init();
        memCtrl.renderDashboard(mount);
        window.NeuralVerse.memoryUIController = memCtrl;
      }
    } else if (routeId === 'memory-detail') {
      var hash = window.location.hash || '';
      var match = hash.match(/^#\/memory\/([a-zA-Z0-9_-]+)$/);
      var memoryId = match ? match[1] : null;
      if (memoryId) {
        var mount = document.querySelector('[data-memory-detail-mount]');
        if (mount && window.NeuralVerse?.createMemoryUIController) {
          var memCtrl = window.NeuralVerse.createMemoryUIController({ root: document });
          memCtrl.init();
          var memory = window.NeuralVerse.MemoryRegistry.get(memoryId);
          if (memory) {
            memCtrl.renderMemoryDetail(mount, memory);
          } else {
            mount.innerHTML = '<p class="nv-memory-empty">Memory not found. <a href="#/memory">Back to Memory</a></p>';
          }
          window.NeuralVerse.memoryUIController = memCtrl;
        }
      }
    }
  });

  // NV-1100-P9: Handle semantic learning route
  window.addEventListener('nv:routerendered', function (e) {
    if (e.detail && e.detail.routeId === 'semantic-learning') {
      var mount = document.getElementById('semantic-learning-root');
      if (!mount) return;

      // Ensure semantic engine is initialized (async)
      var initPromise = window.NeuralVerse?.semanticLearning?.ensureInitialized() || Promise.resolve();
      initPromise.then(function () {
        // Populate concept selector
        var select = document.getElementById('concept-select');
        if (select && window.NeuralVerse?.SemanticEngine) {
          var concepts = window.NeuralVerse.SemanticEngine.getAllConcepts();
          concepts.sort(function (a, b) { return a.name.localeCompare(b.name); });
          select.innerHTML = '<option value="">— Choose a concept —</option>';
          for (var i = 0; i < concepts.length; i++) {
            var opt = document.createElement('option');
            opt.value = concepts[i].id;
            opt.textContent = concepts[i].name + ' (' + concepts[i].category + ')';
            select.appendChild(opt);
          }

          select.addEventListener('change', function () {
            var conceptId = this.value;
            var resultsDiv = document.getElementById('semantic-results');
            if (!resultsDiv) return;
            if (!conceptId) {
              resultsDiv.innerHTML = '<p class="nv-sem-empty">Select a concept to see recommendations.</p>';
              return;
            }
            resultsDiv.innerHTML = window.NeuralVerse.SemanticUIController.renderSemanticPanel(conceptId);
          });
        }
      });
    }
  });

  // NV-1100-P1: Initialize persistence controller on settings route
  window.addEventListener('nv:routerendered', function (e) {
    if (e.detail && e.detail.routeId === 'settings') {
      if (window.NeuralVerse?.createPersistenceController) {
        const pc = window.NeuralVerse.createPersistenceController({ root: document });
        pc.init();
      }
      // NV-1100-P5B: Initialize review preferences controller
      const reviewSettings = createReviewSettingsController({ root: document.body });
      reviewSettings.init();
      window.NeuralVerse.reviewSettingsController = reviewSettings;

      // NV-1100-P11: Initialize generative layer settings
      if (window.NeuralVerse?.GenerativeController) {
        window.NeuralVerse.GenerativeController.init();
        _initGenerativeSettings();
      }
    }
  });
});

function shiftFocusToWorkspace() {
  const mainWorkspace = document.querySelector("#main-workspace");

  if (mainWorkspace) {
    mainWorkspace.focus({ preventScroll: true });
  }
}

window.addEventListener("hashchange", () => {
  window.requestAnimationFrame(shiftFocusToWorkspace);
});

// NV-1100-P5C: Review discovery search shortcuts
function wireReviewSearchShortcuts(searchController) {
  const discovery = window.NeuralVerse?.reviewDiscovery;
  if (!discovery) return;
  const results = document.getElementById('nv-curriculum-search-results');
  if (!results) return;
  let lastQuery = '';
  const observer = new MutationObserver(() => {
    const input = document.querySelector('#nv-curriculum-search-input');
    const query = input ? input.value : '';
    if (query === lastQuery) return;
    lastQuery = query;
    const existing = results.querySelector('[data-review-shortcuts-section]');
    if (existing) existing.remove();
    if (!discovery.isReviewQuery(query)) return;
    const html = discovery.renderReviewShortcutsSection(window.NeuralVerse?.reviewScheduler, { limit: 5 });
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const section = wrap.firstElementChild;
    if (section) {
      results.insertBefore(section, results.firstChild);
    }
  });
  observer.observe(results, { childList: true, subtree: true });
}

// NV-1100-P11: Generative layer settings initialization
function _initGenerativeSettings() {
  var ctrl = window.NeuralVerse?.GenerativeController;
  if (!ctrl) return;
  var settings = ctrl.getSettings();
  var root = document.querySelector('[data-gen-settings-root]');
  if (!root) return;

  var controls = root.querySelector('[data-gen-settings-controls]');
  if (!controls) return;

  controls.querySelectorAll('[data-gen-setting]').forEach(function (el) {
    var key = el.getAttribute('data-gen-setting');
    if (el.type === 'checkbox') {
      el.checked = !!settings[key];
    } else {
      el.value = settings[key] !== undefined ? settings[key] : '';
    }
    el.addEventListener('change', function () {
      var val = el.type === 'checkbox' ? el.checked : (el.type === 'number' ? Number(el.value) : el.value);
      ctrl.updateSettings({ [key]: val });
      var statusEl = root.querySelector('[data-status="gen-settings-status"]');
      if (statusEl) {
        statusEl.textContent = 'Settings saved.';
        statusEl.style.display = 'block';
        setTimeout(function () { statusEl.style.display = 'none'; }, 2000);
      }
    });
  });

  var testBtn = root.querySelector('[data-gen-action="test-connection"]');
  if (testBtn) {
    testBtn.addEventListener('click', async function () {
      var statusEl = root.querySelector('[data-status="gen-settings-status"]');
      if (statusEl) {
        statusEl.textContent = 'Testing connection...';
        statusEl.style.display = 'block';
      }
      var result = await ctrl.healthCheck();
      if (statusEl) {
        if (result.status === 'connected') {
          statusEl.textContent = 'Connected! ' + (result.models || 0) + ' model(s) found.';
          statusEl.style.color = '#22c55e';
        } else {
          statusEl.textContent = 'Connection failed: ' + (result.error || 'Unknown error');
          statusEl.style.color = '#ef4444';
        }
        setTimeout(function () { statusEl.style.display = 'none'; }, 5000);
      }
    });
  }

  var clearBtn = root.querySelector('[data-gen-action="clear-audit-log"]');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (window.NeuralVerse?.GenerationAuditLog) {
        window.NeuralVerse.GenerationAuditLog.clear();
        var statusEl = root.querySelector('[data-status="gen-settings-status"]');
        if (statusEl) {
          statusEl.textContent = 'Audit log cleared.';
          statusEl.style.display = 'block';
          setTimeout(function () { statusEl.style.display = 'none'; }, 2000);
        }
      }
    });
  }
}
