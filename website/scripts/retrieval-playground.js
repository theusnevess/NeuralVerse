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

  // Persistence State
  let pinnedReferences = [];
  let recentReferences = [];
  let savedQueries = [];
  let activeExplorationMode = "search";
  let activeInspectorTab = "reference";

  // Load state from localStorage
  function loadWorkspaceState() {
    try {
      pinnedReferences = JSON.parse(localStorage.getItem("nv_pinned_references") || "[]");
      recentReferences = JSON.parse(localStorage.getItem("nv_recent_references") || "[]");
      savedQueries = JSON.parse(localStorage.getItem("nv_saved_queries") || "[]");
      selectedReferenceId = localStorage.getItem("nv_selected_ref_id") || null;
      currentSearchQuery = localStorage.getItem("nv_search_query") || "";
      activeExplorationMode = localStorage.getItem("nv_exploration_mode") || "search";
      activeInspectorTab = localStorage.getItem("nv_inspector_tab") || "reference";
    } catch (e) {
      console.warn("Failed to load workspace state from localStorage", e);
    }
  }

  // Save state to localStorage
  function saveWorkspaceState() {
    try {
      localStorage.setItem("nv_pinned_references", JSON.stringify(pinnedReferences));
      localStorage.setItem("nv_recent_references", JSON.stringify(recentReferences));
      localStorage.setItem("nv_saved_queries", JSON.stringify(savedQueries));
      if (selectedReferenceId) {
        localStorage.setItem("nv_selected_ref_id", selectedReferenceId);
      } else {
        localStorage.removeItem("nv_selected_ref_id");
      }
      localStorage.setItem("nv_search_query", currentSearchQuery);
      localStorage.setItem("nv_exploration_mode", activeExplorationMode);
      localStorage.setItem("nv_inspector_tab", activeInspectorTab);
    } catch (e) {
      console.warn("Failed to save workspace state to localStorage", e);
    }
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
        switchInspectorTab("evidence");
        renderEvidence(currentCompiledEvidence);
      };
    }
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
      </div>
    `;
  }

  // DOM Rendering: Evidence Compiler output (Evidence Inspector Panel)
  function renderEvidence(comp) {
    const container = document.getElementById("evidence-compilation-container");
    if (!container) return;

    if (!comp) {
      container.innerHTML = `
        <div class="nv-empty-state">
          <div class="nv-empty-state-icon" aria-hidden="true">📋</div>
          <p class="nv-muted" style="font-size: var(--sys-font-body-size); font-weight: var(--ref-font-weight-medium); color: var(--sys-color-text-primary); margin-bottom: var(--sys-space-stack-xs);">No Evidence Compiled</p>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">Compile from search queries or references using the buttons provided.</p>
        </div>
      `;
      return;
    }

    const badgeVariant = comp.confidence === 'high' ? 'success' : (comp.confidence === 'medium' ? 'info' : 'warning');
    const stars = comp.confidence === 'high' ? '★★★' : (comp.confidence === 'medium' ? '★★☆' : '★☆☆');

    container.innerHTML = `
      <div class="nv-stack nv-stack--gap-sm" role="region" aria-label="Evidence compilation details">
        <h4 style="margin: 0; font-size: var(--sys-font-body-size); color: var(--sys-color-text-primary);">
          Job ID: <span style="font-family: var(--sys-font-code-family);">${comp.id}</span>
        </h4>
        <span class="nv-badge" data-variant="${badgeVariant}">
          Confidence: ${comp.confidence.toUpperCase()} ${stars}
        </span>

        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.4;"></div>

        <div class="nv-stack nv-stack--gap-xs">
          <h5 style="margin: 0; font-size: 0.65rem; color: var(--sys-color-accent-primary);">Primary Sources (${comp.matchedReferences.length})</h5>
          ${comp.matchedReferences.length === 0 ? '<p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">None.</p>' : comp.matchedReferences.map(r => `
            <div class="nv-cluster nv-cluster--gap-xs" style="align-items: center; justify-content: space-between; margin-bottom: 2px;">
              <span style="font-size: var(--sys-font-caption-size); font-family: var(--sys-font-code-family); color: var(--sys-color-text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; flex: 1;">${r.id}</span>
              <button class="nv-button" data-action="select-source" data-id="${r.id}" style="padding: 1px 4px; min-block-size: unset; font-size: 0.6rem;">Select</button>
            </div>
          `).join("")}
        </div>

        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.4;"></div>

        <div class="nv-stack nv-stack--gap-xs">
          <h5 style="margin: 0; font-size: 0.65rem; color: var(--sys-color-accent-primary);">Neighbors (${comp.relatedReferences.length})</h5>
          ${comp.relatedReferences.length === 0 ? '<p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">None.</p>' : comp.relatedReferences.map(r => `
            <div class="nv-cluster nv-cluster--gap-xs" style="align-items: center; justify-content: space-between; margin-bottom: 2px;">
              <span style="font-size: var(--sys-font-caption-size); font-family: var(--sys-font-code-family); color: var(--sys-color-text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; flex: 1;">${r.id}</span>
              <button class="nv-button" data-action="select-source" data-id="${r.id}" style="padding: 1px 4px; min-block-size: unset; font-size: 0.6rem;">Select</button>
            </div>
          `).join("")}
        </div>

        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.4;"></div>

        <div class="research-assistant-box" style="margin-top: 0;">
          <div class="research-assistant-header" style="font-size: 0.65rem;">
            🤖 Synthesis Insight
          </div>
          <p class="research-assistant-text" style="font-size: 0.75rem;">"${comp.summary}"</p>
        </div>
      </div>
    `;

    // Bind selection buttons inside evidence inspector
    container.querySelectorAll("button[data-action='select-source']").forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-id");
        toggleSelection(id);
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

    const width = svg.clientWidth || 600;
    const height = svg.clientHeight || 480;

    const refs = retrievalState.references.filter(r => r.status === "active");
    const rels = retrievalState.relationships;

    if (refs.length === 0) return;

    // Layout calculation: Circular arrangement
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.35;
    const nodeCoords = {};

    refs.forEach((ref, idx) => {
      const angle = (idx * 2 * Math.PI) / refs.length;
      nodeCoords[ref.id] = {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      };
    });

    // Determine direction-aware highlighting state
    const activeRefId = selectedReferenceId;
    const outboundNodeIds = new Set();
    const inboundNodeIds = new Set();
    const outboundRelIds = new Set();
    const inboundRelIds = new Set();

    if (activeRefId) {
      rels.forEach(rel => {
        if (rel.sourceReferenceId === activeRefId) {
          outboundNodeIds.add(rel.targetReferenceId);
          outboundRelIds.add(rel.id);
        } else if (rel.targetReferenceId === activeRefId) {
          inboundNodeIds.add(rel.sourceReferenceId);
          inboundRelIds.add(rel.id);
        }
      });
    }

    // Render Relationships (links)
    rels.forEach(rel => {
      const src = nodeCoords[rel.sourceReferenceId];
      const tgt = nodeCoords[rel.targetReferenceId];
      if (!src || !tgt) return;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", src.x);
      line.setAttribute("y1", src.y);
      line.setAttribute("x2", tgt.x);
      line.setAttribute("y2", tgt.y);
      line.setAttribute("class", "graph-link");

      // Default marker
      line.setAttribute("marker-end", "url(#arrow-default)");

      // Click link selects relationship
      line.style.cursor = "pointer";
      line.onclick = (e) => {
        e.stopPropagation();
        selectedRelationship = rel;
        switchInspectorTab("relationship");
        renderRelationshipInspector();
      };

      if (activeRefId) {
        if (outboundRelIds.has(rel.id)) {
          line.classList.add("outbound");
          line.setAttribute("marker-end", "url(#arrow-outbound)");
        } else if (inboundRelIds.has(rel.id)) {
          line.classList.add("inbound");
          line.setAttribute("marker-end", "url(#arrow-inbound)");
        } else {
          line.classList.add("faded");
        }
      }
      svg.appendChild(line);
    });

    // Render References (nodes)
    refs.forEach(ref => {
      const coord = nodeCoords[ref.id];
      if (!coord) return;

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "graph-node");
      g.setAttribute("transform", `translate(${coord.x}, ${coord.y})`);

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
        toggleSelection(ref.id);
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

  // DOM Rendering: Memory Layer (Recent, Pinned, Queries)
  function renderMemoryLayer() {
    const recentList = document.getElementById("memory-recent-list");
    const pinnedList = document.getElementById("memory-pinned-list");
    const queriesList = document.getElementById("memory-queries-list");

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
              <button class="nv-button" data-action="unpin" data-id="${id}" style="padding: 1px 4px; min-block-size: unset; font-size: 0.6rem; line-height: 1;" aria-label="Unpin ${id}">×</button>
            </li>
          `;
        }).join("");

        pinnedList.querySelectorAll(".memory-item").forEach(item => {
          item.onclick = () => {
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
            <button class="nv-button" data-action="delete-query" data-query="${q}" style="padding: 1px 4px; min-block-size: unset; font-size: 0.6rem; line-height: 1;" aria-label="Delete query ${q}">×</button>
          </li>
        `).join("");

        queriesList.querySelectorAll(".memory-item").forEach(item => {
          item.onclick = () => {
            const query = item.getAttribute("data-query");
            const searchInput = document.getElementById("playground-search-input");
            if (searchInput) searchInput.value = query;
            const searchBtn = document.getElementById("playground-search-button");
            if (searchBtn) searchBtn.click();
          };
        });

        queriesList.querySelectorAll("button[data-action='delete-query']").forEach(btn => {
          btn.onclick = (e) => {
            e.stopPropagation();
            const query = btn.getAttribute("data-query");
            savedQueries = savedQueries.filter(q => q !== query);
            saveWorkspaceState();
            renderMemoryLayer();
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
    if (recentReferences.length > 5) {
      recentReferences.pop();
    }
    saveWorkspaceState();
    renderMemoryLayer();
  }

  // Pin / Unpin active reference
  function pinReference(refId) {
    if (!refId) return;
    if (!pinnedReferences.includes(refId)) {
      pinnedReferences.push(refId);
      saveWorkspaceState();
      renderMemoryLayer();
      renderReferenceInspector();
    }
  }

  function unpinReference(refId) {
    if (!refId) return;
    pinnedReferences = pinnedReferences.filter(id => id !== refId);
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

  // Initialize workspace controls
  function initPlayground() {
    console.log("Initializing Retrieval Workspace (NV-500)...");
    loadWorkspaceState();

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

    // Controls bindings
    const searchInput = document.getElementById("playground-search-input");
    const searchBtn = document.getElementById("playground-search-button");
    const compileQueryBtn = document.getElementById("playground-compile-query-button");
    const searchFeedback = document.getElementById("playground-search-feedback");

    if (searchInput) {
      searchInput.value = currentSearchQuery;
      // Support Enter key for search
      searchInput.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (searchBtn) searchBtn.click();
        }
      };
    }

    if (searchBtn) {
      searchBtn.onclick = () => {
        const query = searchInput ? searchInput.value : "";
        currentSearchQuery = query;
        console.log(`Searching references for: ${query}`);

        currentSearchResults = adapter.searchReferences(retrievalState, query);
        renderSearchResults();

        // Clear stale evidence compilation on search change
        currentCompiledEvidence = null;
        renderEvidence(null);

        // Update Search Feedback text
        if (searchFeedback) {
          if (!query || query.trim() === "") {
            searchFeedback.textContent = "No active query.";
          } else {
            searchFeedback.textContent = `Query: "${query}" | Hits: ${currentSearchResults.length}`;
          }
        }

        // Add to Saved Queries / Search History
        if (query && query.trim() !== "") {
          const trimmedQuery = query.trim();
          if (!savedQueries.includes(trimmedQuery)) {
            savedQueries.unshift(trimmedQuery);
            if (savedQueries.length > 5) {
              savedQueries.pop();
            }
            saveWorkspaceState();
            renderMemoryLayer();
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
      };
    }

    if (compileQueryBtn) {
      compileQueryBtn.onclick = () => {
        const query = searchInput ? searchInput.value : "";
        console.log(`Compiling evidence from query: ${query}`);
        currentCompiledEvidence = adapter.compileEvidenceFromQuery(retrievalState, query);
        switchInspectorTab("evidence");
        renderEvidence(currentCompiledEvidence);
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
