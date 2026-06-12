/**
 * NeuralVerse - Retrieval Workspace Page Controller
 * Handles DOM events, workspace exploration modes, SVG graph topology,
 * inspector panel sync, and search memory persistence.
 */
(function () {
  const adapter = window.NeuralVerseRetrievalAdapter;
  if (!adapter) {
    console.error("Retrieval Playground Adapter not found. Make sure retrieval-playground-adapter.js is loaded first.");
    return;
  }

  // Initialize seeded retrieval state
  const retrievalState = adapter.createSeededRetrievalState();

  // Workspace State variables
  let selectedReferenceId = null;
  let currentSearchQuery = "";
  let currentSearchResults = [];
  let currentCompiledEvidence = null;
  let selectedRelationship = null;
  let relationshipFilter = "all";
  let neighborhoodDepth = "full";
  let graphViewport = { x: 0, y: 0, scale: 1 };

  // Persistence State
  let pinnedReferences = [];
  let recentReferences = [];
  let savedQueries = [];
  let knowledgeTrail = [];
  let activeExplorationMode = "search";
  let activeInspectorTab = "reference";
  let evidenceTimeline = [];
  let preferencesEscapeHandlerBound = false;
  let inspectorResizeHandlerBound = false;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getReferenceLabel(refOrId) {
    const ref = typeof refOrId === "string" ? adapter.getReferenceById(retrievalState, refOrId) : refOrId;
    if (!ref) return escapeHtml(refOrId || "");
    return escapeHtml(ref.title.replace(/\s*\([^)]*\)\s*$/, ""));
  }

  function bindKeyboardActivation(element, handler) {
    if (!element || !handler) return;
    element.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler(e);
      }
    };
  }

  function normalizeGraphType(value) {
    return String(value || "related").toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-");
  }

  function getShortGraphLabel(ref) {
    const id = String(ref?.id || "");
    const title = String(ref?.title || id).replace(/\s*\([^)]*\)\s*$/, "");
    const label = title || id.replace(/^(paper|repo|notes)-/, "");
    return label.length > 18 ? `${label.slice(0, 16)}...` : label;
  }

  function getEvidenceCountForReference(refId) {
    return evidenceTimeline.reduce((count, item) => {
      const related = [
        item?.input,
        ...(item?.supportingReferences || []),
        ...(item?.lineage || [])
      ];
      return related.includes(refId) ? count + 1 : count;
    }, 0);
  }

  function getRelationshipLabel(rel) {
    const source = adapter.getReferenceById(retrievalState, rel.sourceReferenceId);
    const target = adapter.getReferenceById(retrievalState, rel.targetReferenceId);
    return `${source ? source.title : rel.sourceReferenceId} ${String(rel.type || "related").replace(/_/g, " ")} ${target ? target.title : rel.targetReferenceId}`;
  }

  function clampGraphScale(scale) {
    return Math.max(0.55, Math.min(2.35, scale));
  }

  function setGraphViewport(nextViewport, shouldSave = true) {
    graphViewport = {
      x: Number.isFinite(nextViewport.x) ? nextViewport.x : 0,
      y: Number.isFinite(nextViewport.y) ? nextViewport.y : 0,
      scale: clampGraphScale(Number.isFinite(nextViewport.scale) ? nextViewport.scale : 1)
    };
    const world = document.querySelector("#visual-graph-svg .graph-world");
    if (world) {
      world.setAttribute("transform", `translate(${graphViewport.x} ${graphViewport.y}) scale(${graphViewport.scale})`);
    }
    if (shouldSave) saveWorkspaceState();
  }

  function resetGraphViewport(shouldRender = false) {
    setGraphViewport({ x: 0, y: 0, scale: 1 });
    if (shouldRender) renderVisualGraph();
  }

  function createSvgElement(tag, attrs = {}) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        element.setAttribute(key, String(value));
      }
    });
    return element;
  }

  // Stage 6 - Workspace Personalization State
  let focusModeEnabled = false;
  let memoryPanelCollapsed = false;
  let resumeBannerDismissed = false;
  let pinnedQuickActions = ["compile_evidence", "open_graph", "run_saved_query", "focus_mode", "toggle_density"];
  let preferences = {
    defaultExplorationMode: "search",
    defaultInspectorTab: "reference",
    autoOpenInspector: true,
    preferredRelationshipFilter: "all",
    density: "comfortable",
    inspectorWidth: "340px"
  };
  let lastActiveTimestamp = 0;


  // Load state from localStorage
  function loadWorkspaceState() {
    try {
      const dataStr = localStorage.getItem("neuralverse.retrievalWorkspace.v1");
      if (dataStr) {
        const state = JSON.parse(dataStr);
        pinnedReferences = state.pinnedReferences || [];
        recentReferences = state.recentReferences || [];
        savedQueries = state.savedQueries || [];
        knowledgeTrail = state.knowledgeTrail || [];
        selectedReferenceId = state.selectedReferenceId || null;
        currentSearchQuery = state.currentSearchQuery || "";
        activeExplorationMode = state.activeExplorationMode || "search";
        activeInspectorTab = state.activeInspectorTab || "reference";
        currentCompiledEvidence = state.currentCompiledEvidence || null;
        selectedRelationship = state.selectedRelationship || null;
        relationshipFilter = state.relationshipFilter || "all";
        neighborhoodDepth = state.neighborhoodDepth || "full";
        graphViewport = state.graphViewport || { x: 0, y: 0, scale: 1 };
        evidenceTimeline = state.evidenceTimeline || [];

        // Stage 6 State
        focusModeEnabled = state.focusModeEnabled || false;
        memoryPanelCollapsed = state.memoryPanelCollapsed || false;
        resumeBannerDismissed = state.resumeBannerDismissed || false;
        pinnedQuickActions = state.pinnedQuickActions || ["compile_evidence", "open_graph", "run_saved_query", "focus_mode", "toggle_density"];
        preferences = state.preferences || {
          defaultExplorationMode: "search",
          defaultInspectorTab: "reference",
          autoOpenInspector: true,
          preferredRelationshipFilter: "all",
          density: "comfortable",
          inspectorWidth: "340px"
        };
        lastActiveTimestamp = state.lastActiveTimestamp || 0;

        // Apply visual preferences
        applyFocusModeStyles();
        applyMemoryCollapseStyles();
        applyDensityStyles();
        applyInspectorWidthStyles();

        if (lastActiveTimestamp > 0 && resumeBannerDismissed) {
          showSessionRestoredIndicator();
        }
      } else {
        resetStateToDefaults();
        applyFocusModeStyles();
        applyMemoryCollapseStyles();
        applyDensityStyles();
        applyInspectorWidthStyles();
      }
    } catch (e) {
      console.warn("Failed to load workspace state from localStorage", e);
      resetStateToDefaults();
    }
  }

  function resetStateToDefaults() {
    pinnedReferences = [];
    recentReferences = [];
    savedQueries = [];
    knowledgeTrail = [];
    selectedReferenceId = null;
    currentSearchQuery = "";
    activeExplorationMode = "search";
    activeInspectorTab = "reference";
    currentCompiledEvidence = null;
    selectedRelationship = null;
    relationshipFilter = "all";
    neighborhoodDepth = "full";
    graphViewport = { x: 0, y: 0, scale: 1 };
    evidenceTimeline = [];

    // Stage 6
    focusModeEnabled = false;
    memoryPanelCollapsed = false;
    resumeBannerDismissed = false;
    pinnedQuickActions = ["compile_evidence", "open_graph", "run_saved_query", "focus_mode", "toggle_density"];
    preferences = {
      defaultExplorationMode: "search",
      defaultInspectorTab: "reference",
      autoOpenInspector: true,
      preferredRelationshipFilter: "all",
      density: "comfortable",
      inspectorWidth: "340px"
    };
    lastActiveTimestamp = 0;

    applyFocusModeStyles();
    applyMemoryCollapseStyles();
    applyDensityStyles();
    applyInspectorWidthStyles();
  }

  // Save state to localStorage
  function saveWorkspaceState() {
    try {
      lastActiveTimestamp = Date.now();
      const state = {
        pinnedReferences,
        recentReferences,
        savedQueries,
        knowledgeTrail,
        selectedReferenceId,
        currentSearchQuery,
        activeExplorationMode,
        activeInspectorTab,
        currentCompiledEvidence,
        selectedRelationship,
        relationshipFilter,
        neighborhoodDepth,
        graphViewport,
        evidenceTimeline,
        // Stage 6
        focusModeEnabled,
        memoryPanelCollapsed,
        resumeBannerDismissed,
        pinnedQuickActions,
        preferences,
        lastActiveTimestamp
      };
      localStorage.setItem("neuralverse.retrievalWorkspace.v1", JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save workspace state to localStorage", e);
    }
  }


  // Helper: Show session restored status indicator
  function showSessionRestoredIndicator() {
    const indicator = document.getElementById("session-restored-indicator");
    if (indicator) {
      indicator.style.opacity = "1";
      setTimeout(() => {
        indicator.style.opacity = "0";
      }, 2500);
    }
  }

  // Stage 6 Visual layout helper functions
  function applyFocusModeStyles() {
    const body = document.body;
    const focusBtn = document.getElementById("playground-focus-button");
    if (focusModeEnabled) {
      body.classList.add("nv-focus-mode");
      if (focusBtn) {
        focusBtn.textContent = "Exit Focus";
        focusBtn.setAttribute("data-variant", "primary");
      }
    } else {
      body.classList.remove("nv-focus-mode");
      if (focusBtn) {
        focusBtn.textContent = "Focus Mode";
        focusBtn.setAttribute("data-variant", "secondary");
      }
    }
  }

  function applyMemoryCollapseStyles() {
    const memorySection = document.getElementById("memory-layer-section");
    const collapseBtn = document.getElementById("memory-toggle-collapse-button");
    if (memorySection) {
      if (memoryPanelCollapsed) {
        memorySection.classList.add("collapsed");
        if (collapseBtn) collapseBtn.textContent = "Expand Layer";
      } else {
        memorySection.classList.remove("collapsed");
        if (collapseBtn) collapseBtn.textContent = "Collapse Layer";
      }
    }
  }

  function applyDensityStyles() {
    const mainWorkspace = document.querySelector(".nv-main-workspace");
    const densitySelect = document.getElementById("pref-density");
    if (mainWorkspace) {
      if (preferences.density === "compact") {
        mainWorkspace.classList.add("density-compact");
      } else {
        mainWorkspace.classList.remove("density-compact");
      }
    }
    if (densitySelect) {
      densitySelect.value = preferences.density;
    }
  }

  function applyInspectorWidthStyles() {
    const inspectorSpace = document.querySelector(".inspector-space");
    const workspaceLayout = document.querySelector(".workspace-layout");
    const widthSelect = document.getElementById("pref-inspector-width");
    if (inspectorSpace && workspaceLayout) {
      const canUseSplitLayout = window.matchMedia("(min-width: 1025px)").matches;
      inspectorSpace.style.width = canUseSplitLayout ? preferences.inspectorWidth : "";
      workspaceLayout.style.gridTemplateColumns = canUseSplitLayout ? `minmax(0, 1fr) ${preferences.inspectorWidth}` : "";
    }
    if (widthSelect) {
      widthSelect.value = preferences.inspectorWidth;
    }
  }

  // Resume Banner Rendering
  function renderResumeBanner() {
    const container = document.getElementById("resume-banner-container");
    if (!container) return;

    const hasData = (recentReferences.length > 0 || pinnedReferences.length > 0 || currentSearchQuery || evidenceTimeline.length > 0);
    if (lastActiveTimestamp > 0 && !resumeBannerDismissed && hasData) {
      const lastDate = new Date(lastActiveTimestamp).toLocaleString();
      container.innerHTML = `
        <div class="nv-panel nv-cluster nv-cluster--gap-md" style="background-color: var(--sys-color-surface-container-high); border: 1px solid var(--sys-color-accent-primary); padding: var(--sys-space-stack-sm) var(--sys-space-inline-md); justify-content: space-between; align-items: center; border-radius: var(--ref-radius-soft); margin-bottom: var(--sys-space-stack-sm);" role="status" aria-live="polite">
          <div class="nv-stack nv-stack--gap-xs" style="flex: 1;">
            <strong style="color: var(--sys-color-accent-primary); font-size: 0.75rem;">Previous research session</strong>
            <span style="font-size: 0.65rem; color: var(--sys-color-text-secondary);">
              Last active ${lastDate}${currentSearchQuery ? ` · query "${escapeHtml(currentSearchQuery)}"` : ""}${selectedReferenceId ? ` · ${getReferenceLabel(selectedReferenceId)}` : ""}
            </span>
          </div>
          <div class="nv-cluster nv-cluster--gap-sm">
            <button id="resume-banner-action-restore" class="nv-button" data-variant="primary" style="font-size: 0.7rem; padding: 4px 12px; min-block-size: unset;">Resume</button>
            <button id="resume-banner-action-dismiss" class="nv-button" data-variant="secondary" style="font-size: 0.7rem; padding: 4px 12px; min-block-size: unset;">Dismiss</button>
          </div>
        </div>
      `;

      document.getElementById("resume-banner-action-restore").onclick = () => {
        resumeBannerDismissed = true;
        saveWorkspaceState();
        container.innerHTML = "";
        showSessionRestoredIndicator();
        initPlayground();
      };

      document.getElementById("resume-banner-action-dismiss").onclick = () => {
        resumeBannerDismissed = true;
        saveWorkspaceState();
        container.innerHTML = "";
      };

    } else {
      container.innerHTML = "";
    }
  }

  // Live Research Snapshot
  function renderResearchSnapshot() {}

  // Smart Empty State
  function renderSmartEmptyWorkspace() {
    const resultsContainer = document.getElementById("search-results-container");
    if (!resultsContainer) return;

    if (!currentSearchQuery && currentSearchResults.length === 0) {
      let pinnedSection = "";
      if (pinnedReferences.length > 0) {
        pinnedSection = `
          <div class="nv-stack nv-stack--gap-xs" style="flex: 1; min-width: 200px;">
            <h4 style="margin: 0; font-size: 0.7rem; color: var(--sys-color-text-secondary);">Pinned</h4>
            <div class="nv-stack nv-stack--gap-xs">
              ${pinnedReferences.slice(0, 3).map(id => {
                const ref = retrievalState.references.find(r => r.id === id);
                return ref ? `
                  <button class="nv-card compact-action-card" onclick="window.selectReference('${ref.id}')">
                    ${escapeHtml(ref.title)}
                  </button>
                ` : "";
              }).join("")}
            </div>
          </div>
        `;
      }

      let recentQuerySection = "";
      if (savedQueries.length > 0) {
        recentQuerySection = `
          <div class="nv-stack nv-stack--gap-xs" style="flex: 1; min-width: 200px;">
            <h4 style="margin: 0; font-size: 0.7rem; color: var(--sys-color-text-secondary);">Saved Queries</h4>
            <div class="nv-stack nv-stack--gap-xs">
              ${savedQueries.slice(0, 3).map(q => `
                <button class="nv-button" data-variant="secondary" style="text-align: left; padding: 4px 8px; font-size: 0.65rem; width: 100%; min-block-size: unset;" onclick="window.runSearch('${q.replace(/'/g, "\\'")}', true)">
                  ${escapeHtml(q)}
                </button>
              `).join("")}
            </div>
          </div>
        `;
      }

      let recentRefSection = "";
      if (recentReferences.length > 0) {
        recentRefSection = `
          <div class="nv-stack nv-stack--gap-xs" style="flex: 1; min-width: 200px;">
            <h4 style="margin: 0; font-size: 0.7rem; color: var(--sys-color-text-secondary);">Recent</h4>
            <div class="nv-stack nv-stack--gap-xs">
              ${recentReferences.slice(0, 3).map(id => {
                const ref = retrievalState.references.find(r => r.id === id);
                return ref ? `
                  <button class="nv-card compact-action-card" onclick="window.selectReference('${ref.id}')">
                    ${escapeHtml(ref.title)}
                  </button>
                ` : "";
              }).join("")}
            </div>
          </div>
        `;
      }

      resultsContainer.innerHTML = `
        <div class="nv-panel nv-stack nv-stack--gap-md" style="background-color: var(--sys-color-surface-container-lowest); border: 1px dashed var(--sys-color-border-subtle); padding: var(--sys-space-inset-md); text-align: center; border-radius: var(--ref-radius-soft); width: 100%;">
          <h3 style="margin: 0; font-size: var(--sys-font-body-size); color: var(--sys-color-text-primary); font-weight: var(--ref-font-weight-semibold);">Start with a search</h3>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0 0 var(--sys-space-stack-sm) 0;">
            Type a concept or reopen a saved research context.
          </p>
          <div class="nv-cluster nv-cluster--gap-md" style="justify-content: center; align-items: start; width: 100%; text-align: left; flex-wrap: wrap;">
            ${pinnedSection || recentQuerySection || recentRefSection ? `
              ${pinnedSection}
              ${recentQuerySection}
              ${recentRefSection}
            ` : createRichEmptyState({
                 icon: "",
                 title: "Search the registry",
                 explanation: "Use Enter to run a query. Select any result to inspect it immediately.",
                 primaryAction: {
                   label: "Focus Search",
                   onclick: "document.getElementById('playground-search-input').focus()"
                 }
               })}
          </div>
        </div>
      `;
    }
  }

  function renderQuickActions() {}

  // Progressive Workspace Adaptation Controls
  function updateProgressiveFeatures() {
    const evTab = document.getElementById("tab-insp-ev");
    if (evTab) {
      if (evidenceTimeline && evidenceTimeline.length > 0) {
        evTab.style.display = "block";
      } else {
        evTab.style.display = "none";
        if (activeInspectorTab === "evidence") {
          switchInspectorTab("reference");
        }
      }
    }

    // Always keep Search, Graph, and Discovery modes available
    const alwaysVisibleTabs = ["tab-search", "tab-graph", "tab-discovery"];
    alwaysVisibleTabs.forEach(tabId => {
      const tab = document.getElementById(tabId);
      if (tab) {
        tab.style.display = "flex";
        tab.style.pointerEvents = "auto";
      }
    });

    const compareTab = document.getElementById("tab-compare");
    if (compareTab) {
      if (pinnedReferences && pinnedReferences.length >= 2) {
        compareTab.style.display = "flex";
        compareTab.style.pointerEvents = "auto";
      } else {
        compareTab.style.display = "none";
        compareTab.style.pointerEvents = "none";
        if (activeExplorationMode === "compare") {
          switchExplorationMode("search");
        }
      }
    }

    const filterSelect = document.getElementById("graph-filter-select");
    const depthSelect = document.getElementById("graph-hop-select");
    const filterLabel = filterSelect ? filterSelect.previousElementSibling : null;
    const depthLabel = depthSelect ? depthSelect.previousElementSibling : null;
    const chipsContainer = document.getElementById("graph-filter-chips-container");

    if (filterSelect) filterSelect.style.display = "inline-block";
    if (depthSelect) depthSelect.style.display = "inline-block";
    if (filterLabel) filterLabel.style.display = "inline";
    if (depthLabel) depthLabel.style.display = "inline";
    if (chipsContainer) chipsContainer.style.display = relationshipFilter === "all" ? "none" : "flex";
    renderGraphFilterChips();
  }

  // Render progressive filter chips in the graph container
  function renderGraphFilterChips() {
    const container = document.getElementById("graph-filter-chips-container");
    if (!container) return;

    if (!relationshipFilter || relationshipFilter === "all") {
      container.innerHTML = `
        <span class="nv-muted" style="font-size: 0.65rem;">No active filter</span>
      `;
      return;
    }

    container.innerHTML = `
      <div class="nv-micro-badge" style="gap: 6px; padding: 2px 8px; border-radius: 12px; background: var(--sys-color-surface-container-high); border: 1px solid var(--sys-color-border-subtle); color: var(--sys-color-text-secondary); display: inline-flex; align-items: center; font-size: 0.65rem;">
        <span>Filter: <strong>${relationshipFilter.toUpperCase()}</strong></span>
        <button onclick="window.resetGraphFilter && window.resetGraphFilter()" aria-label="Clear filter" style="background: none; border: none; padding: 0; margin-left: 4px; cursor: pointer; color: var(--sys-color-text-muted); font-size: 0.85rem; line-height: 1; display: inline-flex; align-items: center; justify-content: center;">&times;</button>
      </div>
    `;
  }

  // Helper: Create a compact empty state.
  function createRichEmptyState(config) {
    return `
      <div class="nv-rich-empty-state nv-animate-fade">
        ${config.icon ? `<div class="nv-rich-empty-illustration" aria-hidden="true">${config.icon}</div>` : ""}
        <h4 class="nv-rich-empty-title">${config.title}</h4>
        <p class="nv-rich-empty-desc">${config.explanation}</p>
        <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: center; align-items: center;">
          ${config.primaryAction ? `<button class="nv-button" data-variant="primary" style="font-size: 0.65rem; padding: 4px 10px; min-block-size: unset;" onclick="${config.primaryAction.onclick}">${config.primaryAction.label}</button>` : ''}
          ${config.secondaryAction ? `<button class="nv-button" data-variant="secondary" style="font-size: 0.65rem; padding: 4px 10px; min-block-size: unset;" onclick="${config.secondaryAction.onclick}">${config.secondaryAction.label}</button>` : ''}
        </div>
      </div>
    `;
  }

  // Helper: Add knowledge trail event log
  function addTrailEvent(type, label, metadata = null) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const event = {
      id: 'trail_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type,
      label,
      timestamp,
      metadata
    };
    knowledgeTrail.unshift(event);
    if (knowledgeTrail.length > 20) {
      knowledgeTrail.pop();
    }
    saveWorkspaceState();
    updateWorkspaceState();
  }

  // Helper: Restore trail context on click
  function restoreTrailContext(event) {
    const meta = event.metadata;
    if (!meta) return;

    if (meta.referenceId) {
      selectedReferenceId = meta.referenceId;
      addToRecentlyViewed(meta.referenceId);
      switchInspectorTab("reference");

      syncSelectionHighlighting();
      renderReferenceInspector();
      renderMemoryLayer();

      if (activeExplorationMode === "graph") {
        renderVisualGraph();
      } else if (activeExplorationMode === "discovery") {
        renderDiscoveryMode();
      } else if (activeExplorationMode === "compare") {
        renderCompareMode();
      }
    } else if (meta.query) {
      const searchInput = document.getElementById("playground-search-input");
      if (searchInput) {
        searchInput.value = meta.query;
      }
      runSearch(meta.query, true);
    } else if (meta.relationship) {
      selectedRelationship = meta.relationship;
      switchInspectorTab("relationship");
      renderRelationshipInspector();
    }

    saveWorkspaceState();
  }

  // DOM Rendering & Sync: Seeded Reference list (in Search Mode panel)
  function renderSeededReferences() {}

  // DOM Rendering: Search Results
  function renderSearchResults() {
    const container = document.getElementById("search-results-container");
    if (!container) return;

    if (!currentSearchQuery || currentSearchQuery.trim() === "") {
      renderSmartEmptyWorkspace();
      return;
    }

    if (currentSearchResults.length === 0) {
      container.innerHTML = `
        <div class="nv-empty-state">
          <p class="nv-muted" style="font-size: var(--sys-font-body-size); font-weight: var(--ref-font-weight-medium); color: var(--sys-color-text-primary); margin-bottom: var(--sys-space-stack-xs);">No matches for "${escapeHtml(currentSearchQuery)}"</p>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">Try a broader concept such as transformer, vision, rag, agent, or pytorch.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = currentSearchResults.map((res, index) => {
      const isSelected = res.reference.id === selectedReferenceId;
      return `
        <div class="nv-card result-card ${isSelected ? 'nv-card--selected' : ''}"
             data-ref-id="${res.reference.id}"
             tabindex="0"
             role="button"
             aria-selected="${isSelected ? 'true' : 'false'}"
             aria-label="Result ${index + 1}: ${escapeHtml(res.reference.title)}">
          <span class="result-rank" aria-hidden="true">${index + 1}</span>
          <div class="nv-stack nv-stack--gap-xs" style="min-width: 0;">
            <h4 class="result-title">${escapeHtml(res.reference.title)}</h4>
            <div class="result-meta">
              <span class="nv-badge" data-variant="info">${escapeHtml(res.reference.type)}</span>
              <span>${res.score} match${res.score === 1 ? "" : "es"}</span>
              <span>${escapeHtml(res.matchedKeywords.slice(0, 3).join(", "))}</span>
            </div>
          </div>
          <button class="nv-button search-card-compile-btn" data-id="${res.reference.id}" data-variant="primary" style="padding: 4px 10px; font-size: 0.7rem; min-block-size: unset;" aria-label="Compile evidence for ${escapeHtml(res.reference.title)}">
            Compile
          </button>
        </div>
      `;
    }).join("");

    bindSelectionClicks(container);
  }

  // DOM Rendering: Reference Inspector Panel
  function renderReferenceInspector() {
    const container = document.getElementById("selected-reference-container");
    const pinBtn = document.getElementById("playground-pin-button");
    const compileRefBtn = document.getElementById("playground-compile-ref-button");
    if (!container) return;

    if (!selectedReferenceId) {
      container.innerHTML = `
        <div class="nv-empty-state">
          <p class="nv-muted" style="font-size: var(--sys-font-body-size); font-weight: var(--ref-font-weight-medium); color: var(--sys-color-text-primary); margin-bottom: var(--sys-space-stack-xs);">No reference selected</p>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">Choose a result, graph node, or memory item.</p>
        </div>
      `;
      if (pinBtn) pinBtn.disabled = true;
      if (compileRefBtn) compileRefBtn.disabled = true;
      renderDiscoverySpace();
      renderRelationshipNeighborhood();
      return;
    }

    const ref = adapter.getReferenceById(retrievalState, selectedReferenceId);
    if (!ref) {
      container.innerHTML = `
        <div class="nv-empty-state">
          <p class="nv-muted">Selected reference details could not be loaded.</p>
        </div>
      `;
      if (pinBtn) pinBtn.disabled = true;
      if (compileRefBtn) compileRefBtn.disabled = true;
      renderDiscoverySpace();
      renderRelationshipNeighborhood();
      return;
    }

    const rels = adapter.getRelationshipsForReference(retrievalState, ref.id);
    const isPinned = pinnedReferences.includes(ref.id);
    const topKeywords = ref.keywords.slice(0, 4);
    const sourceLabel = ref.source.startsWith("local://") ? ref.source.replace("local://", "") : new URL(ref.source).hostname;

    container.innerHTML = `
      <div class="nv-stack nv-stack--gap-sm">
        <div class="nv-stack nv-stack--gap-xs">
          <h4 style="margin: 0; font-size: var(--sys-font-body-size); color: var(--sys-color-text-primary); font-weight: var(--ref-font-weight-semibold);">${escapeHtml(ref.title)}</h4>
          <div class="reference-meta">
            <span class="nv-badge" data-variant="info">${escapeHtml(ref.type)}</span>
            <span>${rels.length} connection${rels.length === 1 ? "" : "s"}</span>
            <a href="${ref.source}" target="_blank" rel="noreferrer" style="color: var(--sys-color-accent-primary); text-decoration: none;">${escapeHtml(sourceLabel)}</a>
          </div>
        </div>
        <p class="inspector-summary">
          ${topKeywords.length ? `Useful for ${escapeHtml(topKeywords.join(", "))}.` : "No keywords available."}
        </p>

        <details>
          <summary style="font-size: 0.7rem; font-weight: bold; cursor: pointer; color: var(--sys-color-text-secondary);">Keywords</summary>
          <div class="nv-cluster nv-cluster--gap-xs" style="flex-wrap: wrap; padding-top: 4px;">
            ${ref.keywords.map(kw => `<span class="nv-badge" data-variant="neutral" style="font-size: 0.6rem;">${escapeHtml(kw)}</span>`).join("")}
          </div>
        </details>

        <details>
          <summary style="font-size: 0.7rem; font-weight: bold; cursor: pointer; color: var(--sys-color-text-secondary);">Connections</summary>
          <div class="compact-list" style="max-height: 150px; overflow-y: auto; padding-top: 6px;">
            ${rels.length === 0 ? '<p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">No direct graph connections.</p>' : rels.map(rel => {
              const isOutgoing = rel.sourceReferenceId === ref.id;
              const targetId = isOutgoing ? rel.targetReferenceId : rel.sourceReferenceId;
              const target = adapter.getReferenceById(retrievalState, targetId);
              return `
                <button class="nv-card compact-action-card" style="padding: 6px; font-size: 0.65rem;" data-rel-id="${rel.id}">
                  <strong>${escapeHtml(rel.type)}</strong> ${isOutgoing ? "to" : "from"} ${escapeHtml(target ? target.title : targetId)}
                </button>
              `;
            }).join("")}
          </div>
        </details>
      </div>
    `;

    // Bind relationship click inside Reference Inspector
    container.querySelectorAll(".nv-card[data-rel-id]").forEach(card => {
      card.onclick = (e) => {
        e.stopPropagation();
        const relId = card.getAttribute("data-rel-id");
        const rel = retrievalState.relationships.find(r => r.id === relId);
        if (rel) {
          selectedRelationship = rel;
          addTrailEvent("inspect_rel", `Inspected relationship "${rel.sourceReferenceId} ➔ ${rel.targetReferenceId}"`, { relationship: rel });
          switchInspectorTab("relationship");
          renderRelationshipInspector();
        }
      };
      bindKeyboardActivation(card, card.onclick);
    });

    if (pinBtn) {
      pinBtn.disabled = false;
      pinBtn.textContent = isPinned ? "Unpin Reference" : "Pin Reference";
      pinBtn.onclick = () => {
        if (isPinned) {
          unpinReference(ref.id);
        } else {
          pinReference(ref.id);
        }
      };
    }

    if (compileRefBtn) {
      compileRefBtn.disabled = false;
      compileRefBtn.onclick = () => {
        if (window.NV_DEBUG) console.log(`Compiling evidence from reference: ${ref.id}`);
        currentCompiledEvidence = adapter.compileEvidenceFromReference(retrievalState, ref.id);
        if (currentCompiledEvidence) {
          addToTimeline(currentCompiledEvidence);
        }
        addTrailEvent("compile_ref", `Compiled evidence from "${ref.id}"`, { referenceId: ref.id });
        switchInspectorTab("evidence");
        renderEvidence(currentCompiledEvidence);
        saveWorkspaceState();
      };
    }

    renderDiscoverySpace();
    renderRelationshipNeighborhood();
  }

  // DOM Rendering: contextual discovery recommendations.
  function renderDiscoverySpace() {
    const container = document.getElementById("discovery-container");
    if (!container) return;

    if (!selectedReferenceId) {
      // Show Discovery Empty State
      container.innerHTML = createRichEmptyState({
        icon: "",
        title: "Recommendations appear after selection",
        explanation: "Select a reference to see the next useful paths.",
        primaryAction: {
          label: "Focus Search",
          onclick: "document.getElementById('playground-search-input').focus()"
        }
      });
      return;
    }

    const sessionState = { recentReferences };
    const discoveryData = adapter.getDiscoverySuggestions(retrievalState, selectedReferenceId, sessionState);
    const continuations = adapter.getCitationContinuations(retrievalState, selectedReferenceId);

    const cards = [];
    if (discoveryData.suggestions && discoveryData.suggestions.length > 0) {
      discoveryData.suggestions.slice(0, 4).forEach(item => {
        cards.push({
          ref: item.reference,
          category: item.category,
          reason: item.reason
        });
      });
    }

    continuations.slice(0, 2).forEach(c => {
      if (!cards.some(item => item.ref.id === c.targetReferenceId)) {
        const ref = adapter.getReferenceById(retrievalState, c.targetReferenceId);
        if (ref) {
          cards.push({
            ref,
            category: c.relType,
            reason: c.description
          });
        }
      }
    });

    let html = "";

    if (cards.length > 0) {
      html += `
        <div class="discovery-section-title">Recommended Next</div>
        <div class="compact-list" aria-label="Contextual recommendations">
          ${cards.slice(0, 6).map(item => `
            <button class="nv-discovery-card" data-ref-id="${item.ref.id}">
              <div style="display: flex; justify-content: space-between; gap: 8px; align-items: center;">
                <span style="font-weight: var(--ref-font-weight-semibold); font-size: 0.68rem; color: var(--sys-color-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(item.ref.title)}</span>
                <span class="nv-badge" data-variant="neutral">${escapeHtml(item.category)}</span>
              </div>
              <span style="font-size: 0.6rem; color: var(--sys-color-text-secondary); line-height: 1.3;">${escapeHtml(item.reason)}</span>
            </button>
          `).join("")}
        </div>
      `;
    }

    if (discoveryData.isDeadEnd) {
      html += `
        <div class="dead-end-fallback-box" style="padding: 6px; background-color: rgba(239, 68, 68, 0.05); border: 1px dashed var(--sys-color-semantic-error); border-radius: var(--ref-radius-soft); margin-top: var(--sys-space-stack-xs);">
          <p style="margin: 0; font-size: 0.6rem; color: var(--sys-color-semantic-error);">No direct connections yet.</p>
          ${discoveryData.suggestedQuery ? `
            <button class="nv-button dead-end-query-btn" data-query="${discoveryData.suggestedQuery}" data-variant="secondary" style="font-size: 0.6rem; padding: 2px 6px; width: 100%; text-align: left; margin-top: 4px; min-block-size: unset;">
              Search "${escapeHtml(discoveryData.suggestedQuery)}"
            </button>
          ` : ""}
        </div>
      `;
    }

    container.innerHTML = html;

    // Add interactive click/keydown event listeners
    // Carousel suggestions
    container.querySelectorAll(".nv-discovery-card").forEach(card => {
      card.onclick = () => {
        const refId = card.getAttribute("data-ref-id");
        addTrailEvent("Discovery suggestion opened", `Opened suggestion "${refId}"`, { referenceId: refId });
        selectReference(refId);
      };
      bindKeyboardActivation(card, card.onclick);
    });

    // Dead-end query buttons
    container.querySelectorAll(".dead-end-query-btn").forEach(btn => {
      btn.onclick = () => {
        const query = btn.getAttribute("data-query");
        addTrailEvent("Dead-end fallback used", `Searched for "${query}" from dead-end`, { query });
        const searchInput = document.getElementById("playground-search-input");
        if (searchInput) {
          searchInput.value = query;
        }
        runSearch(query);
      };
    });

  }

  // DOM Rendering: Relationship Neighborhood Panel (Textual/card-based direct relationships)
  function renderRelationshipNeighborhood() {
    const container = document.getElementById("relationship-neighborhood-container");
    if (!container) return;

    if (!selectedReferenceId) {
      container.innerHTML = `
        <div class="nv-empty-state"><p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">Select a reference to view neighbors.</p></div>
      `;
      return;
    }

    const neighborhood = adapter.getRelationshipNeighborhood(retrievalState, selectedReferenceId);
    if (!neighborhood || neighborhood.neighbors.length === 0) {
      container.innerHTML = `
        <div class="discovery-section-title">Relationship Neighborhood</div>
        <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0; padding: var(--sys-space-stack-xs);">No direct relationships in neighborhood.</p>
      `;
      return;
    }

    let html = `
      <div class="discovery-section-title">Neighbors</div>
      <div class="neighborhood-grid">
    `;

    for (const item of neighborhood.neighbors) {
      const neighbor = item.neighbor;
      if (!neighbor) continue;
      const isOutgoing = item.direction === "outgoing";
      const dirText = isOutgoing ? "to" : "from";
      const badgeVariant = isOutgoing ? "info" : "neutral";

      html += `
        <button class="neighborhood-card neighborhood-item-card" data-ref-id="${neighbor.id}" style="cursor: pointer; text-align: left;">
          <div class="neighborhood-header">
            <span class="neighborhood-direction nv-badge" data-variant="${badgeVariant}">${dirText}</span>
            <span class="nv-badge" data-variant="warning">${escapeHtml(item.type)}</span>
          </div>
          <div style="font-weight: var(--ref-font-weight-semibold); font-size: 0.65rem; color: var(--sys-color-text-primary); margin-top: 2px;">
            ${escapeHtml(neighbor.title)}
          </div>
          <div class="neighborhood-context">
            ${escapeHtml(item.context || "No context")}
          </div>
        </button>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // Add interactive click to open neighborhood references
    container.querySelectorAll(".neighborhood-item-card").forEach(card => {
      card.onclick = () => {
        const refId = card.getAttribute("data-ref-id");
        addTrailEvent("Neighborhood reference opened", `Opened neighborhood node "${refId}"`, { referenceId: refId });
        selectReference(refId);
      };
      bindKeyboardActivation(card, card.onclick);
    });
  }

  // DOM Rendering: Relationship Inspector Panel
  function renderRelationshipInspector() {
    const container = document.getElementById("selected-relationship-container");
    if (!container) return;

    if (!selectedRelationship) {
      container.innerHTML = `
        <div class="nv-empty-state">
          <div class="nv-empty-state-icon" aria-hidden="true">🔗</div>
          <p class="nv-muted" style="font-size: var(--sys-font-body-size); font-weight: var(--ref-font-weight-medium); color: var(--sys-color-text-primary); margin-bottom: var(--sys-space-stack-xs);">No Relationship Selected</p>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">Click a connection line in the topological graph to view properties.</p>
        </div>
      `;
      return;
    }

    const rel = selectedRelationship;
    container.innerHTML = `
      <div class="nv-card nv-card--selected" style="margin: 0; border: none; background-color: var(--sys-color-surface-container-low) !important; cursor: default;">
        <h4 style="margin: 0; font-size: var(--sys-font-body-size); color: var(--sys-color-text-primary); font-weight: var(--ref-font-weight-semibold);">${rel.id}</h4>
        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.4;"></div>
        <p class="nv-muted" style="font-size: var(--sys-font-caption-size); line-height: 1.6; margin: 0;">
          <strong>Type:</strong> <span class="nv-badge" data-variant="info">${rel.type}</span><br>
          <strong>Strength:</strong> <span class="nv-badge" data-variant="${rel.strength >= 0.9 ? 'success' : 'neutral'}">${rel.strength}</span><br>
          <strong>Source Node:</strong> <span style="font-family: var(--sys-font-code-family);">${rel.sourceReferenceId}</span><br>
          <strong>Target Node:</strong> <span style="font-family: var(--sys-font-code-family);">${rel.targetReferenceId}</span>
        </p>
        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.4;"></div>
        <p class="nv-muted" style="font-size: var(--sys-font-body-size); line-height: 1.5; margin: 0; font-style: italic;">
          "${rel.context || 'No citation context details available.'}"
        </p>
        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.4;"></div>
        <div class="nv-cluster nv-cluster--gap-sm" style="margin-top: 8px;">
          <button id="playground-follow-source-btn" class="nv-button" data-variant="secondary" style="flex: 1; padding: 4px 8px; font-size: 0.65rem; min-block-size: unset;">Follow Source</button>
          <button id="playground-follow-target-btn" class="nv-button" data-variant="primary" style="flex: 1; padding: 4px 8px; font-size: 0.65rem; min-block-size: unset;">Follow Target</button>
        </div>
      </div>
    `;

    // Bind Follow buttons
    const followSrcBtn = document.getElementById("playground-follow-source-btn");
    const followTgtBtn = document.getElementById("playground-follow-target-btn");

    if (followSrcBtn) {
      followSrcBtn.onclick = () => {
        addTrailEvent("Followed relationship source", `Followed source "${rel.sourceReferenceId}" from edge "${rel.id}"`, { referenceId: rel.sourceReferenceId });
        selectReference(rel.sourceReferenceId);
      };
    }
    if (followTgtBtn) {
      followTgtBtn.onclick = () => {
        addTrailEvent("Followed relationship target", `Followed target "${rel.targetReferenceId}" from edge "${rel.id}"`, { referenceId: rel.targetReferenceId });
        selectReference(rel.targetReferenceId);
      };
    }
  }

  // Add an evidence compilation to the timeline history
  function addToTimeline(comp) {
    if (!comp) return;
    // Avoid duplicate IDs in timeline
    evidenceTimeline = evidenceTimeline.filter(item => item.id !== comp.id);
    evidenceTimeline.unshift(comp);
    if (evidenceTimeline.length > 5) {
      evidenceTimeline.pop();
    }
    saveWorkspaceState();
  }

  // DOM Rendering: Evidence Compiler output (Evidence Inspector Panel)
  function renderEvidence(comp) {
    const container = document.getElementById("evidence-compilation-container");
    if (!container) return;

    if (!comp) {
      container.innerHTML = `
        <div class="nv-empty-state" style="padding: var(--sys-space-stack-md); text-align: center;">
          <p class="nv-muted" style="font-size: var(--sys-font-body-size); font-weight: var(--ref-font-weight-medium); color: var(--sys-color-text-primary); margin-bottom: var(--sys-space-stack-xs);">No evidence compiled</p>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin-bottom: var(--sys-space-stack-md);">Compile the current query or selected reference.</p>
          <div class="nv-stack nv-stack--gap-xs" style="align-items: stretch;">
            <button class="nv-button" id="evidence-empty-compile-query" data-variant="primary" style="font-size: var(--sys-font-caption-size);">
              Compile Current Query
            </button>
            <button class="nv-button" id="evidence-empty-compile-ref" data-variant="secondary" style="font-size: var(--sys-font-caption-size);" disabled>
              Compile Selected Reference
            </button>
          </div>
        </div>

        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-md); opacity: 0.4;"></div>

        <!-- Timeline / History at bottom of empty state -->
        <div id="evidence-timeline-empty-container"></div>
      `;

      // Bind empty state buttons
      const emptyCompileQuery = document.getElementById("evidence-empty-compile-query");
      if (emptyCompileQuery) {
        emptyCompileQuery.disabled = !currentSearchQuery;
        if (currentSearchQuery) {
          emptyCompileQuery.innerHTML = `Compile Query: <span style="font-family: var(--sys-font-code-family); font-size: 0.55rem; opacity: 0.8;">"${currentSearchQuery}"</span>`;
        } else {
          emptyCompileQuery.innerHTML = `Compile Query <span style="font-size: 0.55rem; opacity: 0.8;">(No Active Query)</span>`;
        }
        emptyCompileQuery.onclick = () => {
          if (currentSearchQuery) {
            currentCompiledEvidence = adapter.compileEvidenceFromQuery(retrievalState, currentSearchQuery);
            if (currentCompiledEvidence) addToTimeline(currentCompiledEvidence);
            selectedReferenceId = null;
            selectedRelationship = null;
            syncSelectionHighlighting();
            renderReferenceInspector();
            renderRelationshipInspector();
            addTrailEvent("compile_query", `Compiled evidence from query "${currentSearchQuery}" via empty state`, { query: currentSearchQuery });
            renderEvidence(currentCompiledEvidence);
            saveWorkspaceState();
          }
        };
      }

      const emptyCompileRef = document.getElementById("evidence-empty-compile-ref");
      if (emptyCompileRef) {
        emptyCompileRef.disabled = !selectedReferenceId;
        if (selectedReferenceId) {
          emptyCompileRef.innerHTML = `Compile Ref: <span style="font-family: var(--sys-font-code-family); font-size: 0.55rem; opacity: 0.8;">"${selectedReferenceId}"</span>`;
        } else {
          emptyCompileRef.innerHTML = `Compile Ref <span style="font-size: 0.55rem; opacity: 0.8;">(No Selected Ref)</span>`;
        }
        emptyCompileRef.onclick = () => {
          if (selectedReferenceId) {
            currentCompiledEvidence = adapter.compileEvidenceFromReference(retrievalState, selectedReferenceId);
            if (currentCompiledEvidence) addToTimeline(currentCompiledEvidence);
            addTrailEvent("compile_ref", `Compiled evidence from "${selectedReferenceId}" via empty state`, { referenceId: selectedReferenceId });
            renderEvidence(currentCompiledEvidence);
          }
        };
      }

      renderTimelineHistory(document.getElementById("evidence-timeline-empty-container"));
      return;
    }

    // 1. Confidence Setup
    let confLabel = "";
    let confExplanation = "";
    let confVariant = "neutral";
    if (comp.confidence === "high") {
      confLabel = "High Support";
      confExplanation = "Supported by multiple directly connected references.";
      confVariant = "success";
    } else if (comp.confidence === "medium") {
      confLabel = "Moderate Support";
      confExplanation = "Supported by relevant evidence with moderate graph coverage.";
      confVariant = "warning";
    } else {
      confLabel = "Limited Support";
      confExplanation = "Only limited supporting context was identified.";
      confVariant = "error";
    }

    const allContributing = [
      ...comp.matchedReferences.map(r => ({ ref: r, role: "Primary Match" })),
      ...comp.relatedReferences.map(r => ({ ref: r, role: "Supporting Context" }))
    ];

    container.innerHTML = `
      <div class="nv-stack nv-stack--gap-sm" role="region" aria-label="Evidence compilation details" style="max-height: calc(100vh - 200px); overflow-y: auto; padding-right: 4px;">

        <div class="nv-stack nv-stack--gap-xs" style="background-color: var(--sys-color-surface-container-low); padding: var(--sys-space-stack-xs); border-radius: var(--sys-border-radius-sm); border: 1px solid var(--sys-color-border-subtle);">
          <div class="nv-cluster nv-cluster--gap-xs" style="align-items: center; justify-content: space-between;">
            <span style="font-size: 0.68rem; color: var(--sys-color-text-secondary);">${comp.mode === "query" ? "Query evidence" : "Reference evidence"}</span>
            <span class="nv-badge" data-variant="${confVariant}" style="font-weight: var(--ref-font-weight-semibold);">${confLabel}</span>
          </div>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0; line-height: 1.3;">${escapeHtml(confExplanation)}</p>
        </div>

        <div class="nv-stack nv-stack--gap-xs">
          <h5 style="margin: 0; font-size: 0.65rem; text-transform: uppercase; color: var(--sys-color-accent-primary);">Summary</h5>
          <p class="evidence-summary">
            ${escapeHtml(comp.summary)}
          </p>
        </div>

        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.3;"></div>

        <div class="nv-stack nv-stack--gap-xs nv-provenance-summary">
          <h5 style="margin: 0; font-size: 0.65rem; text-transform: uppercase; color: var(--sys-color-accent-primary);">Supporting References</h5>
          <div class="nv-stack nv-stack--gap-xs">
            ${allContributing.length === 0 ? '<p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">No contributing references found.</p>' : allContributing.map(item => {
              const isPinned = pinnedReferences.includes(item.ref.id);
              return `
                <div class="nv-card" style="padding: var(--sys-space-stack-xs); background-color: var(--sys-color-surface-container-lowest); border: 1px solid var(--sys-color-border-subtle); border-radius: var(--sys-border-radius-sm);">
                  <div class="nv-cluster nv-cluster--gap-xs" style="justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
                    <span style="font-size: 0.65rem; color: var(--sys-color-text-primary); font-weight: var(--ref-font-weight-semibold);">${escapeHtml(item.ref.title)}</span>
                    <span class="nv-badge" data-variant="${item.role === 'Primary Match' ? 'success' : 'info'}" style="font-size: 0.55rem; padding: 1px 4px;">${item.role}</span>
                  </div>
                  <div class="nv-cluster nv-cluster--gap-xs" style="margin-top: var(--sys-space-stack-xs); justify-content: flex-end;">
                    <button class="nv-button" data-action="pin-supporting" data-id="${item.ref.id}" style="padding: 2px 6px; min-block-size: unset; font-size: 0.55rem;">
                      ${isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button class="nv-button" data-action="open-supporting" data-id="${item.ref.id}" data-variant="primary" style="padding: 2px 6px; min-block-size: unset; font-size: 0.55rem;">
                      Open
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.3;"></div>

        <details>
          <summary style="font-size: 0.65rem; font-weight: bold; cursor: pointer; color: var(--sys-color-text-secondary); margin-bottom: 2px;">Lineage and provenance</summary>
          <div style="padding-top: 4px;" class="nv-stack nv-stack--gap-sm">
            <div class="lineage-tree" style="font-family: var(--sys-font-code-family); font-size: var(--sys-font-caption-size); color: var(--sys-color-text-primary); padding-left: 2px;">
              ${comp.matchedReferences.map(r => `
                <div class="nv-lineage-node">
                  <span class="lineage-node clickable-lineage-node" data-id="${r.id}" style="cursor: pointer; color: var(--sys-color-accent-primary); text-decoration: underline;" tabindex="0" role="button" aria-label="Primary evidence ${escapeHtml(r.title)}">Primary: ${escapeHtml(r.title)}</span>
                </div>
              `).join("")}
              ${comp.relatedReferences.map(r => `
                <div class="nv-lineage-node">
                  <span class="lineage-node clickable-lineage-node" data-id="${r.id}" style="cursor: pointer; color: var(--sys-color-text-secondary); text-decoration: underline;" tabindex="0" role="button" aria-label="Supporting evidence ${escapeHtml(r.title)}">Support: ${escapeHtml(r.title)}</span>
                </div>
              `).join("")}
            </div>
            <div class="nv-stack nv-stack--gap-xs">
              <h6 style="margin: 0; font-size: 0.6rem; text-transform: uppercase; color: var(--sys-color-text-secondary);">Key Findings</h6>
              <ul style="margin: 0; padding-left: 1rem; font-size: var(--sys-font-caption-size); color: var(--sys-color-text-primary); line-height: 1.4;">
                <li>Retrieved <strong>${comp.matchedReferences.length}</strong> direct matching reference(s) from registry.</li>
                <li>Detected <strong>${comp.relationships.length}</strong> semantic relationships between workspace elements.</li>
                <li>Linked <strong>${comp.relatedReferences.length}</strong> contextual neighbor reference(s) for additional evidence.</li>
              </ul>
            </div>

            <!-- Provenance Metadata Table -->
            <div class="nv-stack nv-stack--gap-xs">
              <h6 style="margin: 0; font-size: 0.6rem; text-transform: uppercase; color: var(--sys-color-text-secondary);">Metadata Details</h6>
              <table style="width: 100%; font-size: 0.6rem; border-collapse: collapse; color: var(--sys-color-text-secondary);">
                <tbody>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 2px 0; font-weight: var(--ref-font-weight-medium);">Compilation Mode:</td>
                    <td style="padding: 2px 0; text-align: right; font-family: var(--sys-font-code-family);">${comp.mode === "query" ? "Search Query" : "Reference Seed"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 2px 0; font-weight: var(--ref-font-weight-medium);">Input Target:</td>
                    <td style="padding: 2px 0; text-align: right; font-family: var(--sys-font-code-family); overflow: hidden; text-overflow: ellipsis; max-width: 120px; white-space: nowrap;">"${comp.input}"</td>
                  </tr>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 2px 0; font-weight: var(--ref-font-weight-medium);">Timestamp:</td>
                    <td style="padding: 2px 0; text-align: right; font-family: var(--sys-font-code-family);">${new Date(comp.createdAt).toLocaleTimeString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Related Relationships -->
            <div class="nv-stack nv-stack--gap-xs">
              <h6 style="margin: 0; font-size: 0.6rem; text-transform: uppercase; color: var(--sys-color-text-secondary);">Related Relationships (${comp.relationships.length})</h6>
              <div class="nv-stack nv-stack--gap-xs" style="max-height: 120px; overflow-y: auto;">
                ${comp.relationships.length === 0 ? '<p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">No citation links utilized.</p>' : comp.relationships.map(rel => `
                  <div class="nv-card clickable-evidence-rel" data-id="${rel.id}" style="padding: var(--sys-space-stack-xs); font-size: 0.6rem; cursor: pointer; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 2px; background-color: var(--sys-color-surface-container-lowest);" tabindex="0" role="button" aria-label="Inspect relationship ${rel.sourceReferenceId} to ${rel.targetReferenceId}">
                    <div class="nv-cluster nv-cluster--gap-xs" style="justify-content: space-between;">
                      <span><strong>${rel.sourceReferenceId}</strong> ➔ <strong>${rel.targetReferenceId}</strong></span>
                      <span class="nv-badge" data-variant="neutral" style="font-size: 0.5rem; padding: 0px 3px;">${rel.type}</span>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        </details>

        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.3;"></div>

        <div class="nv-stack nv-stack--gap-xs">
          <h5 style="margin: 0; font-size: 0.65rem; text-transform: uppercase; color: var(--sys-color-accent-primary);">Next</h5>
          <div class="nv-stack nv-stack--gap-xs">
            ${comp.matchedReferences.length > 0 ? `
              <button class="nv-button" id="action-explore-neighborhood" data-id="${comp.matchedReferences[0].id}" data-variant="secondary" style="font-size: var(--sys-font-caption-size); padding: 4px;">
                Explore Graph
              </button>
            ` : ""}
            <button class="nv-button" id="action-return-search" data-variant="ghost" style="font-size: var(--sys-font-caption-size); padding: 4px;">
              Continue Search
            </button>
          </div>
        </div>

        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.3;"></div>

        <!-- Timeline History at bottom of active state -->
        <div id="evidence-timeline-active-container"></div>

      </div>
    `;

    // Bind supporting reference actions
    container.querySelectorAll("button[data-action='open-supporting']").forEach(btn => {
      const id = btn.getAttribute("data-id");
      btn.onclick = () => {
        addTrailEvent("supporting_ref_opened", `Opened supporting reference "${id}"`, { referenceId: id });
        selectReference(id);
      };
    });

    container.querySelectorAll("button[data-action='pin-supporting']").forEach(btn => {
      const id = btn.getAttribute("data-id");
      btn.onclick = () => {
        const isPinned = pinnedReferences.includes(id);
        if (isPinned) {
          unpinReference(id);
        } else {
          pinReference(id);
        }
        renderEvidence(comp);
      };
    });

    // Bind lineage nodes
    container.querySelectorAll(".clickable-lineage-node").forEach(node => {
      const id = node.getAttribute("data-id");
      const openNode = () => {
        addTrailEvent("lineage_navigated", `Navigated to reference "${id}" via lineage tree`, { referenceId: id });
        selectReference(id);
      };
      node.onclick = openNode;
      node.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openNode();
        }
      };
    });

    // Bind related relationships
    container.querySelectorAll(".clickable-evidence-rel").forEach(card => {
      const relId = card.getAttribute("data-id");
      const openRel = () => {
        const rel = retrievalState.relationships.find(r => r.id === relId);
        if (rel) {
          selectedRelationship = rel;
          addTrailEvent("relationship_navigated", `Navigated to relationship "${rel.sourceReferenceId} ➔ ${rel.targetReferenceId}" via evidence context`, { relationship: rel });
          switchInspectorTab("relationship");
          renderRelationshipInspector();
        }
      };
      card.onclick = openRel;
      card.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openRel();
        }
      };
    });

    // Bind suggested next action buttons
    const nextExploreBtn = document.getElementById("action-explore-neighborhood");
    if (nextExploreBtn) {
      const id = nextExploreBtn.getAttribute("data-id");
      nextExploreBtn.onclick = () => {
        selectedReferenceId = id;
        addToRecentlyViewed(id);
        switchExplorationMode("graph");
        addTrailEvent("action_explore_neighborhood", `Explored neighborhood around "${id}" from suggested next actions`, { referenceId: id });
        saveWorkspaceState();
        renderVisualGraph();
      };
    }

    const nextReturnSearchBtn = document.getElementById("action-return-search");
    if (nextReturnSearchBtn) {
      nextReturnSearchBtn.onclick = () => {
        switchExplorationMode("search");
        addTrailEvent("action_return_search", `Returned to search mode from suggested next actions`);
        saveWorkspaceState();
      };
    }

    renderTimelineHistory(document.getElementById("evidence-timeline-active-container"));
  }

  // Render compilation history list
  function renderTimelineHistory(targetContainer) {
    if (!targetContainer) return;

    targetContainer.innerHTML = `
      <div class="nv-stack nv-stack--gap-xs" style="margin-top: var(--sys-space-stack-md); padding-top: var(--sys-space-stack-sm); border-top: var(--sys-border-subtle) solid var(--sys-color-border-subtle);">
        <h5 style="margin: 0; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sys-color-accent-primary);">Evidence History (${evidenceTimeline.length})</h5>
        <div class="nv-stack nv-stack--gap-xs">
          ${evidenceTimeline.length === 0 ? '<p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">No compilation history.</p>' : evidenceTimeline.map((item, idx) => {
            let qualitativeLabel = item.confidence === "high" ? "High" : (item.confidence === "medium" ? "Moderate" : "Limited");
            let qualVariant = item.confidence === "high" ? "success" : (item.confidence === "medium" ? "warning" : "error");
            return `
              <div class="nv-card clickable-history-item" data-index="${idx}" style="padding: var(--sys-space-stack-xs); font-size: 0.6rem; cursor: pointer; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 2px; background-color: var(--sys-color-surface-container-lowest);" tabindex="0" role="button" aria-label="Reopen compilation ${item.id}">
                <div class="nv-cluster nv-cluster--gap-xs" style="justify-content: space-between; align-items: center;">
                  <span style="font-family: var(--sys-font-code-family); font-weight: var(--ref-font-weight-medium); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">"${item.input}"</span>
                  <span class="nv-badge" data-variant="${qualVariant}" style="font-size: 0.5rem; padding: 0 3px;">${qualitativeLabel}</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // Bind timeline history items
    targetContainer.querySelectorAll(".clickable-history-item").forEach(item => {
      const idx = parseInt(item.getAttribute("data-index"), 10);
      const selectHist = () => {
        const selectedEv = evidenceTimeline[idx];
        if (selectedEv) {
          currentCompiledEvidence = selectedEv;
          if (selectedEv.mode === "reference" && selectedEv.input) {
            selectReference(selectedEv.input);
            switchInspectorTab("evidence");
          } else {
            selectedReferenceId = null;
            selectedRelationship = null;
            syncSelectionHighlighting();
            renderReferenceInspector();
            renderRelationshipInspector();
          }
          addTrailEvent("reopen_evidence", `Reopened evidence compilation "${selectedEv.id}"`, { compilationId: selectedEv.id });
          saveWorkspaceState();
          renderEvidence(currentCompiledEvidence);
        }
      };
      item.onclick = selectHist;
      item.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectHist();
        }
      };
    });
  }

  // DOM Rendering: SVG Graph Mode Visualization
  function renderVisualGraph() {
    const svg = document.getElementById("visual-graph-svg");
    if (!svg) return;

    svg.innerHTML = "";

    const defs = createSvgElement("defs");
    defs.innerHTML = `
      <marker id="arrow-default" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" class="graph-arrow graph-arrow--default" />
      </marker>
      <marker id="arrow-selected" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" class="graph-arrow graph-arrow--selected" />
      </marker>
      <marker id="arrow-active" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" class="graph-arrow graph-arrow--active" />
      </marker>
    `;
    svg.appendChild(defs);

    const overlay = document.getElementById("graph-empty-state-overlay");
    const msgEl = document.getElementById("graph-empty-state-message");
    const subtextEl = document.getElementById("graph-empty-state-subtext");
    const preview = document.getElementById("graph-hover-preview");
    const emptyFullButton = document.getElementById("graph-empty-full-button");
    const emptySearchButton = document.getElementById("graph-empty-search-button");

    const hideOverlay = () => {
      if (overlay) overlay.style.display = "none";
    };
    const showOverlay = (msg, subtext) => {
      if (overlay) {
        overlay.style.display = "block";
        if (msgEl) msgEl.textContent = msg;
        if (subtextEl) subtextEl.textContent = subtext;
      }
    };

    const hidePreview = () => {
      if (!preview) return;
      preview.hidden = true;
      preview.innerHTML = "";
    };
    const showPreview = (content, event) => {
      if (!preview) return;
      preview.innerHTML = content;
      preview.hidden = false;
      const containerBox = svg.parentElement.getBoundingClientRect();
      const x = event?.clientX ? event.clientX - containerBox.left : containerBox.width / 2;
      const y = event?.clientY ? event.clientY - containerBox.top : containerBox.height / 2;
      preview.style.left = `${Math.min(containerBox.width - 230, Math.max(12, x + 14))}px`;
      preview.style.top = `${Math.min(containerBox.height - 120, Math.max(12, y + 14))}px`;
    };

    if (emptyFullButton) {
      emptyFullButton.onclick = () => {
        neighborhoodDepth = "full";
        relationshipFilter = "all";
        const filterSelect = document.getElementById("graph-filter-select");
        const depthSelect = document.getElementById("graph-hop-select");
        if (filterSelect) filterSelect.value = relationshipFilter;
        if (depthSelect) depthSelect.value = neighborhoodDepth;
        addTrailEvent("Graph empty state resolved", "Opened full graph from empty graph state", { depth: neighborhoodDepth, filter: relationshipFilter });
        saveWorkspaceState();
        renderVisualGraph();
      };
    }
    if (emptySearchButton) {
      emptySearchButton.onclick = () => switchExplorationMode("search");
    }

    const allRels = retrievalState.relationships;
    const filteredRels = adapter.filterRelationships(allRels, relationshipFilter);

    // Default to Full Graph if no reference node is selected
    const activeDepth = selectedReferenceId ? neighborhoodDepth : "full";

    const { nodes: visibleNodes, edges: visibleEdges } = adapter.getNeighborhoodNodesAndEdges(
      retrievalState,
      selectedReferenceId,
      activeDepth,
      filteredRels
    );

    // 2. Check empty states
    if (selectedReferenceId) {
      const hasRelsUnderFilter = filteredRels.some(r => r.sourceReferenceId === selectedReferenceId || r.targetReferenceId === selectedReferenceId);
      if (!hasRelsUnderFilter) {
        showOverlay(
          "No visible relationships for this filter.",
          "Try All, explore similar references, or open discovery suggestions."
        );
      } else {
        hideOverlay();
      }
    } else {
      if (filteredRels.length === 0) {
        showOverlay("No relationships match this filter.", "Choose another filter option to display active reference nodes.");
        return;
      } else {
        hideOverlay();
      }
    }

    if (visibleNodes.length === 0) {
      showOverlay("No active references available in registry.", "");
      hidePreview();
      return;
    }

    const width = svg.clientWidth || 600;
    const height = svg.clientHeight || 480;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const nodeCoords = adapter.computeForceLayout(
      visibleNodes,
      visibleEdges,
      width,
      height,
      selectedReferenceId || null
    );

    const edgePaths = adapter.computeEdgePaths(visibleEdges, nodeCoords);
    const clusterSummaries = adapter.getClusterSummaries ? adapter.getClusterSummaries(visibleNodes, nodeCoords) : [];

    const activeRefId = selectedReferenceId;
    const firstHopNodeIds = new Set();
    const secondHopNodeIds = new Set();
    const activeRelIds = new Set();

    if (activeRefId) {
      visibleEdges.forEach(rel => {
        if (rel.sourceReferenceId === activeRefId) {
          firstHopNodeIds.add(rel.targetReferenceId);
          activeRelIds.add(rel.id);
        } else if (rel.targetReferenceId === activeRefId) {
          firstHopNodeIds.add(rel.sourceReferenceId);
          activeRelIds.add(rel.id);
        }
      });

      visibleEdges.forEach(rel => {
        const sourceIsFirstHop = firstHopNodeIds.has(rel.sourceReferenceId);
        const targetIsFirstHop = firstHopNodeIds.has(rel.targetReferenceId);
        if (sourceIsFirstHop && rel.targetReferenceId !== activeRefId && !firstHopNodeIds.has(rel.targetReferenceId)) {
          secondHopNodeIds.add(rel.targetReferenceId);
        }
        if (targetIsFirstHop && rel.sourceReferenceId !== activeRefId && !firstHopNodeIds.has(rel.sourceReferenceId)) {
          secondHopNodeIds.add(rel.sourceReferenceId);
        }
      });
    }

    const panSurface = createSvgElement("rect", {
      class: "graph-pan-surface",
      x: 0,
      y: 0,
      width,
      height
    });
    svg.appendChild(panSurface);

    const world = createSvgElement("g", { class: "graph-world" });
    const clusterLayer = createSvgElement("g", { class: "graph-clusters" });
    const edgeLayer = createSvgElement("g", { class: "graph-edges" });
    const nodeLayer = createSvgElement("g", { class: "graph-nodes" });
    world.appendChild(clusterLayer);
    world.appendChild(edgeLayer);
    world.appendChild(nodeLayer);
    svg.appendChild(world);
    setGraphViewport(graphViewport, false);

    clusterSummaries
      .filter(cluster => cluster.nodes.length > 1 && cluster.x && cluster.y)
      .forEach(cluster => {
        // Subtle cluster label positioned near cluster center, no halo ellipses
        const label = createSvgElement("text", {
          class: "graph-cluster-label",
          x: cluster.x,
          y: cluster.y,
          "text-anchor": "middle"
        });
        label.textContent = String(cluster.name).toUpperCase();
        clusterLayer.appendChild(label);
      });

    edgePaths.forEach(({ edge: rel, pathData }) => {
      const hitEl = createSvgElement("path");
      hitEl.setAttribute("d", pathData);
      hitEl.setAttribute("fill", "none");
      hitEl.setAttribute("class", "graph-link-target");
      hitEl.setAttribute("tabindex", "0");
      hitEl.setAttribute("role", "button");
      hitEl.setAttribute("pointer-events", "stroke");
      hitEl.setAttribute("aria-label", `Relationship: ${getRelationshipLabel(rel)}`);

      const pathEl = createSvgElement("path");
      pathEl.setAttribute("d", pathData);
      pathEl.setAttribute("fill", "none");
      pathEl.setAttribute("class", `graph-link graph-link--${normalizeGraphType(rel.type)}`);
      pathEl.setAttribute("aria-hidden", "true");
      // Arrowheads completely removed for Obsidian-like organic connections
      const selectEdge = (e) => {
        e.stopPropagation();
        selectedRelationship = rel;
        addTrailEvent("Graph edge selected", `Inspected relationship "${rel.sourceReferenceId} ➔ ${rel.targetReferenceId}"`, { relationship: rel });
        switchInspectorTab("relationship");
        renderRelationshipInspector();
        saveWorkspaceState();
        renderVisualGraph();
      };
      const showEdgePreview = (event) => {
        const source = adapter.getReferenceById(retrievalState, rel.sourceReferenceId);
        const target = adapter.getReferenceById(retrievalState, rel.targetReferenceId);
        const context = rel.context || (rel.strength ? `Strength ${rel.strength}` : "Relationship context");
        showPreview(`
          <strong>${escapeHtml(String(rel.type || "related").toUpperCase().replace(/_/g, " "))}</strong>
          <span>${escapeHtml(source?.title || rel.sourceReferenceId)} ➔ ${escapeHtml(target?.title || rel.targetReferenceId)}</span>
          <small>${escapeHtml(context)}</small>
        `, event);
      };
      hitEl.onclick = selectEdge;
      pathEl.onclick = selectEdge;
      bindKeyboardActivation(hitEl, selectEdge);
      hitEl.onmouseenter = showEdgePreview;
      hitEl.onmousemove = showEdgePreview;
      hitEl.onmouseleave = hidePreview;
      hitEl.onfocus = showEdgePreview;
      hitEl.onblur = hidePreview;

      if (activeRefId) {
        if (rel.id === selectedRelationship?.id) {
          pathEl.classList.add("selected");
        } else if (activeRelIds.has(rel.id)) {
          pathEl.classList.add("active");
        } else if (
          firstHopNodeIds.has(rel.sourceReferenceId) ||
          firstHopNodeIds.has(rel.targetReferenceId) ||
          secondHopNodeIds.has(rel.sourceReferenceId) ||
          secondHopNodeIds.has(rel.targetReferenceId)
        ) {
          pathEl.classList.add("nearby");
        } else {
          pathEl.classList.add("dimmed");
        }
      } else {
        if (rel.id === selectedRelationship?.id) {
          pathEl.classList.add("selected");
        }
      }

      edgeLayer.appendChild(hitEl);
      edgeLayer.appendChild(pathEl);
    });

    visibleNodes.forEach(ref => {
      const coord = nodeCoords[ref.id];
      if (!coord) return;

      const g = createSvgElement("g");
      g.setAttribute("class", `graph-node graph-node--${ref.type || "reference"}`);
      g.setAttribute("transform", `translate(${coord.x}, ${coord.y})`);
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `Reference node: ${ref.title}. ${ref.type || "reference"}. Press Enter to inspect.`);

      if (activeRefId) {
        if (ref.id === activeRefId) {
          g.classList.add("selected");
        } else if (firstHopNodeIds.has(ref.id)) {
          g.classList.add("neighbor-hop-1");
        } else if (secondHopNodeIds.has(ref.id)) {
          g.classList.add("neighbor-hop-2");
        } else {
          g.classList.add("distant");
        }
      }
      if (pinnedReferences.includes(ref.id)) g.classList.add("pinned");

      const circle = createSvgElement("circle", { class: "graph-node-core" });
      const text = createSvgElement("text", { class: "graph-node-label" });
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("y", 18); // Position label slightly closer to the small node dot

      // Label hierarchy implementation:
      if (activeRefId) {
        if (ref.id === activeRefId) {
          const fullLabel = String(ref.title || ref.id);
          text.textContent = fullLabel.length > 40 ? `${fullLabel.slice(0, 38)}...` : fullLabel;
          text.style.opacity = "1";
        } else if (firstHopNodeIds.has(ref.id)) {
          text.textContent = getShortGraphLabel(ref);
          text.style.opacity = "0.9";
        } else if (secondHopNodeIds.has(ref.id)) {
          const label = String(ref.title || ref.id);
          text.textContent = label.length > 10 ? `${label.slice(0, 8)}..` : label;
          text.style.opacity = "0.5";
        } else {
          text.textContent = "";
        }
      } else {
        text.textContent = getShortGraphLabel(ref);
        text.style.opacity = "0.85";
      }

      g.appendChild(circle);
      g.appendChild(text);

      const activateNode = (e) => {
        e.stopPropagation();
        selectReference(ref.id);
      };
      g.onclick = activateNode;

      g.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectReference(ref.id);
        }
      };
      g.ondblclick = (e) => {
        e.stopPropagation();
        const nextScale = Math.max(graphViewport.scale, 1.35);
        setGraphViewport({
          scale: nextScale,
          x: width / 2 - coord.x * nextScale,
          y: height / 2 - coord.y * nextScale
        });
      };
      g.onmouseenter = (event) => {
        const relCount = allRels.filter(rel => rel.sourceReferenceId === ref.id || rel.targetReferenceId === ref.id).length;
        const neighborhoodSize = new Set(allRels.flatMap(rel => (
          rel.sourceReferenceId === ref.id ? [rel.targetReferenceId] :
          rel.targetReferenceId === ref.id ? [rel.sourceReferenceId] : []
        ))).size;
        showPreview(`
          <strong>${escapeHtml(ref.title)}</strong>
          <span>${escapeHtml(ref.type || "reference")} · ${escapeHtml(adapter.inferReferenceCluster ? adapter.inferReferenceCluster(ref) : "Research")}</span>
          <small>${relCount} relationships · ${getEvidenceCountForReference(ref.id)} evidence · ${neighborhoodSize} neighbors</small>
        `, event);
      };
      g.onmousemove = g.onmouseenter;
      g.onmouseleave = hidePreview;
      g.onfocus = (event) => g.onmouseenter(event);
      g.onblur = hidePreview;

      nodeLayer.appendChild(g);
    });

    let isPanning = false;
    let panStart = null;
    svg.onwheel = (event) => {
      event.preventDefault();
      hidePreview();
      const containerBox = svg.getBoundingClientRect();
      const pointerX = event.clientX - containerBox.left;
      const pointerY = event.clientY - containerBox.top;
      const oldScale = graphViewport.scale;
      const nextScale = clampGraphScale(oldScale * (event.deltaY < 0 ? 1.1 : 0.9));
      const graphX = (pointerX - graphViewport.x) / oldScale;
      const graphY = (pointerY - graphViewport.y) / oldScale;
      setGraphViewport({
        scale: nextScale,
        x: pointerX - graphX * nextScale,
        y: pointerY - graphY * nextScale
      });
    };
    svg.onpointerdown = (event) => {
      if (event.target !== svg && !event.target.classList.contains("graph-pan-surface")) return;
      isPanning = true;
      panStart = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        viewportX: graphViewport.x,
        viewportY: graphViewport.y
      };
      svg.setPointerCapture(event.pointerId);
      svg.classList.add("is-panning");
      hidePreview();
    };
    svg.onpointermove = (event) => {
      if (!isPanning || !panStart) return;
      setGraphViewport({
        scale: graphViewport.scale,
        x: panStart.viewportX + event.clientX - panStart.x,
        y: panStart.viewportY + event.clientY - panStart.y
      }, false);
    };
    svg.onpointerup = (event) => {
      if (!isPanning) return;
      isPanning = false;
      panStart = null;
      svg.classList.remove("is-panning");
      try {
        svg.releasePointerCapture(event.pointerId);
      } catch (err) {
        if (window.NV_DEBUG) console.warn("Graph pointer release skipped", err);
      }
      saveWorkspaceState();
    };
    svg.onpointercancel = svg.onpointerup;
  }

  // DOM Rendering: Discovery Mode
  function renderDiscoveryMode() {
    const sizeEl = document.getElementById("discovery-stat-size");
    const relsEl = document.getElementById("discovery-stat-relations");
    const densityEl = document.getElementById("discovery-stat-density");
    const anchorsContainer = document.getElementById("discovery-anchors-container");

    const activeRefs = retrievalState.references.filter(r => r.status === "active");
    const totalRels = retrievalState.relationships;

    if (sizeEl) sizeEl.textContent = activeRefs.length;
    if (relsEl) relsEl.textContent = totalRels.length;
    if (densityEl) {
      const size = activeRefs.length;
      const density = size > 1 ? (totalRels.length / (size * (size - 1))) : 0;
      densityEl.textContent = density.toFixed(3);
    }

    if (anchorsContainer) {
      // Calculate link counts
      const counts = {};
      activeRefs.forEach(r => counts[r.id] = 0);
      totalRels.forEach(rel => {
        if (counts[rel.sourceReferenceId] !== undefined) counts[rel.sourceReferenceId]++;
        if (counts[rel.targetReferenceId] !== undefined) counts[rel.targetReferenceId]++;
      });

      const sortedRefs = [...activeRefs].sort((a, b) => counts[b.id] - counts[a.id]);

      anchorsContainer.innerHTML = sortedRefs.slice(0, 3).map(ref => `
        <div class="nv-card" style="margin-bottom: var(--sys-space-stack-xs); cursor: default;">
          <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between; align-items: center;">
            <h4 style="margin: 0; font-size: var(--sys-font-body-size);">${ref.title}</h4>
            <span class="nv-badge" data-variant="info">${counts[ref.id]} links</span>
          </div>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: var(--sys-space-stack-xs) 0 0 0;">
            ID: ${ref.id} | Type: ${ref.type}
          </p>
          <div style="margin-top: var(--sys-space-stack-sm);">
            <button class="nv-button" data-action="select-anchor" data-id="${ref.id}" style="font-size: 0.7rem; padding: 2px 8px; min-block-size: unset;">
              Select Anchor
            </button>
          </div>
        </div>
      `).join("");

      anchorsContainer.querySelectorAll("button[data-action='select-anchor']").forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute("data-id");
          selectReference(id);
        };
      });
    }
  }

  // DOM Rendering: Compare Mode Table
  function renderCompareMode() {
    const tbody = document.getElementById("compare-table-body");
    if (!tbody) return;

    const activeRefs = retrievalState.references.filter(r => r.status === "active");

    if (activeRefs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="nv-muted" style="text-align: center;">No active references available.</td></tr>`;
      return;
    }

    tbody.innerHTML = activeRefs.map(ref => {
      const rels = adapter.getRelationshipsForReference(retrievalState, ref.id);
      const isSelected = ref.id === selectedReferenceId;
      return `
        <tr style="cursor: pointer; background-color: ${isSelected ? 'var(--sys-color-surface-overlay)' : 'transparent'};" data-ref-id="${ref.id}">
          <td style="font-family: var(--sys-font-code-family); font-weight: ${isSelected ? 'bold' : 'normal'};">${ref.id}</td>
          <td>${ref.title}</td>
          <td><span class="nv-badge" data-variant="info">${ref.type}</span></td>
          <td><span class="nv-badge" data-variant="success">${ref.status}</span></td>
          <td><a href="${ref.source}" target="_blank" style="color: var(--sys-color-accent-primary); text-decoration: none;">${ref.source.length > 25 ? ref.source.substring(0, 25) + '...' : ref.source}</a></td>
          <td>${rels.length} relationships</td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll("tr").forEach(row => {
      row.onclick = () => {
        const refId = row.getAttribute("data-ref-id");
        selectReference(refId);
      };
    });
  }

  // DOM Rendering: Memory Layer (Recent, Pinned, Queries, Trail)
  function renderMemoryLayer() {
    const recentList = document.getElementById("memory-recent-list");
    const pinnedList = document.getElementById("memory-pinned-list");
    const queriesList = document.getElementById("memory-queries-list");
    const trailList = document.getElementById("memory-trail-list");

    if (recentList) {
      const visibleRecent = recentReferences.filter(id => !pinnedReferences.includes(id));
      if (visibleRecent.length === 0) {
        recentList.innerHTML = `<li class="nv-muted" style="font-size: var(--sys-font-caption-size); padding: 4px;">No recently viewed references.</li>`;
      } else {
        recentList.innerHTML = visibleRecent.map(id => {
          const ref = adapter.getReferenceById(retrievalState, id);
          const title = ref ? ref.title : id;
          return `
            <li class="memory-item" data-ref-id="${id}" title="${escapeHtml(title)}" tabindex="0" role="button">
              <span>${escapeHtml(ref ? ref.title : id)}</span>
              <span class="nv-muted" style="font-size: 0.6rem; text-align: right; overflow: hidden; text-overflow: ellipsis;">${ref ? ref.type : ''}</span>
            </li>
          `;
        }).join("");

        recentList.querySelectorAll(".memory-item").forEach(item => {
          item.onclick = () => {
            const id = item.getAttribute("data-ref-id");
            selectReference(id);
          };
          bindKeyboardActivation(item, item.onclick);
        });
      }
    }

    if (pinnedList) {
      if (pinnedReferences.length === 0) {
        pinnedList.innerHTML = `<li class="nv-muted" style="font-size: var(--sys-font-caption-size); padding: 4px;">No pinned references.</li>`;
      } else {
        pinnedList.innerHTML = pinnedReferences.map(id => {
          const ref = adapter.getReferenceById(retrievalState, id);
          const title = ref ? ref.title : id;
          return `
            <li class="memory-item" data-ref-id="${id}" title="${escapeHtml(title)}" tabindex="0" role="button">
              <span>${escapeHtml(ref ? ref.title : id)}</span>
              <button class="memory-action-btn" data-action="unpin" data-id="${id}" aria-label="Unpin ${id}">×</button>
            </li>
          `;
        }).join("");

        pinnedList.querySelectorAll(".memory-item").forEach(item => {
          item.onclick = (e) => {
            if (e.target.tagName.toLowerCase() === 'button' || e.target.classList.contains('memory-action-btn')) return;
            const id = item.getAttribute("data-ref-id");
            selectReference(id);
          };
          bindKeyboardActivation(item, item.onclick);
        });

        pinnedList.querySelectorAll("button[data-action='unpin']").forEach(btn => {
          btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.getAttribute("data-id");
            unpinReference(id);
          };
        });
      }
    }

    if (queriesList) {
      if (savedQueries.length === 0) {
        queriesList.innerHTML = `<li class="nv-muted" style="font-size: var(--sys-font-caption-size); padding: 4px;">No saved queries.</li>`;
      } else {
        queriesList.innerHTML = savedQueries.map(q => `
          <li class="memory-item" data-query="${escapeHtml(q)}" tabindex="0" role="button">
            <span>${escapeHtml(q)}</span>
            <button class="memory-action-btn" data-action="delete-query" data-query="${q}" aria-label="Delete query ${q}">×</button>
          </li>
        `).join("");

        queriesList.querySelectorAll(".memory-item").forEach(item => {
          item.onclick = (e) => {
            if (e.target.tagName.toLowerCase() === 'button' || e.target.classList.contains('memory-action-btn')) return;
            const query = item.getAttribute("data-query");
            const searchInput = document.getElementById("playground-search-input");
            if (searchInput) searchInput.value = query;
            runSearch(query, true);
          };
          bindKeyboardActivation(item, item.onclick);
        });

        queriesList.querySelectorAll("button[data-action='delete-query']").forEach(btn => {
          btn.onclick = (e) => {
            e.stopPropagation();
            const query = btn.getAttribute("data-query");
            savedQueries = savedQueries.filter(q => q !== query);

            // Enable Save Query button if we just deleted the active search query
            const searchInput = document.getElementById("playground-search-input");
            const activeQuery = searchInput ? searchInput.value.trim() : "";
            const saveQueryBtn = document.getElementById("playground-save-query-button");
            if (saveQueryBtn && activeQuery === query) {
              saveQueryBtn.disabled = false;
            }

            saveWorkspaceState();
            renderMemoryLayer();
          };
        });
      }
    }

    if (trailList) {
      if (knowledgeTrail.length === 0) {
        trailList.innerHTML = `<li class="nv-muted" style="font-size: var(--sys-font-caption-size); padding: 4px;">No trail activity.</li>`;
      } else {
        trailList.innerHTML = knowledgeTrail.map(event => {
          let badgeVariant = "neutral";
          if (event.type === "search" || event.type === "rerun_query") badgeVariant = "info";
          else if (event.type === "pin") badgeVariant = "success";
          else if (event.type === "unpin") badgeVariant = "warning";
          else if (event.type === "compile_query" || event.type === "compile_ref") badgeVariant = "primary";
          else if (event.type === "open" || event.type === "select_node") badgeVariant = "neutral";

          return `
            <li class="trail-event" data-event-id="${event.id}" tabindex="0" role="button">
              <div class="trail-meta">
                <span class="nv-badge" data-variant="${badgeVariant}" style="font-size: 0.5rem; padding: 1px 4px; text-transform: uppercase;">${escapeHtml(event.type)}</span>
                <span>${event.timestamp}</span>
              </div>
              <div style="margin-top: 2px; line-height: 1.3;">${escapeHtml(event.label)}</div>
            </li>
          `;
        }).join("");

        trailList.querySelectorAll(".trail-event").forEach(item => {
          item.onclick = () => {
            const eventId = item.getAttribute("data-event-id");
            const event = knowledgeTrail.find(e => e.id === eventId);
            if (event) {
              restoreTrailContext(event);
            }
          };
          bindKeyboardActivation(item, item.onclick);
        });
      }
    }
  }

  // Bind Selection Clicks to Reference Cards
  function bindSelectionClicks(containerElement) {
    if (!containerElement) return;

    const cards = containerElement.querySelectorAll(".nv-card");
    cards.forEach((card, index) => {
      card.onclick = (e) => {
        if (e.target.closest("button")) return;
        const refId = card.getAttribute("data-ref-id");
        selectReference(refId);
      };

      // Keyboard navigation support
      card.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const refId = card.getAttribute("data-ref-id");
          selectReference(refId);
        } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const nextIndex = e.key === "ArrowDown" ? Math.min(cards.length - 1, index + 1) : Math.max(0, index - 1);
          cards[nextIndex]?.focus();
        }
      };

      const compileBtn = card.querySelector(".search-card-compile-btn");
      if (compileBtn) {
        compileBtn.onclick = (e) => {
          e.stopPropagation();
          const refId = compileBtn.getAttribute("data-id");
          selectedReferenceId = refId;
          addToRecentlyViewed(refId);
          currentCompiledEvidence = adapter.compileEvidenceFromReference(retrievalState, refId);
          if (currentCompiledEvidence) {
            addToTimeline(currentCompiledEvidence);
          }
          addTrailEvent("compile_ref", `Compiled evidence from "${refId}" via search card action`, { referenceId: refId });
          switchInspectorTab("evidence");
          renderEvidence(currentCompiledEvidence);
          saveWorkspaceState();
          syncSelectionHighlighting();
          renderReferenceInspector();
          renderMemoryLayer();
        };
      }
    });
  }

  // Toggle Selection State
  function toggleSelection(refId) {
    if (selectedReferenceId === refId) {
      selectedReferenceId = null; // deselect
    } else {
      selectedReferenceId = refId; // select new
      addToRecentlyViewed(refId);

      // Log trail event
      if (activeExplorationMode === "graph") {
        addTrailEvent("select_node", `Selected node "${refId}"`, { referenceId: refId });
      } else {
        addTrailEvent("open", `Opened "${refId}"`, { referenceId: refId });
      }

      // Auto-switch to Reference tab in Inspector
      switchInspectorTab("reference");
    }

    // Clear stale relationship select
    selectedRelationship = null;
    renderRelationshipInspector();

    saveWorkspaceState();

    // Refresh UI elements concerned with selection
    syncSelectionHighlighting();
    renderReferenceInspector();
    renderMemoryLayer();

    // Refresh Mode displays
    if (activeExplorationMode === "graph") {
      renderVisualGraph();
    } else if (activeExplorationMode === "discovery") {
      renderDiscoveryMode();
    } else if (activeExplorationMode === "compare") {
      renderCompareMode();
    }
  }

  // Select Reference and sync all panels
  function selectReference(refId) {
    if (!refId) return;
    selectedReferenceId = refId;
    addToRecentlyViewed(refId);

    // Log trail event
    if (activeExplorationMode === "graph") {
      addTrailEvent("select_node", `Selected node "${refId}"`, { referenceId: refId });
    } else {
      addTrailEvent("open", `Opened "${refId}"`, { referenceId: refId });
    }

    // Auto-switch to Reference tab in Inspector
    switchInspectorTab("reference");

    // Clear stale relationship select
    selectedRelationship = null;
    renderRelationshipInspector();

    saveWorkspaceState();

    // Refresh UI elements concerned with selection
    syncSelectionHighlighting();
    renderReferenceInspector();
    renderMemoryLayer();

    // Refresh Mode displays
    if (activeExplorationMode === "graph") {
      renderVisualGraph();
    } else if (activeExplorationMode === "discovery") {
      renderDiscoveryMode();
    } else if (activeExplorationMode === "compare") {
      renderCompareMode();
    }
  }

  // Add a reference to the recently viewed stack
  function addToRecentlyViewed(refId) {
    if (!refId) return;
    recentReferences = recentReferences.filter(id => id !== refId);
    recentReferences.unshift(refId);
    if (recentReferences.length > 8) {
      recentReferences.pop();
    }
    saveWorkspaceState();
    renderMemoryLayer();
  }

  // Pin / Unpin active reference
  function pinReference(refId) {
    if (!refId) return;
    if (pinnedReferences.length >= 8) {
      // Limit to 8 items
      return;
    }
    if (!pinnedReferences.includes(refId)) {
      pinnedReferences.push(refId);
      addTrailEvent("pin", `Pinned "${refId}"`, { referenceId: refId });
      saveWorkspaceState();
      renderMemoryLayer();
      renderReferenceInspector();
    }
  }

  function unpinReference(refId) {
    if (!refId) return;
    pinnedReferences = pinnedReferences.filter(id => id !== refId);
    addTrailEvent("unpin", `Unpinned "${refId}"`, { referenceId: refId });
    saveWorkspaceState();
    renderMemoryLayer();
    renderReferenceInspector();
  }

  // Sync Highlight class across lists in DOM
  function syncSelectionHighlighting() {
    const listContainers = [
      document.getElementById("seeded-references-list"),
      document.getElementById("search-results-container")
    ];

    listContainers.forEach(container => {
      if (!container) return;
      const cards = container.querySelectorAll(".nv-card");
      cards.forEach(card => {
        const refId = card.getAttribute("data-ref-id");
        if (refId === selectedReferenceId) {
          card.classList.add("nv-card--selected");
          card.setAttribute("aria-selected", "true");
        } else {
          card.classList.remove("nv-card--selected");
          card.setAttribute("aria-selected", "false");
        }
      });
    });
  }

  // Switch exploration modes
  function switchExplorationMode(mode) {
    try {
      if (window.NV_DEBUG) console.log(`Switching exploration mode to: ${mode}`);
      activeExplorationMode = mode;
      saveWorkspaceState();

      // Update developer diagnostics badge if present
      const diagBadge = document.getElementById("nv-diagnostics-badge");
      if (diagBadge) {
        diagBadge.textContent = `JS Active: ${mode}`;
        diagBadge.setAttribute("data-variant", "success");
      }

      // Toggle tab selection
      const tabs = document.querySelectorAll(".workspace-tab");
      tabs.forEach(tab => {
        if (tab.getAttribute("data-mode") === mode) {
          tab.classList.add("active");
          tab.setAttribute("aria-selected", "true");
        } else {
          tab.classList.remove("active");
          tab.setAttribute("aria-selected", "false");
        }
      });

      // Toggle mode panel visibility
      const modes = ["search", "graph", "discovery", "compare"];
      modes.forEach(m => {
        const el = document.getElementById(`mode-${m}`);
        if (el) {
          if (m === mode) {
            el.classList.add("active");
          } else {
            el.classList.remove("active");
          }
        }
      });

      // Refresh mode specific content
      if (mode === "graph") {
        renderVisualGraph();
      } else if (mode === "discovery") {
        renderDiscoveryMode();
      } else if (mode === "compare") {
        renderCompareMode();
      }
    } catch (err) {
      console.error(`Error in switchExplorationMode(${mode}):`, err);
      const diagBadge = document.getElementById("nv-diagnostics-badge");
      if (diagBadge) {
        diagBadge.textContent = `Error: ${err.message}`;
        diagBadge.setAttribute("data-variant", "error");
      }
    }
  }

  // Switch inspector space tabs
  function switchInspectorTab(tabId) {
    activeInspectorTab = tabId;
    saveWorkspaceState();

    // Toggle tabs selection
    const tabs = document.querySelectorAll(".inspector-tab");
    tabs.forEach(tab => {
      if (tab.getAttribute("data-tab") === tabId) {
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
      } else {
        tab.classList.remove("active");
        tab.setAttribute("aria-selected", "false");
      }
    });

    // Toggle panel visibility
    const panels = ["reference", "evidence", "relationship"];
    panels.forEach(p => {
      const el = document.getElementById(`inspector-panel-${p}`);
      if (el) {
        if (p === tabId) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      }
    });
  }

  // Update central workspace metadata state
  function updateWorkspaceState() {
    const workspace = window.NeuralVerse?.workspace || window.NeuralVerse?.workspaceState;
    if (workspace && typeof workspace.setState === "function") {
      workspace.setState({
        activeView: "retrieval-playground",
        routeId: "retrieval-playground",
        routeTitle: "Retrieval Workspace",
        routeDescription: "Explore semantic references, network citation topologies, and evidence synthesis.",
        status: "active"
      });
    }
    renderResearchSnapshot();
    updateProgressiveFeatures();
  }

  // Helper to execute and record a search query
  function runSearch(query, isRerun = false) {
    currentSearchQuery = query;
    if (window.NV_DEBUG) console.log(`Searching references for: ${query}`);

    currentSearchResults = adapter.searchReferences(retrievalState, query);
    renderSearchResults();

    // Clear stale evidence compilation on search change
    currentCompiledEvidence = null;
    renderEvidence(null);

    // Update Search Feedback text
    const searchFeedback = document.getElementById("playground-search-feedback");
    if (searchFeedback) {
      if (!query || query.trim() === "") {
        searchFeedback.textContent = "No active query.";
      } else {
        searchFeedback.textContent = `${currentSearchResults.length} result${currentSearchResults.length === 1 ? "" : "s"} for "${query}"`;
      }
    }

    // Enable / disable Save Query button
    const saveQueryBtn = document.getElementById("playground-save-query-button");
    if (saveQueryBtn) {
      const isSaved = savedQueries.includes(query.trim());
      saveQueryBtn.disabled = !query || query.trim() === "" || isSaved;
    }

    // Log Knowledge Trail Event
    if (query && query.trim() !== "") {
      if (isRerun) {
        addTrailEvent("rerun_query", `Reran query "${query}"`, { query });
      } else {
        addTrailEvent("search", `Searched "${query}"`, { query });
      }
    }

    // State Reset Behavior: Preserve selected reference only if it still exists in the visible context
    if (selectedReferenceId) {
      const exists = retrievalState.references.some(r => r.id === selectedReferenceId) || currentSearchResults.some(res => res.reference.id === selectedReferenceId);
      if (!exists) {
        selectedReferenceId = null;
        renderReferenceInspector();
      }
    }

    // Refresh dynamic exploration modes
    if (activeExplorationMode === "graph") {
      renderVisualGraph();
    } else if (activeExplorationMode === "discovery") {
      renderDiscoveryMode();
    } else if (activeExplorationMode === "compare") {
      renderCompareMode();
    }

    saveWorkspaceState();
    renderMemoryLayer();
  }

  // Stage 6 Initialization
  function initStage6Controls() {
    const focusBtn = document.getElementById("playground-focus-button");
    if (focusBtn) {
      focusBtn.onclick = () => {
        focusModeEnabled = !focusModeEnabled;
        saveWorkspaceState();
        applyFocusModeStyles();
      };
    }

    const prefsBtn = document.getElementById("playground-preferences-button");
    const prefsPanel = document.getElementById("preferences-panel");
    if (prefsBtn && prefsPanel) {
      prefsBtn.onclick = () => {
        prefsPanel.style.display = prefsPanel.style.display === "none" ? "flex" : "none";
      };
      prefsPanel.onkeydown = (e) => {
        if (e.key === "Escape") {
          prefsPanel.style.display = "none";
          prefsBtn.focus();
        }
      };
      if (!preferencesEscapeHandlerBound) {
        document.addEventListener("keydown", (e) => {
          const panel = document.getElementById("preferences-panel");
          const trigger = document.getElementById("playground-preferences-button");
          if (!panel || e.key !== "Escape" || panel.style.display === "none") return;
          panel.style.display = "none";
          if (trigger) trigger.focus();
        });
        preferencesEscapeHandlerBound = true;
      }
    }

    const clearBtn = document.getElementById("playground-clear-session-button");
    if (clearBtn) {
      clearBtn.onclick = () => {
        localStorage.removeItem("neuralverse.retrievalWorkspace.v1");
        resetStateToDefaults();
        initPlayground();
      };
    }



    const defMode = document.getElementById("pref-default-mode");
    if (defMode) {
      defMode.value = activeExplorationMode;
      defMode.onchange = (e) => { activeExplorationMode = e.target.value; saveWorkspaceState(); switchExplorationMode(activeExplorationMode); };
    }

    const defTab = document.getElementById("pref-default-tab");
    if (defTab) {
      defTab.value = activeInspectorTab;
      defTab.onchange = (e) => { activeInspectorTab = e.target.value; saveWorkspaceState(); switchInspectorTab(activeInspectorTab); };
    }

    const defRelFilter = document.getElementById("pref-relationship-filter");
    if (defRelFilter) {
      defRelFilter.value = preferences.preferredRelationshipFilter;
      defRelFilter.onchange = (e) => {
        preferences.preferredRelationshipFilter = e.target.value;
        relationshipFilter = e.target.value;
        const filterSelect = document.getElementById("graph-filter-select");
        if (filterSelect) {
          filterSelect.value = relationshipFilter;
        }
        saveWorkspaceState();
        renderVisualGraph();
      };
    }

    const density = document.getElementById("pref-density");
    if (density) {
      density.value = preferences.density;
      density.onchange = (e) => {
        preferences.density = e.target.value;
        saveWorkspaceState();
        applyDensityStyles();
      };
    }

    const autoOpen = document.getElementById("pref-auto-open");
    if (autoOpen) {
      autoOpen.checked = preferences.autoOpenInspector;
      autoOpen.onchange = (e) => {
        preferences.autoOpenInspector = e.target.checked;
        saveWorkspaceState();
      };
    }

    const widthSelect = document.getElementById("pref-inspector-width");
    if (widthSelect) {
      widthSelect.value = preferences.inspectorWidth;
      widthSelect.onchange = (e) => {
        preferences.inspectorWidth = e.target.value;
        saveWorkspaceState();
        applyInspectorWidthStyles();
      };
    }
  }

  // Initialize workspace controls
  function initPlayground() {
    try {
      if (window.NV_DEBUG) console.log("Initializing Retrieval Workspace (NV-500)...");
      loadWorkspaceState();
      if (!inspectorResizeHandlerBound) {
        window.addEventListener("resize", applyInspectorWidthStyles);
        inspectorResizeHandlerBound = true;
      }

      // Expose selectReference and runSearch globally for empty state / quick actions onclick handlers
      window.selectReference = (refId) => {
        selectReference(refId);
      };
      window.runSearch = (query, isRerun = false) => {
        const searchInput = document.getElementById("playground-search-input");
        if (searchInput) {
          searchInput.value = query;
        }
        runSearch(query, isRerun);
      };
      window.switchExplorationMode = (mode) => {
        switchExplorationMode(mode);
      };
      window.switchInspectorTab = (tabId) => {
        switchInspectorTab(tabId);
      };
      window.resetGraphFilter = () => {
        relationshipFilter = "all";
        const filterSelect = document.getElementById("graph-filter-select");
        if (filterSelect) {
          filterSelect.value = "all";
        }
        saveWorkspaceState();
        renderVisualGraph();
        updateProgressiveFeatures();
      };

      const searchInput = document.getElementById("playground-search-input");
      const searchBtn = document.getElementById("playground-search-button");
      const saveQueryBtn = document.getElementById("playground-save-query-button");
      const compileQueryBtn = document.getElementById("playground-compile-query-button");
      const searchFeedback = document.getElementById("playground-search-feedback");
      const clearSessionBtn = document.getElementById("playground-clear-session-button");
      const clearTrailBtn = document.getElementById("playground-clear-trail-button");
      const graphResetButton = document.getElementById("graph-reset-view-button");

      if (graphResetButton) {
        graphResetButton.onclick = () => {
          resetGraphViewport(true);
          addTrailEvent("Graph view reset", "Reset graph zoom and pan", { viewport: graphViewport });
        };
      }

      // Silently perform the search for the restored query if non-empty
      if (currentSearchQuery) {
        currentSearchResults = adapter.searchReferences(retrievalState, currentSearchQuery);
        if (searchInput) searchInput.value = currentSearchQuery;
        if (searchFeedback) {
          searchFeedback.textContent = `${currentSearchResults.length} result${currentSearchResults.length === 1 ? "" : "s"} for "${currentSearchQuery}"`;
        }
        if (saveQueryBtn) {
          saveQueryBtn.disabled = savedQueries.includes(currentSearchQuery.trim());
        }
      } else {
        currentSearchResults = [];
        if (searchInput) searchInput.value = "";
        if (searchFeedback) searchFeedback.textContent = "No active query.";
        if (saveQueryBtn) saveQueryBtn.disabled = true;
      }

      // Render tabs configuration
      switchExplorationMode(activeExplorationMode);
      switchInspectorTab(activeInspectorTab);

      // Initial renders
      renderResumeBanner();
      renderQuickActions();
      initStage6Controls();

      renderSeededReferences();
      renderSearchResults();
      renderReferenceInspector();
      renderEvidence(currentCompiledEvidence);
      renderRelationshipInspector();
      renderMemoryLayer();
      updateWorkspaceState();

      // Bind graph filters and depth controls if they exist in DOM
      const filterSelect = document.getElementById("graph-filter-select");
      const depthSelect = document.getElementById("graph-hop-select");

      if (filterSelect) {
        filterSelect.value = relationshipFilter;
        filterSelect.onchange = (e) => {
          relationshipFilter = e.target.value;
          addTrailEvent("Relationship filter changed", `Changed relationship filter to "${relationshipFilter}"`, { filter: relationshipFilter });

          if (selectedRelationship) {
            const allRels = retrievalState.relationships;
            const filtered = adapter.filterRelationships(allRels, relationshipFilter);
            const stillVisible = filtered.some(r => r.id === selectedRelationship.id);
            if (!stillVisible) {
              selectedRelationship = null;
              renderRelationshipInspector();
            }
          }

          saveWorkspaceState();
          renderVisualGraph();
        };
      }

      if (depthSelect) {
        depthSelect.value = neighborhoodDepth;
        depthSelect.onchange = (e) => {
          neighborhoodDepth = e.target.value;
          addTrailEvent("Neighborhood depth changed", `Changed depth focus to "${neighborhoodDepth}"`, { depth: neighborhoodDepth });

          saveWorkspaceState();
          renderVisualGraph();
        };
      }

      const exploreTabs = document.querySelectorAll(".workspace-tab");
      exploreTabs.forEach((tab, index) => {
        tab.onclick = () => {
          const mode = tab.getAttribute("data-mode");
          switchExplorationMode(mode);
        };
        tab.onkeydown = (e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            const nextIndex = e.key === "ArrowRight" ? Math.min(exploreTabs.length - 1, index + 1) : Math.max(0, index - 1);
            exploreTabs[nextIndex]?.focus();
          }
        };
      });

      const inspTabs = document.querySelectorAll(".inspector-tab");
      inspTabs.forEach((tab, index) => {
        tab.onclick = () => {
          const t = tab.getAttribute("data-tab");
          switchInspectorTab(t);
        };
        tab.onkeydown = (e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            const nextIndex = e.key === "ArrowRight" ? Math.min(inspTabs.length - 1, index + 1) : Math.max(0, index - 1);
            inspTabs[nextIndex]?.focus();
          }
        };
      });

      if (searchInput) {
        // Support Enter key for search
        searchInput.onkeydown = (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (searchBtn) searchBtn.click();
          } else if (e.key === "ArrowDown") {
            const firstResult = document.querySelector("#search-results-container .nv-card[data-ref-id]");
            if (firstResult) {
              e.preventDefault();
              firstResult.focus();
            }
          }
        };
        // Toggle save button on input changes
        searchInput.oninput = () => {
          const query = searchInput.value.trim();
          if (saveQueryBtn) {
            saveQueryBtn.disabled = !query || savedQueries.includes(query);
          }
        };
      }

      if (searchBtn) {
        searchBtn.onclick = () => {
          const query = searchInput ? searchInput.value : "";
          runSearch(query, false);
        };
      }

      if (saveQueryBtn) {
        saveQueryBtn.onclick = () => {
          const query = searchInput ? searchInput.value.trim() : "";
          if (query && !savedQueries.includes(query)) {
            savedQueries.unshift(query);
            if (savedQueries.length > 8) {
              savedQueries.pop();
            }
            addTrailEvent("save_query", `Saved query "${query}"`, { query });
            saveWorkspaceState();
            renderMemoryLayer();
            saveQueryBtn.disabled = true;
          }
        };
      }

      if (compileQueryBtn) {
        compileQueryBtn.onclick = () => {
          const query = searchInput ? searchInput.value.trim() : "";
          if (!query) {
            if (searchInput) searchInput.focus();
            return;
          }
          if (window.NV_DEBUG) console.log(`Compiling evidence from query: ${query}`);
          currentCompiledEvidence = adapter.compileEvidenceFromQuery(retrievalState, query);
          if (currentCompiledEvidence) {
            addToTimeline(currentCompiledEvidence);
          }
          // Context invalidation: clear active selection derived states
          selectedReferenceId = null;
          selectedRelationship = null;
          syncSelectionHighlighting();
          renderReferenceInspector();
          renderRelationshipInspector();

          addTrailEvent("compile_query", `Compiled evidence from query "${query}"`, { query });
          switchInspectorTab("evidence");
          renderEvidence(currentCompiledEvidence);
          saveWorkspaceState();
        };
      }

      if (clearSessionBtn) {
        clearSessionBtn.onclick = () => {
          // Clear localStorage
          localStorage.removeItem("neuralverse.retrievalWorkspace.v1");

          // Reset state
          resetStateToDefaults();

          // Reset dropdown inputs in DOM
          const filterSelect = document.getElementById("graph-filter-select");
          const depthSelect = document.getElementById("graph-hop-select");
          if (filterSelect) filterSelect.value = "all";
          if (depthSelect) depthSelect.value = "full";

          // Clear query input
          if (searchInput) {
            searchInput.value = "";
          }

          // Clear results
          currentSearchResults = [];
          renderSearchResults();

          // Render
          switchExplorationMode("search");
          switchInspectorTab("reference");
          renderSeededReferences();
          renderReferenceInspector();
          renderEvidence(null);
          renderRelationshipInspector();
          renderMemoryLayer();
          renderResumeBanner();
          renderQuickActions();

          // Reset dropdown inputs for prefs in DOM
          const prefDefaultMode = document.getElementById("pref-default-mode");
          const prefDefaultTab = document.getElementById("pref-default-tab");
          const prefDensity = document.getElementById("pref-density");
          const prefRelationshipFilter = document.getElementById("pref-relationship-filter");
          const prefAutoOpen = document.getElementById("pref-auto-open");
          const prefInspectorWidth = document.getElementById("pref-inspector-width");

          if (prefDefaultMode) prefDefaultMode.value = preferences.defaultExplorationMode;
          if (prefDefaultTab) prefDefaultTab.value = preferences.defaultInspectorTab;
          if (prefDensity) prefDensity.value = preferences.density;
          if (prefRelationshipFilter) prefRelationshipFilter.value = preferences.preferredRelationshipFilter;
          if (prefAutoOpen) prefAutoOpen.checked = preferences.autoOpenInspector;
          if (prefInspectorWidth) prefInspectorWidth.value = preferences.inspectorWidth;

          if (searchFeedback) searchFeedback.textContent = "No active query.";
          if (saveQueryBtn) saveQueryBtn.disabled = true;

          if (window.NV_DEBUG) console.log("Session cleared.");
        };
      }

      if (clearTrailBtn) {
        clearTrailBtn.onclick = (e) => {
          e.stopPropagation();
          knowledgeTrail = [];
          saveWorkspaceState();
          renderMemoryLayer();
        };
      }
    } catch (err) {
      console.error("Error in initPlayground():", err);
      const diagBadge = document.getElementById("nv-diagnostics-badge");
      if (diagBadge) {
        diagBadge.textContent = `Init Error: ${err.message}`;
        diagBadge.setAttribute("data-variant", "error");
      }
    }
  }

  // Listen for the custom route render event or fallback if already loaded
  window.addEventListener('nv:routerendered', (e) => {
    if (e.detail?.routeId === "retrieval-playground") {
      initPlayground();
    }
  });

  // Subscribe to navigation route changes (legacy fallback/refreshes)
  if (window.navigationState) {
    window.navigationState.subscribe((state) => {
      if (state.currentRoute?.id === "retrieval-playground") {
        if (!document.getElementById("playground-search-input")) {
          setTimeout(() => {
            if (document.getElementById("playground-search-input")) {
              initPlayground();
            }
          }, 50);
        } else {
          initPlayground();
        }
      }
    });
  }

  // Expose module globally
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.retrievalPlayground = {
    initPlayground,
    toggleSelection,
    retrievalState,
    switchExplorationMode,
    switchInspectorTab
  };

  // Diagnostic floating console wrapper for development testing
  window.addEventListener('error', (event) => {
    let debugContainer = document.getElementById("nv-debug-error-console");
    if (!debugContainer) {
      debugContainer = document.createElement("div");
      debugContainer.id = "nv-debug-error-console";
      debugContainer.style.position = "fixed";
      debugContainer.style.bottom = "20px";
      debugContainer.style.right = "20px";
      debugContainer.style.backgroundColor = "rgba(239, 68, 68, 0.95)";
      debugContainer.style.color = "white";
      debugContainer.style.padding = "12px 18px";
      debugContainer.style.borderRadius = "var(--ref-radius-soft, 6px)";
      debugContainer.style.zIndex = "999999";
      debugContainer.style.fontFamily = "var(--sys-font-code-family, monospace)";
      debugContainer.style.fontSize = "0.75rem";
      debugContainer.style.maxWidth = "400px";
      debugContainer.style.boxShadow = "var(--sys-shadow-depth-3, 0 10px 15px -3px rgba(0, 0, 0, 0.3))";
      debugContainer.style.border = "1px solid rgba(255, 255, 255, 0.2)";
      document.body.appendChild(debugContainer);
    }
    debugContainer.innerHTML = `<strong>NeuralVerse Diagnostic Error:</strong><br>${event.message}<br><small>${event.filename || 'unknown'}:${event.lineno || 0}</small>`;
  });

  window.addEventListener('unhandledrejection', (event) => {
    let debugContainer = document.getElementById("nv-debug-error-console");
    if (!debugContainer) {
      debugContainer = document.createElement("div");
      debugContainer.id = "nv-debug-error-console";
      debugContainer.style.position = "fixed";
      debugContainer.style.bottom = "20px";
      debugContainer.style.right = "20px";
      debugContainer.style.backgroundColor = "rgba(239, 68, 68, 0.95)";
      debugContainer.style.color = "white";
      debugContainer.style.padding = "12px 18px";
      debugContainer.style.borderRadius = "var(--ref-radius-soft, 6px)";
      debugContainer.style.zIndex = "999999";
      debugContainer.style.fontFamily = "var(--sys-font-code-family, monospace)";
      debugContainer.style.fontSize = "0.75rem";
      debugContainer.style.maxWidth = "400px";
      debugContainer.style.boxShadow = "var(--sys-shadow-depth-3, 0 10px 15px -3px rgba(0, 0, 0, 0.3))";
      debugContainer.style.border = "1px solid rgba(255, 255, 255, 0.2)";
      document.body.appendChild(debugContainer);
    }
    debugContainer.innerHTML = `<strong>NeuralVerse Unhandled Promise Rejection:</strong><br>${event.reason}`;
  });
})();
