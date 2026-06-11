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

  // Persistence State
  let pinnedReferences = [];
  let recentReferences = [];
  let savedQueries = [];
  let knowledgeTrail = [];
  let activeExplorationMode = "search";
  let activeInspectorTab = "reference";
  let evidenceTimeline = [];

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
        evidenceTimeline = state.evidenceTimeline || [];

        showSessionRestoredIndicator();
      } else {
        resetStateToDefaults();
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
    evidenceTimeline = [];
  }

  // Save state to localStorage
  function saveWorkspaceState() {
    try {
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
        evidenceTimeline
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
  function renderSeededReferences() {
    const listContainer = document.getElementById("seeded-references-list");
    if (!listContainer) return;

    listContainer.innerHTML = retrievalState.references.map(ref => {
      const isSelected = ref.id === selectedReferenceId;
      const rels = adapter.getRelationshipsForReference(retrievalState, ref.id);
      const relCount = rels.length;
      return `
        <div class="nv-card ${isSelected ? 'nv-card--selected' : ''}"
             data-ref-id="${ref.id}"
             tabindex="0"
             role="listitem"
             aria-selected="${isSelected ? 'true' : 'false'}"
             aria-label="Reference ${ref.title}">
          <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between; align-items: flex-start;">
            <h4 style="margin: 0; font-size: var(--sys-font-body-size); color: var(--sys-color-text-primary); flex: 1; font-weight: var(--ref-font-weight-medium);">${ref.title}</h4>
            <div class="nv-cluster nv-cluster--gap-xs" style="flex-shrink: 0; align-items: center;">
              <span class="nv-badge" data-variant="info" style="font-size: 0.65rem; text-transform: uppercase;">${ref.type}</span>
              <span class="nv-badge" data-variant="${ref.status === 'active' ? 'success' : 'neutral'}" style="font-size: 0.65rem; text-transform: uppercase;">${ref.status}</span>
            </div>
          </div>
          <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.4;"></div>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0; pointer-events: none; line-height: 1.5;">
            <strong>ID:</strong> <span style="font-family: var(--sys-font-code-family);">${ref.id}</span> | <strong>Relations:</strong> ${relCount}<br>
            <strong>Source:</strong> <span style="font-family: var(--sys-font-code-family); font-size: 0.7rem;">${ref.source}</span>
          </p>
        </div>
      `;
    }).join("");

    bindSelectionClicks(listContainer);
  }

  // DOM Rendering: Search Results
  function renderSearchResults() {
    const container = document.getElementById("search-results-container");
    if (!container) return;

    if (!currentSearchQuery || currentSearchQuery.trim() === "") {
      container.innerHTML = `
        <div class="nv-empty-state">
          <div class="nv-empty-state-icon" aria-hidden="true">🔍</div>
          <p class="nv-muted" style="font-size: var(--sys-font-body-size); font-weight: var(--ref-font-weight-medium); color: var(--sys-color-text-primary); margin-bottom: var(--sys-space-stack-xs);">Start by searching a topic</p>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">Try searching: Transformer, Vision, Detection, NLP...</p>
        </div>
      `;
      return;
    }

    if (currentSearchResults.length === 0) {
      container.innerHTML = `
        <div class="nv-empty-state">
          <div class="nv-empty-state-icon" aria-hidden="true">⚠️</div>
          <p class="nv-muted" style="font-size: var(--sys-font-body-size); font-weight: var(--ref-font-weight-medium); color: var(--sys-color-text-primary); margin-bottom: var(--sys-space-stack-xs);">No related evidence was found</p>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">Try searching a different keyword or check spelling.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = currentSearchResults.map(res => {
      const isSelected = res.reference.id === selectedReferenceId;
      const rels = adapter.getRelationshipsForReference(retrievalState, res.reference.id);
      const relCount = rels.length;
      return `
        <div class="nv-card ${isSelected ? 'nv-card--selected' : ''}"
             data-ref-id="${res.reference.id}"
             tabindex="0"
             role="button"
             aria-selected="${isSelected ? 'true' : 'false'}"
             aria-label="Result ${res.reference.title}">
          <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between; align-items: flex-start;">
            <h4 style="margin: 0; font-size: var(--sys-font-body-size); color: var(--sys-color-text-primary); flex: 1; font-weight: var(--ref-font-weight-medium);">${res.reference.title}</h4>
            <span class="nv-badge" data-variant="info" style="font-size: 0.65rem; text-transform: uppercase;">Score: ${res.score}</span>
          </div>
          <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.4;"></div>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0; pointer-events: none; line-height: 1.5;">
            <strong>ID:</strong> <span style="font-family: var(--sys-font-code-family);">${res.reference.id}</span> | <strong>Relations:</strong> ${relCount}<br>
            <strong>Matches:</strong> [${res.matchedKeywords.join(", ")}]
          </p>
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
          <div class="nv-empty-state-icon" aria-hidden="true">📌</div>
          <p class="nv-muted" style="font-size: var(--sys-font-body-size); font-weight: var(--ref-font-weight-medium); color: var(--sys-color-text-primary); margin-bottom: var(--sys-space-stack-xs);">No Reference Selected</p>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">Select a reference from search results, graph, or list to inspect details.</p>
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
          <div class="nv-empty-state-icon" aria-hidden="true">⚠️</div>
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

    container.innerHTML = `
      <div class="nv-card nv-card--selected" style="margin: 0; border: none; background-color: var(--sys-color-surface-container-low) !important; cursor: default;">
        <h4 style="margin: 0; font-size: var(--sys-font-body-size); color: var(--sys-color-text-primary); font-weight: var(--ref-font-weight-semibold);">${ref.title}</h4>
        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.4;"></div>
        <p class="nv-muted" style="font-size: var(--sys-font-caption-size); line-height: 1.6; margin: 0;">
          <strong>Identifier:</strong> <span style="font-family: var(--sys-font-code-family);">${ref.id}</span><br>
          <strong>Type:</strong> <span class="nv-badge" data-variant="info">${ref.type}</span><br>
          <strong>Status:</strong> <span class="nv-badge" data-variant="success">${ref.status}</span><br>
          <strong>Source Path:</strong> <a href="${ref.source}" target="_blank" style="color: var(--sys-color-accent-primary); text-decoration: none; word-break: break-all;">${ref.source}</a>
        </p>
        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.4;"></div>
        <h5 style="margin: 0 0 4px 0; font-size: 0.65rem;">Keywords</h5>
        <div class="nv-cluster nv-cluster--gap-xs" style="flex-wrap: wrap;">
          ${ref.keywords.map(kw => `<span class="nv-badge" data-variant="neutral" style="font-size: 0.6rem;">${kw}</span>`).join("")}
        </div>
        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.4;"></div>
        <h5 style="margin: 0 0 var(--sys-space-stack-xs) 0; font-size: 0.65rem;">Citations (${rels.length})</h5>
        <div class="nv-stack nv-stack--gap-xs" style="max-height: 150px; overflow-y: auto;">
          ${rels.length === 0 ? '<p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">No direct graph connections.</p>' : rels.map(rel => {
            const isOutgoing = rel.sourceReferenceId === ref.id;
            const targetId = isOutgoing ? rel.targetReferenceId : rel.sourceReferenceId;
            return `
              <div class="nv-card" style="padding: 4px; font-size: 0.65rem; margin-bottom: 2px;" data-rel-id="${rel.id}">
                <strong>${isOutgoing ? '➔ Out' : '➔ In'}</strong> | ${rel.type} | <strong>${targetId}</strong>
              </div>
            `;
          }).join("")}
        </div>
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
        console.log(`Compiling evidence from reference: ${ref.id}`);
        currentCompiledEvidence = adapter.compileEvidenceFromReference(retrievalState, ref.id);
        if (currentCompiledEvidence) {
          addToTimeline(currentCompiledEvidence);
        }
        addTrailEvent("compile_ref", `Compiled evidence from "${ref.id}"`, { referenceId: ref.id });
        switchInspectorTab("evidence");
        renderEvidence(currentCompiledEvidence);
      };
    }

    renderDiscoverySpace();
    renderRelationshipNeighborhood();
  }

  // DOM Rendering: Discovery Space Panel (Carousel, Related, Similar, Citation Continuations, Dead-End Suggestions)
  function renderDiscoverySpace() {
    const container = document.getElementById("discovery-container");
    if (!container) return;

    if (!selectedReferenceId) {
      container.innerHTML = "";
      return;
    }

    const sessionState = { recentReferences };
    const discoveryData = adapter.getDiscoverySuggestions(retrievalState, selectedReferenceId, sessionState);
    const continuations = adapter.getCitationContinuations(retrievalState, selectedReferenceId);

    let html = "";

    // 1. Contextual Discovery Carousel
    if (discoveryData.suggestions && discoveryData.suggestions.length > 0) {
      html += `
        <div class="discovery-section-title">Discovery Suggestions</div>
        <div class="discovery-carousel" role="toolbar" aria-label="Contextual Discovery Carousel">
      `;
      for (const item of discoveryData.suggestions) {
        const ref = item.reference;
        let categoryLabel = "";
        if (item.category === "related") categoryLabel = "Related";
        else if (item.category === "similar") categoryLabel = "Similar";
        else categoryLabel = "Continue";

        html += `
          <div class="discovery-card" data-ref-id="${ref.id}" tabindex="0" title="Click to inspect ${ref.title}">
            <div class="discovery-card-meta">
              <span class="nv-badge" data-variant="info" style="font-size: 0.55rem; padding: 1px 3px;">${ref.type}</span>
              <span class="nv-badge" data-variant="neutral" style="font-size: 0.55rem; padding: 1px 3px;">${categoryLabel}</span>
            </div>
            <div class="discovery-card-title">${ref.title}</div>
            <div class="discovery-card-reason">${item.reason}</div>
          </div>
        `;
      }
      html += `</div>`;
    }

    // 2. Dead-End Prevention Fallback Banner
    if (discoveryData.isDeadEnd) {
      html += `
        <div class="dead-end-fallback-box">
          <p class="dead-end-fallback-text">⚠️ No direct relationships found. Try exploring similar references.</p>
      `;
      if (discoveryData.suggestedQuery) {
        html += `
          <button class="nv-button dead-end-query-btn" data-query="${discoveryData.suggestedQuery}" data-variant="secondary" style="font-size: 0.65rem; padding: 2px 6px; width: 100%; text-align: left; min-block-size: unset;">
            🔍 Search: "${discoveryData.suggestedQuery}"
          </button>
        `;
      }
      html += `</div>`;
    }

    // 3. Citation Continuations
    if (continuations && continuations.length > 0) {
      html += `
        <div class="discovery-section-title">Citation Continuations</div>
        <div class="continuation-container">
      `;
      for (const c of continuations) {
        html += `
          <button class="continuation-chip" data-ref-id="${c.targetReferenceId}" data-type="${c.relType}" title="${c.description}">
            🔗 ${c.actionLabel}: ${c.targetReferenceId}
          </button>
        `;
      }
      html += `</div>`;
    }

    // 4. Ranked Related References List (Detailed list below Carousel/Continuations)
    const allRelated = adapter.getRelatedReferences(retrievalState, selectedReferenceId);
    if (allRelated && allRelated.length > 0) {
      html += `
        <div class="discovery-section-title">Ranked Related References</div>
        <div class="nv-stack nv-stack--gap-xs" style="max-height: 200px; overflow-y: auto;">
      `;
      for (const r of allRelated) {
        const ref = r.reference;
        const relBadge = r.relType ? `<span class="nv-badge" data-variant="warning" style="font-size: 0.55rem; padding: 1px 3px; font-family: monospace;">${r.relType}</span>` : "";
        html += `
          <div class="nv-card discovery-related-item-card" data-ref-id="${ref.id}" style="padding: 6px; font-size: 0.65rem; display: flex; flex-direction: column; gap: 4px; cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 4px;">
              <span style="font-weight: var(--ref-font-weight-semibold); color: var(--sys-color-text-primary); flex: 1;">${ref.title}</span>
              <span class="nv-badge" data-variant="info" style="font-size: 0.55rem; padding: 1px 3px;">${ref.type}</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--sys-space-inline-xs); margin-top: 2px;">
              <span style="color: var(--sys-color-text-secondary); font-size: 0.6rem;">${r.reason}</span>
              ${relBadge}
            </div>
          </div>
        `;
      }
      html += `</div>`;
    }

    container.innerHTML = html;

    // Add interactive click/keydown event listeners
    // Carousel suggestions
    container.querySelectorAll(".discovery-card").forEach(card => {
      card.onclick = () => {
        const refId = card.getAttribute("data-ref-id");
        addTrailEvent("Discovery suggestion opened", `Opened suggestion "${refId}"`, { referenceId: refId });
        toggleSelection(refId);
      };
      card.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const refId = card.getAttribute("data-ref-id");
          addTrailEvent("Discovery suggestion opened", `Opened suggestion "${refId}"`, { referenceId: refId });
          toggleSelection(refId);
        }
      };
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

    // Continuation chips
    container.querySelectorAll(".continuation-chip").forEach(chip => {
      chip.onclick = () => {
        const refId = chip.getAttribute("data-ref-id");
        const relType = chip.getAttribute("data-type");
        addTrailEvent("Citation continuation followed", `Followed ${relType} citation to "${refId}"`, { referenceId: refId });
        toggleSelection(refId);
      };
    });

    // Ranked related item cards
    container.querySelectorAll(".discovery-related-item-card").forEach(card => {
      card.onclick = () => {
        const refId = card.getAttribute("data-ref-id");
        addTrailEvent("Related reference opened", `Opened related reference "${refId}"`, { referenceId: refId });
        toggleSelection(refId);
      };
    });
  }

  // DOM Rendering: Relationship Neighborhood Panel (Textual/card-based direct relationships)
  function renderRelationshipNeighborhood() {
    const container = document.getElementById("relationship-neighborhood-container");
    if (!container) return;

    if (!selectedReferenceId) {
      container.innerHTML = `
        <div class="nv-empty-state">
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">Select a reference to view its relationship neighborhood.</p>
        </div>
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
      <div class="discovery-section-title">Neighborhood of ${neighborhood.reference.id}</div>
      <div class="neighborhood-grid">
    `;

    for (const item of neighborhood.neighbors) {
      const neighbor = item.neighbor;
      if (!neighbor) continue;
      const isOutgoing = item.direction === "outgoing";
      const dirText = isOutgoing ? "➔ Outgoing to" : "➔ Incoming from";
      const badgeVariant = isOutgoing ? "info" : "neutral";

      html += `
        <div class="neighborhood-card neighborhood-item-card" data-ref-id="${neighbor.id}" style="cursor: pointer;">
          <div class="neighborhood-header">
            <span class="neighborhood-direction nv-badge" data-variant="${badgeVariant}">${dirText}</span>
            <span class="nv-badge" data-variant="warning">${item.type}</span>
          </div>
          <div style="font-weight: var(--ref-font-weight-semibold); font-size: 0.65rem; color: var(--sys-color-text-primary); margin-top: 2px;">
            ${neighbor.title} (${neighbor.id})
          </div>
          <div class="neighborhood-context">
            Strength: ${item.strength} | "${item.context || 'No context'}"
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // Add interactive click to open neighborhood references
    container.querySelectorAll(".neighborhood-item-card").forEach(card => {
      card.onclick = () => {
        const refId = card.getAttribute("data-ref-id");
        addTrailEvent("Neighborhood reference opened", `Opened neighborhood node "${refId}"`, { referenceId: refId });
        toggleSelection(refId);
      };
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
        toggleSelection(rel.sourceReferenceId);
      };
    }
    if (followTgtBtn) {
      followTgtBtn.onclick = () => {
        addTrailEvent("Followed relationship target", `Followed target "${rel.targetReferenceId}" from edge "${rel.id}"`, { referenceId: rel.targetReferenceId });
        toggleSelection(rel.targetReferenceId);
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
          <div class="nv-empty-state-icon" aria-hidden="true" style="font-size: 2rem; margin-bottom: var(--sys-space-stack-xs);">📋</div>
          <p class="nv-muted" style="font-size: var(--sys-font-body-size); font-weight: var(--ref-font-weight-medium); color: var(--sys-color-text-primary); margin-bottom: var(--sys-space-stack-xs);">No Evidence Compiled Yet</p>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin-bottom: var(--sys-space-stack-md);">Synthesis requires an active query or reference node seed.</p>
          <div class="nv-stack nv-stack--gap-xs" style="align-items: stretch;">
            <button class="nv-button" id="evidence-empty-compile-query" data-variant="primary" style="font-size: var(--sys-font-caption-size);">
              Compile Current Query
            </button>
            <button class="nv-button" id="evidence-empty-compile-ref" data-variant="secondary" style="font-size: var(--sys-font-caption-size);" disabled>
              Compile Selected Reference
            </button>
            <button class="nv-button" id="evidence-empty-return-explore" data-variant="neutral" style="font-size: var(--sys-font-caption-size);">
              Return to Exploration
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
            addTrailEvent("compile_query", `Compiled evidence from query "${currentSearchQuery}" via empty state`, { query: currentSearchQuery });
            renderEvidence(currentCompiledEvidence);
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

      const emptyReturnExplore = document.getElementById("evidence-empty-return-explore");
      if (emptyReturnExplore) {
        emptyReturnExplore.onclick = () => {
          switchExplorationMode("search");
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
      confVariant = "danger";
    }

    // 2. Structured Recommendation text
    let recommendation = "";
    if (comp.confidence === "high") {
      recommendation = "The graph coverage indicates a highly integrated network topology. Analyze the citation paths in Graph Mode or continue discovery around the primary nodes.";
    } else if (comp.confidence === "medium") {
      recommendation = "Moderate graph coverage detected. Try exploring the citation neighborhood of the primary references to uncover additional contextual paths.";
    } else {
      recommendation = "Limited evidence identified. Try refining your search query terms or registering new source references in the registry.";
    }

    // 3. Supporting references
    const allContributing = [
      ...comp.matchedReferences.map(r => ({ ref: r, role: "Primary Match" })),
      ...comp.relatedReferences.map(r => ({ ref: r, role: "Supporting Context" }))
    ];

    container.innerHTML = `
      <div class="nv-stack nv-stack--gap-sm" role="region" aria-label="Evidence compilation details" style="max-height: calc(100vh - 200px); overflow-y: auto; padding-right: 4px;">

        <!-- Job Header & Qualitative Confidence -->
        <div class="nv-stack nv-stack--gap-xs" style="background-color: var(--sys-color-surface-container-low); padding: var(--sys-space-stack-xs); border-radius: var(--sys-border-radius-sm); border: 1px solid var(--sys-color-border-subtle);">
          <div class="nv-cluster nv-cluster--gap-xs" style="align-items: center; justify-content: space-between;">
            <span style="font-size: 0.6rem; font-family: var(--sys-font-code-family); color: var(--sys-color-text-secondary);">ID: ${comp.id}</span>
            <span class="nv-badge" data-variant="${confVariant}" style="font-weight: var(--ref-font-weight-semibold);">${confLabel}</span>
          </div>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0; line-height: 1.3;">${confExplanation}</p>
        </div>

        <!-- Evidence Summary Sections -->
        <div class="nv-stack nv-stack--gap-xs">
          <h5 style="margin: 0; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sys-color-accent-primary);">Main Conclusion</h5>
          <p style="font-size: var(--sys-font-caption-size); color: var(--sys-color-text-primary); margin: 0; line-height: 1.4; font-style: italic;">
            "${comp.summary.split(".")[0]}."
          </p>
        </div>

        <div class="nv-stack nv-stack--gap-xs">
          <h5 style="margin: 0; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sys-color-accent-primary);">Key Findings</h5>
          <ul style="margin: 0; padding-left: 1rem; font-size: var(--sys-font-caption-size); color: var(--sys-color-text-primary); line-height: 1.4;">
            <li>Retrieved <strong>${comp.matchedReferences.length}</strong> direct matching reference(s) from registry.</li>
            <li>Detected <strong>${comp.relationships.length}</strong> semantic relationships between workspace elements.</li>
            <li>Linked <strong>${comp.relatedReferences.length}</strong> contextual neighbor reference(s) for additional evidence.</li>
          </ul>
        </div>

        <div class="nv-stack nv-stack--gap-xs">
          <h5 style="margin: 0; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sys-color-accent-primary);">Supporting Context</h5>
          <p style="font-size: var(--sys-font-caption-size); color: var(--sys-color-text-secondary); margin: 0; line-height: 1.4;">
            ${comp.summary}
          </p>
        </div>

        <div class="nv-stack nv-stack--gap-xs">
          <h5 style="margin: 0; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sys-color-accent-primary);">Research Recommendation</h5>
          <p style="font-size: var(--sys-font-caption-size); color: var(--sys-color-text-secondary); margin: 0; line-height: 1.4;">
            ${recommendation}
          </p>
        </div>

        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.3;"></div>

        <!-- Evidence Lineage (Hierarchy tree style) -->
        <div class="nv-stack nv-stack--gap-xs">
          <h5 style="margin: 0; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sys-color-accent-primary);">Evidence Lineage</h5>
          <div class="lineage-tree" style="font-family: var(--sys-font-code-family); font-size: var(--sys-font-caption-size); color: var(--sys-color-text-primary); padding-left: 2px;">
            <div style="font-weight: var(--ref-font-weight-semibold); color: var(--sys-color-text-primary);">📂 Compiled Evidence</div>
            ${comp.matchedReferences.map(r => `
              <div style="padding-left: 12px; border-left: 1px solid var(--sys-color-border-subtle); margin-left: 4px; padding-top: 2px; padding-bottom: 2px;">
                ├── <span class="lineage-node clickable-lineage-node" data-id="${r.id}" style="cursor: pointer; color: var(--sys-color-accent-primary); text-decoration: underline;" tabindex="0" role="button" aria-label="Lineage Node: Primary Match ${r.id}">[Primary] ${r.id}</span>
              </div>
            `).join("")}
            ${comp.relatedReferences.map((r, idx) => {
              const isLast = idx === comp.relatedReferences.length - 1;
              const lineChar = isLast ? "└──" : "├──";
              return `
                <div style="padding-left: 12px; border-left: ${isLast ? 'none' : '1px solid var(--sys-color-border-subtle)'}; margin-left: 4px; padding-top: 2px; padding-bottom: 2px;">
                  ${lineChar} <span class="lineage-node clickable-lineage-node" data-id="${r.id}" style="cursor: pointer; color: var(--sys-color-accent-primary); text-decoration: underline;" tabindex="0" role="button" aria-label="Lineage Node: Supporting Context ${r.id}">${r.id}</span>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.3;"></div>

        <!-- Supporting References interactive list -->
        <div class="nv-stack nv-stack--gap-xs">
          <h5 style="margin: 0; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sys-color-accent-primary);">Supporting References (${allContributing.length})</h5>
          <div class="nv-stack nv-stack--gap-xs">
            ${allContributing.length === 0 ? '<p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">No contributing references found.</p>' : allContributing.map(item => {
              const relsCount = adapter.getRelationshipsForReference(retrievalState, item.ref.id).length;
              const isPinned = pinnedReferences.includes(item.ref.id);
              return `
                <div class="nv-card" style="padding: var(--sys-space-stack-xs); background-color: var(--sys-color-surface-container-lowest); border: 1px solid var(--sys-color-border-subtle); border-radius: var(--sys-border-radius-sm);">
                  <div class="nv-cluster nv-cluster--gap-xs" style="justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
                    <span style="font-size: 0.65rem; font-family: var(--sys-font-code-family); color: var(--sys-color-text-primary); font-weight: var(--ref-font-weight-semibold);">${item.ref.id}</span>
                    <span class="nv-badge" data-variant="${item.role === 'Primary Match' ? 'success' : 'info'}" style="font-size: 0.55rem; padding: 1px 4px;">${item.role}</span>
                  </div>
                  <h6 style="margin: 2px 0; font-size: var(--sys-font-caption-size); font-weight: var(--ref-font-weight-medium); color: var(--sys-color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.ref.title}</h6>
                  <p class="nv-muted" style="font-size: 0.6rem; margin: 2px 0;">
                    Type: <strong>${item.ref.type}</strong> | Status: <strong>${item.ref.status}</strong> | Rels: <strong>${relsCount}</strong>
                  </p>
                  <div class="nv-cluster nv-cluster--gap-xs" style="margin-top: var(--sys-space-stack-xs); justify-content: flex-end;">
                    <button class="nv-button" data-action="pin-supporting" data-id="${item.ref.id}" style="padding: 2px 6px; min-block-size: unset; font-size: 0.55rem;">
                      ${isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button class="nv-button" data-action="open-supporting" data-id="${item.ref.id}" data-variant="primary" style="padding: 2px 6px; min-block-size: unset; font-size: 0.55rem;">
                      Open in Inspector
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.3;"></div>

        <!-- Provenance Metadata -->
        <div class="nv-stack nv-stack--gap-xs">
          <h5 style="margin: 0; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sys-color-accent-primary);">Provenance Metadata</h5>
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
                <td style="padding: 2px 0; font-weight: var(--ref-font-weight-medium);">Matched Refs:</td>
                <td style="padding: 2px 0; text-align: right;">${comp.matchedReferences.length}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 2px 0; font-weight: var(--ref-font-weight-medium);">Supporting Refs:</td>
                <td style="padding: 2px 0; text-align: right;">${comp.relatedReferences.length}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 2px 0; font-weight: var(--ref-font-weight-medium);">Relationships:</td>
                <td style="padding: 2px 0; text-align: right;">${comp.relationships.length}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 2px 0; font-weight: var(--ref-font-weight-medium);">Timestamp:</td>
                <td style="padding: 2px 0; text-align: right; font-family: var(--sys-font-code-family);">${new Date(comp.createdAt).toLocaleTimeString()}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 4px; font-style: italic; font-size: 0.55rem; color: var(--sys-color-text-tertiary);">
                  Compiled from active ${comp.mode === "query" ? "search query" : "reference node seed"} context.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.3;"></div>

        <!-- Related Relationships -->
        <div class="nv-stack nv-stack--gap-xs">
          <h5 style="margin: 0; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sys-color-accent-primary);">Related Relationships (${comp.relationships.length})</h5>
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

        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.3;"></div>

        <!-- Suggested Next Actions -->
        <div class="nv-stack nv-stack--gap-xs">
          <h5 style="margin: 0; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sys-color-accent-primary);">Suggested Next Actions</h5>
          <div class="nv-stack nv-stack--gap-xs">
            ${comp.matchedReferences.length > 0 ? `
              <button class="nv-button" id="action-explore-neighborhood" data-id="${comp.matchedReferences[0].id}" data-variant="secondary" style="font-size: var(--sys-font-caption-size); padding: 4px;">
                Explore Neighborhood for ${comp.matchedReferences[0].id}
              </button>
              <button class="nv-button" id="action-continue-discovery" data-id="${comp.matchedReferences[0].id}" data-variant="secondary" style="font-size: var(--sys-font-caption-size); padding: 4px;">
                Continue Discovery for ${comp.matchedReferences[0].id}
              </button>
            ` : ""}
            <button class="nv-button" id="action-return-search" data-variant="neutral" style="font-size: var(--sys-font-caption-size); padding: 4px;">
              Return to Search Mode
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
        toggleSelection(id);
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
        toggleSelection(id);
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

    const nextContinueBtn = document.getElementById("action-continue-discovery");
    if (nextContinueBtn) {
      const id = nextContinueBtn.getAttribute("data-id");
      nextContinueBtn.onclick = () => {
        selectedReferenceId = id;
        addToRecentlyViewed(id);
        switchExplorationMode("discovery");
        addTrailEvent("action_continue_discovery", `Continued discovery for "${id}" from suggested next actions`, { referenceId: id });
        saveWorkspaceState();
        renderDiscoveryMode();
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
            let qualVariant = item.confidence === "high" ? "success" : (item.confidence === "medium" ? "warning" : "danger");
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

    // Clear previous SVG content
    svg.innerHTML = "";

    // Define Grid Pattern and Arrow Markers for direction-aware styling
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.02)" stroke-width="1"/>
      </pattern>
      <marker id="arrow-default" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#384c5c" />
      </marker>
      <marker id="arrow-selected" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f0ff" />
      </marker>
      <marker id="arrow-outbound" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff0055" />
      </marker>
      <marker id="arrow-inbound" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#39ff14" />
      </marker>
    `;
    svg.appendChild(defs);

    // Draw grid background
    const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bgRect.setAttribute("width", "100%");
    bgRect.setAttribute("height", "100%");
    bgRect.setAttribute("fill", "url(#grid)");
    svg.appendChild(bgRect);

    const overlay = document.getElementById("graph-empty-state-overlay");
    const msgEl = document.getElementById("graph-empty-state-message");
    const subtextEl = document.getElementById("graph-empty-state-subtext");

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

    // 1. Check if depth is localized but no node is selected
    if ((neighborhoodDepth === "1-hop" || neighborhoodDepth === "2-hop") && !selectedReferenceId) {
      showOverlay("Select a reference to focus the graph, or switch to Full Graph.", "Graph neighborhood requires an active selection node.");
      return;
    }

    const allRels = retrievalState.relationships;

    // Filter relationships based on the selected filter type
    const filteredRels = adapter.filterRelationships(allRels, relationshipFilter);

    // Get neighborhood nodes and edges
    const { nodes: visibleNodes, edges: visibleEdges } = adapter.getNeighborhoodNodesAndEdges(
      retrievalState,
      selectedReferenceId,
      neighborhoodDepth,
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
      return;
    }

    const width = svg.clientWidth || 600;
    const height = svg.clientHeight || 480;

    // Force-directed layout: compute optimized node positions
    const nodeCoords = adapter.computeForceLayout(
      visibleNodes,
      visibleEdges,
      width,
      height,
      selectedReferenceId || null
    );

    // Compute edge paths with bezier curves for bidirectional pairs
    const edgePaths = adapter.computeEdgePaths(visibleEdges, nodeCoords);

    // Determine direction-aware highlighting state
    const activeRefId = selectedReferenceId;
    const outboundNodeIds = new Set();
    const inboundNodeIds = new Set();
    const outboundRelIds = new Set();
    const inboundRelIds = new Set();

    if (activeRefId) {
      visibleEdges.forEach(rel => {
        if (rel.sourceReferenceId === activeRefId) {
          outboundNodeIds.add(rel.targetReferenceId);
          outboundRelIds.add(rel.id);
        } else if (rel.targetReferenceId === activeRefId) {
          inboundNodeIds.add(rel.sourceReferenceId);
          inboundRelIds.add(rel.id);
        }
      });
    }

    // Render Relationships as <path> elements (straight or curved)
    edgePaths.forEach(({ edge: rel, pathData }) => {
      const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("d", pathData);
      pathEl.setAttribute("fill", "none");
      pathEl.setAttribute("class", "graph-link");

      // Default marker
      pathEl.setAttribute("marker-end", "url(#arrow-default)");

      // Click edge selects relationship
      pathEl.style.cursor = "pointer";
      pathEl.onclick = (e) => {
        e.stopPropagation();
        selectedRelationship = rel;
        addTrailEvent("Graph edge selected", `Inspected relationship "${rel.sourceReferenceId} ➔ ${rel.targetReferenceId}"`, { relationship: rel });
        switchInspectorTab("relationship");
        renderRelationshipInspector();

        // Highlight this edge in SVG visually
        svg.querySelectorAll(".graph-link").forEach(l => l.classList.add("faded"));
        pathEl.classList.remove("faded");
        pathEl.style.strokeWidth = "4px";
      };

      if (activeRefId) {
        if (rel.id === selectedRelationship?.id) {
          pathEl.style.strokeWidth = "4px";
          pathEl.setAttribute("marker-end", "url(#arrow-selected)");
        } else if (outboundRelIds.has(rel.id)) {
          pathEl.classList.add("outbound");
          pathEl.setAttribute("marker-end", "url(#arrow-outbound)");
        } else if (inboundRelIds.has(rel.id)) {
          pathEl.classList.add("inbound");
          pathEl.setAttribute("marker-end", "url(#arrow-inbound)");
        } else {
          pathEl.classList.add("faded");
        }
      } else {
        if (rel.id === selectedRelationship?.id) {
          pathEl.style.strokeWidth = "4px";
          pathEl.setAttribute("marker-end", "url(#arrow-selected)");
        }
      }
      svg.appendChild(pathEl);
    });

    // Render References (nodes)
    visibleNodes.forEach(ref => {
      const coord = nodeCoords[ref.id];
      if (!coord) return;

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "graph-node");
      g.setAttribute("transform", `translate(${coord.x}, ${coord.y})`);
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `Node ${ref.id}: ${ref.title}`);

      if (activeRefId) {
        if (ref.id === activeRefId) {
          g.classList.add("selected");
        } else if (outboundNodeIds.has(ref.id)) {
          g.classList.add("outbound");
        } else if (inboundNodeIds.has(ref.id)) {
          g.classList.add("inbound");
        } else {
          g.classList.add("faded");
        }
      }

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.textContent = ref.id;
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("y", 22);

      g.appendChild(circle);
      g.appendChild(text);

      g.onclick = (e) => {
        e.stopPropagation();
        addTrailEvent("Graph node selected", `Selected graph node "${ref.id}"`, { referenceId: ref.id });
        toggleSelection(ref.id);
      };

      g.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          addTrailEvent("Graph node selected", `Selected graph node "${ref.id}" via keyboard`, { referenceId: ref.id });
          toggleSelection(ref.id);
        }
      };

      svg.appendChild(g);
    });
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
          toggleSelection(id);
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
        toggleSelection(refId);
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
      if (recentReferences.length === 0) {
        recentList.innerHTML = `<li class="nv-muted" style="font-size: var(--sys-font-caption-size); padding: 4px;">No recently viewed references.</li>`;
      } else {
        recentList.innerHTML = recentReferences.map(id => {
          const ref = adapter.getReferenceById(retrievalState, id);
          const title = ref ? ref.title : id;
          return `
            <li class="memory-item" data-ref-id="${id}" title="${title}">
              <span>${id}</span>
              <span class="nv-muted" style="font-size: 0.6rem; text-align: right; overflow: hidden; text-overflow: ellipsis;">${ref ? ref.type : ''}</span>
            </li>
          `;
        }).join("");

        recentList.querySelectorAll(".memory-item").forEach(item => {
          item.onclick = () => {
            const id = item.getAttribute("data-ref-id");
            toggleSelection(id);
          };
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
            <li class="memory-item" data-ref-id="${id}" title="${title}">
              <span>📌 ${id}</span>
              <button class="memory-action-btn" data-action="unpin" data-id="${id}" aria-label="Unpin ${id}">×</button>
            </li>
          `;
        }).join("");

        pinnedList.querySelectorAll(".memory-item").forEach(item => {
          item.onclick = (e) => {
            if (e.target.tagName.toLowerCase() === 'button' || e.target.classList.contains('memory-action-btn')) return;
            const id = item.getAttribute("data-ref-id");
            toggleSelection(id);
          };
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
          <li class="memory-item" data-query="${q}">
            <span>🔍 "${q}"</span>
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
            <li class="trail-event" data-event-id="${event.id}">
              <div class="trail-meta">
                <span class="nv-badge" data-variant="${badgeVariant}" style="font-size: 0.5rem; padding: 1px 4px; text-transform: uppercase;">${event.type}</span>
                <span>${event.timestamp}</span>
              </div>
              <div style="margin-top: 2px; line-height: 1.3;">${event.label}</div>
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
        });
      }
    }
  }

  // Bind Selection Clicks to Reference Cards
  function bindSelectionClicks(containerElement) {
    if (!containerElement) return;

    const cards = containerElement.querySelectorAll(".nv-card");
    cards.forEach(card => {
      card.onclick = () => {
        const refId = card.getAttribute("data-ref-id");
        toggleSelection(refId);
      };

      // Keyboard navigation support
      card.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const refId = card.getAttribute("data-ref-id");
          toggleSelection(refId);
        }
      };
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
    activeExplorationMode = mode;
    saveWorkspaceState();

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
  }

  // Helper to execute and record a search query
  function runSearch(query, isRerun = false) {
    currentSearchQuery = query;
    console.log(`Searching references for: ${query}`);

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
        searchFeedback.textContent = `Query: "${query}" | Hits: ${currentSearchResults.length}`;
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

  // Initialize workspace controls
  function initPlayground() {
    console.log("Initializing Retrieval Workspace (NV-500)...");
    loadWorkspaceState();

    const searchInput = document.getElementById("playground-search-input");
    const searchBtn = document.getElementById("playground-search-button");
    const saveQueryBtn = document.getElementById("playground-save-query-button");
    const compileQueryBtn = document.getElementById("playground-compile-query-button");
    const searchFeedback = document.getElementById("playground-search-feedback");
    const clearSessionBtn = document.getElementById("playground-clear-session-button");
    const clearTrailBtn = document.getElementById("playground-clear-trail-button");

    // Silently perform the search for the restored query if non-empty
    if (currentSearchQuery) {
      currentSearchResults = adapter.searchReferences(retrievalState, currentSearchQuery);
      if (searchInput) searchInput.value = currentSearchQuery;
      if (searchFeedback) {
        searchFeedback.textContent = `Query: "${currentSearchQuery}" | Hits: ${currentSearchResults.length}`;
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

    // Bind switchable tab clicks
    const exploreTabs = document.querySelectorAll(".workspace-tab");
    exploreTabs.forEach(tab => {
      tab.onclick = () => {
        const mode = tab.getAttribute("data-mode");
        switchExplorationMode(mode);
      };
    });

    const inspTabs = document.querySelectorAll(".inspector-tab");
    inspTabs.forEach(tab => {
      tab.onclick = () => {
        const t = tab.getAttribute("data-tab");
        switchInspectorTab(t);
      };
    });

    if (searchInput) {
      // Support Enter key for search
      searchInput.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (searchBtn) searchBtn.click();
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
        const query = searchInput ? searchInput.value : "";
        console.log(`Compiling evidence from query: ${query}`);
        currentCompiledEvidence = adapter.compileEvidenceFromQuery(retrievalState, query);
        if (currentCompiledEvidence) {
          addToTimeline(currentCompiledEvidence);
        }
        addTrailEvent("compile_query", `Compiled evidence from query "${query}"`, { query });
        switchInspectorTab("evidence");
        renderEvidence(currentCompiledEvidence);
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

        if (searchFeedback) searchFeedback.textContent = "No active query.";
        if (saveQueryBtn) saveQueryBtn.disabled = true;

        console.log("Session cleared.");
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
  }

  // Subscribe to navigation route changes
  if (window.navigationState) {
    window.navigationState.subscribe((state) => {
      if (state.currentRoute?.id === "retrieval-playground") {
        setTimeout(() => {
          initPlayground();
        }, 50);
      }
    });
  }

  // Expose module globally
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.retrievalPlayground = {
    initPlayground,
    toggleSelection,
    retrievalState
  };
})();
