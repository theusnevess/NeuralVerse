/**
 * NeuralVerse - Retrieval Playground Adapter
 * Isolates state management, search logic, relationship queries, and evidence compilation.
 */
(function () {
  const references = [
    {
      id: "paper-transformer",
      title: "Attention Is All You Need (Transformer)",
      type: "paper",
      status: "active",
      source: "https://arxiv.org/abs/1706.03762",
      keywords: ["attention", "transformer", "neural network", "nlp", "translation"]
    },
    {
      id: "paper-bert",
      title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
      type: "paper",
      status: "active",
      source: "https://arxiv.org/abs/1810.04805",
      keywords: ["bert", "transformer", "bidirectional", "nlp", "pre-training"]
    },
    {
      id: "repo-pytorch",
      title: "PyTorch Deep Learning Framework Core",
      type: "repository",
      status: "active",
      source: "https://github.com/pytorch/pytorch",
      keywords: ["pytorch", "library", "deep learning", "python", "tensor"]
    },
    {
      id: "paper-clip",
      title: "Learning Transferable Visual Models From Natural Language Supervision (CLIP)",
      type: "paper",
      status: "active",
      source: "https://arxiv.org/abs/2103.00020",
      keywords: ["clip", "vision", "language", "multimodal", "contrastive"]
    },
    {
      id: "paper-yolo",
      title: "You Only Look Once: Unified, Real-Time Object Detection (YOLO)",
      type: "paper",
      status: "active",
      source: "https://arxiv.org/abs/1506.02640",
      keywords: ["yolo", "detection", "vision", "real-time", "cnn"]
    },
    {
      id: "notes-rag-eval",
      title: "RAG Retrieval Context Evaluation Notes",
      type: "notes",
      status: "active",
      source: "local://notes/rag-context-eval",
      keywords: ["rag", "evaluation", "notes", "retrieval", "context"]
    }
  ];

  const relationships = [
    {
      id: "rel-bert-transformer",
      sourceReferenceId: "paper-bert",
      targetReferenceId: "paper-transformer",
      type: "cites",
      context: "Utilizes the core transformer architecture for bidirectional language representations.",
      strength: 0.95
    },
    {
      id: "rel-clip-transformer",
      sourceReferenceId: "paper-clip",
      targetReferenceId: "paper-transformer",
      type: "extends",
      context: "Uses a Vision Transformer (ViT) encoder alongside a Text Transformer encoder.",
      strength: 0.90
    },
    {
      id: "rel-transformer-pytorch",
      sourceReferenceId: "paper-transformer",
      targetReferenceId: "repo-pytorch",
      type: "implements",
      context: "Implements multi-head attention layers and feedforward networks in PyTorch.",
      strength: 0.85
    },
    {
      id: "rel-rag-transformer",
      sourceReferenceId: "notes-rag-eval",
      targetReferenceId: "paper-transformer",
      type: "uses",
      context: "Leverages transformer-based embedding models to calculate document similarities.",
      strength: 0.80
    },
    {
      id: "rel-clip-pytorch",
      sourceReferenceId: "paper-clip",
      targetReferenceId: "repo-pytorch",
      type: "implements",
      context: "Maintained training code and weights hosted using PyTorch hub models.",
      strength: 0.88
    }
  ];

  function createSeededRetrievalState() {
    return {
      references: JSON.parse(JSON.stringify(references)),
      relationships: JSON.parse(JSON.stringify(relationships))
    };
  }

  function normalizeKeyword(value) {
    if (!value) return "";
    return value.trim().toLowerCase();
  }

  function searchReferences(state, query) {
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
    for (const ref of state.references) {
      if (ref.status !== "active") continue;

      const matchedKeywords = [];
      for (const term of queryTerms) {
        const normalizedTerm = normalizeKeyword(term);
        if (ref.keywords.map(normalizeKeyword).includes(normalizedTerm)) {
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

  function getReferenceById(state, referenceId) {
    return state.references.find(r => r.id === referenceId) || null;
  }

  function getRelationshipsForReferences(state, referenceIds) {
    const relList = [];
    const relIds = new Set();
    const idsSet = new Set(referenceIds);

    for (const id of idsSet) {
      for (const rel of state.relationships) {
        if ((rel.sourceReferenceId === id || rel.targetReferenceId === id) && !relIds.has(rel.id)) {
          relList.push(rel);
          relIds.add(rel.id);
        }
      }
    }
    return relList;
  }

  function getRelationshipsForReference(state, referenceId) {
    return state.relationships.filter(r => r.sourceReferenceId === referenceId || r.targetReferenceId === referenceId);
  }

  function getRelatedReferences(state, relationships, excludedReferenceIds = []) {
    const excludedSet = new Set(excludedReferenceIds);
    const relatedMap = new Map();

    for (const rel of relationships) {
      const candidates = [rel.sourceReferenceId, rel.targetReferenceId];
      for (const id of candidates) {
        if (!excludedSet.has(id) && !relatedMap.has(id)) {
          const ref = getReferenceById(state, id);
          if (ref && ref.status === "active") {
            relatedMap.set(id, ref);
          }
        }
      }
    }
    return Array.from(relatedMap.values());
  }

  function compileEvidenceFromQuery(state, query) {
    if (!query || query.trim() === "") {
      return null;
    }

    const searchResults = searchReferences(state, query);
    const matchedReferences = searchResults.map(res => res.reference);
    const matchedIds = matchedReferences.map(r => r.id);

    const relList = getRelationshipsForReferences(state, matchedIds);
    const relatedReferences = getRelatedReferences(state, relList, matchedIds);

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

  function compileEvidenceFromReference(state, referenceId) {
    if (!referenceId) return null;
    const seedRef = getReferenceById(state, referenceId);
    if (!seedRef) return null;

    const rels = getRelationshipsForReference(state, referenceId);
    const relatedReferences = getRelatedReferences(state, rels, [referenceId]);

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

  // Export to namespace
  window.NeuralVerseRetrievalAdapter = {
    createSeededRetrievalState,
    normalizeKeyword,
    searchReferences,
    getReferenceById,
    getRelationshipsForReferences,
    getRelationshipsForReference,
    getRelatedReferences,
    compileEvidenceFromQuery,
    compileEvidenceFromReference
  };
})();
