/**
 * NeuralVerse - Retrieval Playground Controller (Hardened Version)
 */
(function () {
  // Seeded Reference Data
  const references = [
    {
      id: "arxiv-transformer",
      title: "Attention Is All You Need",
      type: "paper",
      status: "active",
      source: "https://arxiv.org/abs/1706.03762",
      keywords: ["attention", "transformer", "neural network", "nlp"]
    },
    {
      id: "arxiv-bert",
      title: "BERT: Bidirectional Transformers",
      type: "paper",
      status: "active",
      source: "https://arxiv.org/abs/1810.04805",
      keywords: ["bert", "transformer", "bidirectional", "nlp"]
    },
    {
      id: "github-pytorch",
      title: "PyTorch Deep Learning Framework",
      type: "repository",
      status: "active",
      source: "https://github.com/pytorch/pytorch",
      keywords: ["pytorch", "library", "deep learning", "python"]
    },
    {
      id: "notes-rag",
      title: "RAG Evaluation Notes",
      type: "notes",
      status: "active",
      source: "local://notes/rag-eval",
      keywords: ["rag", "evaluation", "notes", "retrieval"]
    }
  ];

  // Seeded Relationships
  const relationships = [
    {
      id: "rel-bert-transformer",
      sourceReferenceId: "arxiv-bert",
      targetReferenceId: "arxiv-transformer",
      type: "cites",
      context: "transformer architecture core",
      strength: 0.95
    },
    {
      id: "rel-transformer-pytorch",
      sourceReferenceId: "arxiv-transformer",
      targetReferenceId: "github-pytorch",
      type: "implements",
      context: "pytorch ecosystem models",
      strength: 0.80
    },
    {
      id: "rel-rag-transformer",
      sourceReferenceId: "notes-rag",
      targetReferenceId: "arxiv-transformer",
      type: "extends",
      context: "dense retrieval core component",
      strength: 0.85
    }
  ];

  // UI State
  let selectedReferenceId = null;
  let currentSearchQuery = "";
  let currentSearchResults = [];
  let currentCompiledEvidence = null;

  // Search logic
  function searchReferences(query) {
    if (!query || query.trim() === "") {
      return [];
    }

    const queryTerms = Array.from(
      new Set(
        query
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ")
          .split(" ")
          .filter((t) => t !== "")
      )
    );

    if (queryTerms.length === 0) {
      return [];
    }

    const results = [];
    for (const ref of references) {
      if (ref.status !== "active") continue;

      const matchedKeywords = [];
      for (const term of queryTerms) {
        if (ref.keywords.includes(term)) {
          matchedKeywords.push(term);
        }
      }

      const score = matchedKeywords.length;
      if (score > 0) {
        results.push({
          reference: ref,
          score,
          matchedKeywords
        });
      }
    }

    results.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.reference.id.localeCompare(b.reference.id);
    });

    return results;
  }

  // Get relationships involving specific reference IDs
  function getRelationshipsForReferences(matchedIds) {
    const relList = [];
    const relIds = new Set();

    for (const id of matchedIds) {
      for (const rel of relationships) {
        if ((rel.sourceReferenceId === id || rel.targetReferenceId === id) && !relIds.has(rel.id)) {
          relList.push(rel);
          relIds.add(rel.id);
        }
      }
    }
    return relList;
  }

  // Compile evidence from query
  function compileEvidenceFromQuery(query) {
    if (!query || query.trim() === "") {
      return null;
    }

    const searchResults = searchReferences(query);
    const matchedReferences = searchResults.map(res => res.reference);
    const matchedIds = new Set(matchedReferences.map(r => r.id));

    const relList = getRelationshipsForReferences(matchedIds);
    const relatedReferenceMap = new Map();

    for (const rel of relList) {
      const candidates = [rel.sourceReferenceId, rel.targetReferenceId];
      for (const id of candidates) {
        if (!matchedIds.has(id) && !relatedReferenceMap.has(id)) {
          const ref = references.find(r => r.id === id);
          if (ref && ref.status === "active") {
            relatedReferenceMap.set(id, ref);
          }
        }
      }
    }

    const relatedReferences = Array.from(relatedReferenceMap.values());

    let confidence = "low";
    if (matchedReferences.length >= 2 && relList.length >= 1) {
      confidence = "high";
    } else if (matchedReferences.length >= 1) {
      confidence = "medium";
    }

    let summary = "";
    if (matchedReferences.length === 0) {
      summary = `No evidence was found for the query: "${query}".`;
    } else {
      summary = `Evidence compilation for query "${query}" retrieved ${matchedReferences.length} matched reference(s) and detected ${relList.length} relationship(s) linking to ${relatedReferences.length} related reference(s). Confidence level is assessed as ${confidence}.`;
    }

    return {
      id: `comp-query-${Date.now()}`,
      mode: "query",
      input: query,
      matchedReferences,
      relatedReferences,
      relationships: relList,
      confidence,
      summary,
      createdAt: new Date()
    };
  }

  // Compile evidence from selected reference ID
  function compileEvidenceFromReference(referenceId) {
    if (!referenceId) return null;
    const seedRef = references.find(r => r.id === referenceId);
    if (!seedRef) return null;

    // Find direct relationships
    const rels = relationships.filter(r => r.sourceReferenceId === referenceId || r.targetReferenceId === referenceId);
    const relatedReferenceMap = new Map();

    for (const rel of rels) {
      const targetId = rel.sourceReferenceId === referenceId ? rel.targetReferenceId : rel.sourceReferenceId;
      const ref = references.find(r => r.id === targetId);
      if (ref && ref.status === "active") {
        relatedReferenceMap.set(targetId, ref);
      }
    }

    const relatedReferences = Array.from(relatedReferenceMap.values());

    let confidence = "low";
    if (rels.length >= 2) {
      confidence = "high";
    } else if (rels.length >= 1) {
      confidence = "medium";
    }

    const summary = `Evidence compilation using seed reference "${seedRef.title}" (${seedRef.id}) identified ${rels.length} relationship(s) linking to ${relatedReferences.length} active related reference(s). Confidence level is assessed as ${confidence}.`;

    return {
      id: `comp-ref-${Date.now()}`,
      mode: "reference",
      input: referenceId,
      matchedReferences: [seedRef],
      relatedReferences,
      relationships: rels,
      confidence,
      summary,
      createdAt: new Date()
    };
  }

  // DOM Rendering & Sync
  function renderSeededReferences() {
    const listContainer = document.getElementById("seeded-references-list");
    if (!listContainer) return;

    listContainer.innerHTML = references.map(ref => {
      const isSelected = ref.id === selectedReferenceId;
      return `
        <div class="nv-card ${isSelected ? 'nv-card--selected' : ''}"
             data-ref-id="${ref.id}"
             tabindex="0"
             role="listitem"
             aria-selected="${isSelected ? 'true' : 'false'}"
             aria-label="Reference ${ref.title}">
          <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between; align-items: center;">
            <h4 style="margin: 0; font-size: var(--sys-font-body-size); color: var(--sys-color-text-primary);">${ref.title}</h4>
            <span class="nv-badge" data-variant="${ref.status === 'active' ? 'success' : 'neutral'}">${ref.status}</span>
          </div>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin-block: var(--sys-space-stack-xs) 0; pointer-events: none;">
            <strong>ID:</strong> ${ref.id} | <strong>Type:</strong> ${ref.type}<br>
            <strong>Source:</strong> ${ref.source}
          </p>
        </div>
      `;
    }).join("");

    bindSelectionClicks(listContainer);
  }

  function renderSearchResults() {
    const container = document.getElementById("search-results-container");
    if (!container) return;

    if (!currentSearchQuery || currentSearchQuery.trim() === "") {
      container.innerHTML = `
        <div class="nv-empty-state">
          <div class="nv-empty-state-icon" aria-hidden="true">🔍</div>
          <p class="nv-muted">Search for a topic to see matching references.</p>
        </div>
      `;
      return;
    }

    if (currentSearchResults.length === 0) {
      container.innerHTML = `
        <div class="nv-empty-state">
          <div class="nv-empty-state-icon" aria-hidden="true">⚠️</div>
          <p class="nv-muted">No references matched this query.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = currentSearchResults.map(res => {
      const isSelected = res.reference.id === selectedReferenceId;
      return `
        <div class="nv-card ${isSelected ? 'nv-card--selected' : ''}"
             data-ref-id="${res.reference.id}"
             tabindex="0"
             role="button"
             aria-selected="${isSelected ? 'true' : 'false'}"
             aria-label="Result ${res.reference.title}">
          <h4 style="margin: 0; font-size: var(--sys-font-body-size);">${res.reference.title}</h4>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin-block: var(--sys-space-stack-xs) 0; pointer-events: none;">
            <strong>ID:</strong> ${res.reference.id} | <strong>Score:</strong> ${res.score}<br>
            <strong>Matches:</strong> [${res.matchedKeywords.join(", ")}]
          </p>
        </div>
      `;
    }).join("");

    bindSelectionClicks(container);
  }

  function renderSelectedReference() {
    const container = document.getElementById("selected-reference-container");
    const compileRefBtn = document.getElementById("playground-compile-ref-button");
    if (!container) return;

    if (!selectedReferenceId) {
      container.innerHTML = `
        <div class="nv-empty-state">
          <div class="nv-empty-state-icon" aria-hidden="true">📌</div>
          <p class="nv-muted">Select a reference to inspect its details.</p>
        </div>
      `;
      if (compileRefBtn) compileRefBtn.disabled = true;
      return;
    }

    const ref = references.find(r => r.id === selectedReferenceId);
    if (!ref) {
      container.innerHTML = `
        <div class="nv-empty-state">
          <div class="nv-empty-state-icon" aria-hidden="true">⚠️</div>
          <p class="nv-muted">Selected reference details could not be loaded.</p>
        </div>
      `;
      if (compileRefBtn) compileRefBtn.disabled = true;
      return;
    }

    // Calculate related relationships count
    const relCount = relationships.filter(r => r.sourceReferenceId === ref.id || r.targetReferenceId === ref.id).length;

    container.innerHTML = `
      <div class="nv-card nv-card--selected" style="margin: 0; border: none; background-color: var(--sys-color-surface-container-low) !important;">
        <h4 style="margin: 0; font-size: var(--sys-font-body-size); color: var(--sys-color-text-primary);">${ref.title}</h4>
        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs);"></div>
        <p class="nv-muted" style="font-size: var(--sys-font-caption-size); line-height: 1.6; margin: 0;">
          <strong>Identifier:</strong> <span style="font-family: var(--sys-font-code-family);">${ref.id}</span><br>
          <strong>Type:</strong> ${ref.type}<br>
          <strong>Status:</strong> <span class="nv-badge" data-variant="success">${ref.status}</span><br>
          <strong>Source Path:</strong> <a href="${ref.source}" target="_blank" style="color: var(--sys-color-primary); text-decoration: none;">${ref.source}</a><br>
          <strong>Relationships Count:</strong> ${relCount}
        </p>
      </div>
    `;

    if (compileRefBtn) {
      compileRefBtn.disabled = false;
      compileRefBtn.setAttribute("aria-label", `Compile evidence from ${ref.title}`);
    }
  }

  function renderRelationships() {
    const container = document.getElementById("relationships-container");
    if (!container) return;

    let relList = [];

    if (selectedReferenceId) {
      // Show relationships involving selected reference
      relList = relationships.filter(r => r.sourceReferenceId === selectedReferenceId || r.targetReferenceId === selectedReferenceId);
    } else if (currentSearchResults.length > 0) {
      // Fallback: Show relationships for search results
      const matchedIds = currentSearchResults.map(res => res.reference.id);
      relList = getRelationshipsForReferences(matchedIds);
    }

    if (relList.length === 0) {
      container.innerHTML = `
        <div class="nv-empty-state">
          <div class="nv-empty-state-icon" aria-hidden="true">🔗</div>
          <p class="nv-muted">Select a reference to inspect its relationships.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = relList.map(rel => {
      let directionTag = "";
      if (selectedReferenceId) {
        if (rel.sourceReferenceId === selectedReferenceId) {
          directionTag = `<span class="nv-badge" data-variant="info" style="font-size: 0.65rem;">outgoing</span>`;
        } else if (rel.targetReferenceId === selectedReferenceId) {
          directionTag = `<span class="nv-badge" data-variant="success" style="font-size: 0.65rem;">incoming</span>`;
        }
      }

      return `
        <div class="nv-card" style="margin-bottom: var(--sys-space-stack-xs);">
          <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between; align-items: center;">
            <span style="font-family: var(--sys-font-code-family); font-size: var(--sys-font-caption-size); word-break: break-all;">
              ${rel.sourceReferenceId} ➔ <strong>${rel.type}</strong> ➔ ${rel.targetReferenceId}
            </span>
            ${directionTag}
          </div>
          <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between; align-items: center; margin-top: var(--sys-space-stack-xs);">
            <span class="nv-muted" style="font-size: var(--sys-font-caption-size);">Strength: ${rel.strength}</span>
          </div>
          ${rel.context ? `<p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: var(--sys-space-stack-xs) 0 0 0;">Context: ${rel.context}</p>` : ""}
        </div>
      `;
    }).join("");
  }

  function renderEvidence(comp) {
    const container = document.getElementById("evidence-compilation-container");
    if (!container) return;

    if (!comp) {
      container.innerHTML = `
        <div class="nv-empty-state">
          <div class="nv-empty-state-icon" aria-hidden="true">📋</div>
          <p class="nv-muted">No evidence compilation has been generated yet.</p>
        </div>
      `;
      return;
    }

    const badgeVariant = comp.confidence === 'high' ? 'success' : (comp.confidence === 'medium' ? 'info' : 'warning');

    container.innerHTML = `
      <div class="nv-stack nv-stack--gap-sm" role="region" aria-label="Evidence compilation details">
        <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; font-size: var(--sys-font-body-size);">Compilation ID: <span style="font-family: var(--sys-font-code-family);">${comp.id}</span></h4>
          <span class="nv-badge" data-variant="${badgeVariant}">Confidence: ${comp.confidence.toUpperCase()}</span>
        </div>

        <div class="nv-grid nv-grid--cols-3" style="gap: var(--sys-space-stack-sm);">
          <div class="nv-card" style="margin: 0;">
            <h5 style="margin: 0 0 var(--sys-space-stack-xs) 0;">Matched References</h5>
            ${comp.matchedReferences.length === 0 ? '<p class="nv-muted">None</p>' : comp.matchedReferences.map(r => `
              <div class="nv-cluster nv-cluster--gap-xs" style="align-items: center; justify-content: space-between; margin-bottom: 2px;">
                <span style="font-size: var(--sys-font-caption-size); font-family: var(--sys-font-code-family);">${r.id}</span>
                <button class="nv-button" data-action="select" data-id="${r.id}" style="padding: 2px 6px; font-size: 0.65rem;">Select</button>
              </div>
            `).join("")}
          </div>
          <div class="nv-card" style="margin: 0;">
            <h5 style="margin: 0 0 var(--sys-space-stack-xs) 0;">Related References</h5>
            ${comp.relatedReferences.length === 0 ? '<p class="nv-muted">None</p>' : comp.relatedReferences.map(r => `
              <div class="nv-cluster nv-cluster--gap-xs" style="align-items: center; justify-content: space-between; margin-bottom: 2px;">
                <span style="font-size: var(--sys-font-caption-size); font-family: var(--sys-font-code-family);">${r.id}</span>
                <button class="nv-button" data-action="select" data-id="${r.id}" style="padding: 2px 6px; font-size: 0.65rem;">Select</button>
              </div>
            `).join("")}
          </div>
          <div class="nv-card" style="margin: 0;">
            <h5 style="margin: 0 0 var(--sys-space-stack-xs) 0;">Traversed Relations</h5>
            ${comp.relationships.length === 0 ? '<p class="nv-muted">None</p>' : comp.relationships.map(rel => `
              <div style="font-size: var(--sys-font-caption-size); word-break: break-all; margin-bottom: 2px;">• ${rel.sourceReferenceId} ➔ ${rel.targetReferenceId}</div>
            `).join("")}
          </div>
        </div>

        <div class="nv-panel" style="border-left: 4px solid var(--sys-color-primary); background-color: var(--sys-color-surface-container-low); padding: var(--sys-space-stack-sm);">
          <h5 style="margin: 0 0 var(--sys-space-stack-xs) 0;">Summary</h5>
          <p style="margin: 0; font-style: italic; line-height: 1.5; font-size: var(--sys-font-body-size); color: var(--sys-color-text-primary);">"${comp.summary}"</p>
        </div>
      </div>
    `;

    // Bind selection clicks inside the compilation cards
    const selectButtons = container.querySelectorAll("button[data-action='select']");
    selectButtons.forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const refId = btn.getAttribute("data-id");
        toggleSelection(refId);
      };
    });
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
    }

    // Refresh UI elements concerned with selection
    syncSelectionHighlighting();
    renderSelectedReference();
    renderRelationships();
  }

  // Sync Highlight class across lists
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

  // Update central workspace state if available
  function updateWorkspaceState() {
    const workspace = window.NeuralVerse?.workspace || window.NeuralVerse?.workspaceState;
    if (workspace && typeof workspace.setState === "function") {
      workspace.setState({
        activeView: "retrieval-playground",
        routeId: "retrieval-playground",
        routeTitle: "Retrieval Playground",
        routeDescription: "Explore references, relationships, search results, and evidence compilation.",
        status: "active"
      });
    }
  }

  // Initialize playground controls
  function initPlayground() {
    console.log("Initializing Retrieval Playground (Hardened)...");
    renderSeededReferences();
    renderSearchResults();
    renderSelectedReference();
    renderRelationships();
    renderEvidence(currentCompiledEvidence);
    updateWorkspaceState();

    const searchInput = document.getElementById("playground-search-input");
    const searchBtn = document.getElementById("playground-search-button");
    const compileQueryBtn = document.getElementById("playground-compile-query-button");
    const compileRefBtn = document.getElementById("playground-compile-ref-button");
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

        currentSearchResults = searchReferences(query);
        renderSearchResults();

        // Update Search Feedback
        if (searchFeedback) {
          if (!query || query.trim() === "") {
            searchFeedback.textContent = "No active query.";
          } else {
            searchFeedback.textContent = `Current query: "${query}" | Results found: ${currentSearchResults.length}`;
          }
        }

        // State Reset Behavior: Preserve selected reference only if it still exists in the visible context (seeded references list or current search results)
        // Since seeded references list is always visible, it always exists there if it's one of the seeded references.
        // If not in the list, we clear it.
        if (selectedReferenceId) {
          const exists = references.some(r => r.id === selectedReferenceId) || currentSearchResults.some(res => res.reference.id === selectedReferenceId);
          if (!exists) {
            selectedReferenceId = null;
            renderSelectedReference();
          }
        }

        renderRelationships();
      };
    }

    if (compileQueryBtn) {
      compileQueryBtn.onclick = () => {
        const query = searchInput ? searchInput.value : "";
        console.log(`Compiling evidence from query: ${query}`);
        currentCompiledEvidence = compileEvidenceFromQuery(query);
        renderEvidence(currentCompiledEvidence);
      };
    }

    if (compileRefBtn) {
      compileRefBtn.onclick = () => {
        if (!selectedReferenceId) return;
        console.log(`Compiling evidence from reference: ${selectedReferenceId}`);
        currentCompiledEvidence = compileEvidenceFromReference(selectedReferenceId);
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
    searchReferences,
    getRelationshipsForReferences,
    compileEvidenceFromQuery,
    compileEvidenceFromReference,
    initPlayground,
    toggleSelection,
    references,
    relationships
  };
})();
