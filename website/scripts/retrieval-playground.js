/**
 * NeuralVerse - Retrieval Playground Controller
 */
(function () {
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

  function compileEvidence(query) {
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

  function renderReferences() {
    const listContainer = document.getElementById("seeded-references-list");
    if (!listContainer) return;

    listContainer.innerHTML = references.map(ref => `
      <div class="nv-card">
        <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: var(--sys-font-body-size); color: var(--sys-color-text-primary);">${ref.title}</h3>
          <span class="nv-badge" data-variant="${ref.status === 'active' ? 'success' : 'neutral'}">${ref.status}</span>
        </div>
        <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin-block: var(--sys-space-stack-xs) 0;">
          <strong>ID:</strong> ${ref.id}<br>
          <strong>Type:</strong> ${ref.type}<br>
          <strong>Source:</strong> <a href="${ref.source}" target="_blank" style="color: var(--sys-color-primary); text-decoration: none;">${ref.source}</a>
        </p>
      </div>
    `).join("");
  }

  function renderSearchResults(results) {
    const container = document.getElementById("search-results-container");
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="nv-card" style="text-align: center; padding: var(--sys-space-stack-md);">
          <p class="nv-muted">No references found.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = results.map(res => `
      <div class="nv-card" style="margin-bottom: var(--sys-space-stack-xs);">
        <h4 style="margin: 0; font-size: var(--sys-font-body-size);">${res.reference.title}</h4>
        <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin-block: var(--sys-space-stack-xs) 0;">
          <strong>ID:</strong> ${res.reference.id} | <strong>Type:</strong> ${res.reference.type}<br>
          <strong>Score:</strong> ${res.score} | <strong>Matched:</strong> [${res.matchedKeywords.join(", ")}]
        </p>
      </div>
    `).join("");
  }

  function renderRelationships(rels) {
    const container = document.getElementById("relationships-container");
    if (!container) return;

    if (rels.length === 0) {
      container.innerHTML = `
        <div class="nv-card" style="text-align: center; padding: var(--sys-space-stack-md);">
          <p class="nv-muted">No direct relationships found for matches.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = rels.map(rel => `
      <div class="nv-card" style="margin-bottom: var(--sys-space-stack-xs);">
        <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between; align-items: center;">
          <span style="font-family: var(--sys-font-code-family); font-size: var(--sys-font-caption-size);">
            ${rel.sourceReferenceId} ➔ <strong>${rel.type}</strong> ➔ ${rel.targetReferenceId}
          </span>
          <span class="nv-badge" data-variant="info">Strength: ${rel.strength}</span>
        </div>
        ${rel.context ? `<p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: var(--sys-space-stack-xs) 0 0 0;">Context: ${rel.context}</p>` : ""}
      </div>
    `).join("");
  }

  function renderEvidence(comp) {
    const container = document.getElementById("evidence-compilation-container");
    if (!container) return;

    if (!comp) {
      container.innerHTML = `
        <div class="nv-empty-state">
          <div class="nv-empty-state-icon" aria-hidden="true">📋</div>
          <h2 class="nv-empty-state-title">No Compiled Evidence</h2>
          <p class="nv-empty-state-description">
            Click "Compile Evidence" to generate a consolidated evidence summary from the current search query.
          </p>
        </div>
      `;
      return;
    }

    const variant = comp.confidence === 'high' ? 'success' : (comp.confidence === 'medium' ? 'info' : 'warning');

    container.innerHTML = `
      <div class="nv-stack nv-stack--gap-sm">
        <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between; align-items: center;">
          <h4 style="margin: 0;">Compilation ID: <span style="font-family: var(--sys-font-code-family);">${comp.id}</span></h4>
          <span class="nv-badge" data-variant="${variant}">Confidence: ${comp.confidence.toUpperCase()}</span>
        </div>

        <div class="nv-grid nv-grid--cols-3" style="gap: var(--sys-space-stack-sm);">
          <div class="nv-card">
            <h5 style="margin: 0 0 var(--sys-space-stack-xs) 0;">Matched References</h5>
            ${comp.matchedReferences.length === 0 ? '<p class="nv-muted">None</p>' : comp.matchedReferences.map(r => `<div style="font-size: var(--sys-font-caption-size);">• ${r.id}</div>`).join("")}
          </div>
          <div class="nv-card">
            <h5 style="margin: 0 0 var(--sys-space-stack-xs) 0;">Related References</h5>
            ${comp.relatedReferences.length === 0 ? '<p class="nv-muted">None</p>' : comp.relatedReferences.map(r => `<div style="font-size: var(--sys-font-caption-size);">• ${r.id}</div>`).join("")}
          </div>
          <div class="nv-card">
            <h5 style="margin: 0 0 var(--sys-space-stack-xs) 0;">Traversed Relations</h5>
            ${comp.relationships.length === 0 ? '<p class="nv-muted">None</p>' : comp.relationships.map(rel => `<div style="font-size: var(--sys-font-caption-size);">• ${rel.sourceReferenceId} ➔ ${rel.targetReferenceId}</div>`).join("")}
          </div>
        </div>

        <div class="nv-panel" style="border-left: 4px solid var(--sys-color-primary);">
          <h5 style="margin: 0 0 var(--sys-space-stack-xs) 0;">Summary</h5>
          <p style="margin: 0; font-style: italic; line-height: 1.5; font-size: var(--sys-font-body-size);">"${comp.summary}"</p>
        </div>
      </div>
    `;
  }

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

  function initPlayground() {
    console.log("Initializing Retrieval Playground...");
    renderReferences();
    updateWorkspaceState();

    const searchInput = document.getElementById("playground-search-input");
    const searchBtn = document.getElementById("playground-search-button");
    const compileBtn = document.getElementById("playground-compile-button");

    if (!searchBtn || !compileBtn) return;

    searchBtn.onclick = () => {
      const query = searchInput ? searchInput.value : "";
      console.log(`Searching for: ${query}`);
      const results = searchReferences(query);
      renderSearchResults(results);

      const matchedIds = results.map(res => res.reference.id);
      const rels = getRelationshipsForReferences(matchedIds);
      renderRelationships(rels);
    };

    compileBtn.onclick = () => {
      const query = searchInput ? searchInput.value : "";
      console.log(`Compiling evidence for: ${query}`);
      const comp = compileEvidence(query);
      renderEvidence(comp);
    };
  }

  if (window.navigationState) {
    window.navigationState.subscribe((state) => {
      if (state.currentRoute?.id === "retrieval-playground") {
        setTimeout(() => {
          initPlayground();
        }, 50);
      }
    });
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.retrievalPlayground = {
    searchReferences,
    getRelationshipsForReferences,
    compileEvidence,
    initPlayground
  };
})();
