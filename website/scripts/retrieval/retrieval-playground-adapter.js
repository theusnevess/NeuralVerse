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
    },
    {
      id: "paper-vit",
      title: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale (ViT)",
      type: "paper",
      status: "active",
      source: "https://arxiv.org/abs/2010.11929",
      keywords: ["vit", "vision", "transformer", "attention", "classification"]
    },
    {
      id: "paper-gpt3",
      title: "Language Models are Few-Shot Learners (GPT-3)",
      type: "paper",
      status: "active",
      source: "https://arxiv.org/abs/2005.14165",
      keywords: ["gpt-3", "gpt", "few-shot", "llm", "transformer"]
    },
    {
      id: "notes-agent-reasoning",
      title: "LLM Agent Tool Use and Reasoning Patterns",
      type: "notes",
      status: "active",
      source: "local://notes/agent-reasoning",
      keywords: ["agent", "tool-use", "reasoning", "notes", "act"]
    },
    {
      id: "paper-llama",
      title: "LLaMA: Open and Efficient Foundation Language Models",
      type: "paper",
      status: "active",
      source: "https://arxiv.org/abs/2302.13971",
      keywords: ["llama", "llm", "efficient", "transformer", "open-source"]
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
      id: "rel-transformer-bert-bidirectional",
      sourceReferenceId: "paper-transformer",
      targetReferenceId: "paper-bert",
      type: "related",
      context: "Both models share the foundational self-attention mechanisms and are frequently compared in NLP benchmarks.",
      strength: 0.75
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
    },
    {
      id: "rel-vit-transformer",
      sourceReferenceId: "paper-vit",
      targetReferenceId: "paper-transformer",
      type: "cites",
      context: "Adapts the standard NLP transformer structure to operate directly on flattened patches of images.",
      strength: 0.92
    },
    {
      id: "rel-vit-pytorch",
      sourceReferenceId: "paper-vit",
      targetReferenceId: "repo-pytorch",
      type: "implements",
      context: "Implemented using PyTorch library components for modeling and attention calculation.",
      strength: 0.87
    },
    {
      id: "rel-gpt3-transformer",
      sourceReferenceId: "paper-gpt3",
      targetReferenceId: "paper-transformer",
      type: "cites",
      context: "Leverages the autoregressive decoder portion of the original transformer structure.",
      strength: 0.94
    },
    {
      id: "rel-llama-transformer",
      sourceReferenceId: "paper-llama",
      targetReferenceId: "paper-transformer",
      type: "cites",
      context: "Implements the standard decoder-only transformer architecture with optimization variations.",
      strength: 0.93
    },
    {
      id: "rel-agent-gpt3",
      sourceReferenceId: "notes-agent-reasoning",
      targetReferenceId: "paper-gpt3",
      type: "uses",
      context: "Uses GPT-3 as the underlying reasoning engine for few-shot prompt execution.",
      strength: 0.85
    },
    {
      id: "rel-agent-llama",
      sourceReferenceId: "notes-agent-reasoning",
      targetReferenceId: "paper-llama",
      type: "uses",
      context: "Tests tool-use capabilities using open weights LLaMA models locally.",
      strength: 0.82
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

  function getRelatedReferencesFromRels(state, relationships, excludedReferenceIds = []) {
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

  function getRelatedReferences(state, referenceId) {
    if (!referenceId) return [];
    const seed = getReferenceById(state, referenceId);
    if (!seed) return [];

    const related = [];
    const addedIds = new Set([referenceId]);

    // 1. Direct relationships (sorted by strength descending)
    const rels = getRelationshipsForReference(state, referenceId);
    rels.sort((a, b) => (b.strength || 0) - (a.strength || 0));

    for (const rel of rels) {
      const otherId = rel.sourceReferenceId === referenceId ? rel.targetReferenceId : rel.sourceReferenceId;
      if (!addedIds.has(otherId)) {
        const ref = getReferenceById(state, otherId);
        if (ref && ref.status === "active") {
          related.push({
            reference: ref,
            reason: `Direct relationship (${rel.type})`,
            relType: rel.type,
            strength: rel.strength,
            type: "direct"
          });
          addedIds.add(otherId);
        }
      }
    }

    // 2. Shared keywords (sorted by number of shared keywords descending)
    const seedKeywords = seed.keywords.map(normalizeKeyword);
    const similar = [];
    for (const ref of state.references) {
      if (ref.id === referenceId || ref.status !== "active" || addedIds.has(ref.id)) continue;
      const shared = ref.keywords.filter(k => seedKeywords.includes(normalizeKeyword(k)));
      if (shared.length > 0) {
        similar.push({
          reference: ref,
          sharedCount: shared.length,
          sharedKeywords: shared
        });
      }
    }
    similar.sort((a, b) => b.sharedCount - a.sharedCount || a.reference.id.localeCompare(b.reference.id));
    for (const s of similar) {
      related.push({
        reference: s.reference,
        reason: `Shared keywords: ${s.sharedKeywords.slice(0, 3).join(", ")}`,
        relType: null,
        strength: 0.5 + (s.sharedCount * 0.1),
        type: "similar"
      });
      addedIds.add(s.reference.id);
    }

    return related;
  }

  function getSimilarReferences(state, referenceId) {
    if (!referenceId) return [];
    const seed = getReferenceById(state, referenceId);
    if (!seed) return [];
    const seedKeywords = seed.keywords.map(normalizeKeyword);

    const similar = [];
    for (const ref of state.references) {
      if (ref.id === referenceId || ref.status !== "active") continue;
      const shared = ref.keywords.filter(k => seedKeywords.includes(normalizeKeyword(k)));
      if (shared.length > 0) {
        similar.push({
          reference: ref,
          reason: `Similar keywords: ${shared.slice(0, 3).join(", ")}`,
          sharedCount: shared.length
        });
      }
    }
    similar.sort((a, b) => b.sharedCount - a.sharedCount || a.reference.id.localeCompare(b.reference.id));
    return similar;
  }

  function getDiscoverySuggestions(state, referenceId, sessionState = {}) {
    if (!referenceId) return { isDeadEnd: true, suggestedQuery: "", suggestions: [] };
    const seed = getReferenceById(state, referenceId);
    if (!seed) return { isDeadEnd: true, suggestedQuery: "", suggestions: [] };

    const suggestions = [];
    const addedIds = new Set([referenceId]);
    const rels = getRelationshipsForReference(state, referenceId);
    const isDeadEnd = rels.length === 0;

    // 1. Related references (up to 2)
    const related = getRelatedReferences(state, referenceId);
    const directSuggestions = related.filter(r => r.type === "direct");
    for (const ds of directSuggestions) {
      if (suggestions.length >= 2) break;
      suggestions.push({
        reference: ds.reference,
        category: "related",
        reason: ds.reason,
        relType: ds.relType
      });
      addedIds.add(ds.reference.id);
    }

    // 2. Similar references (up to 2)
    const similarSuggestions = getSimilarReferences(state, referenceId);
    for (const ss of similarSuggestions) {
      if (suggestions.length >= 4) break;
      if (!addedIds.has(ss.reference.id)) {
        suggestions.push({
          reference: ss.reference,
          category: "similar",
          reason: ss.reason
        });
        addedIds.add(ss.reference.id);
      }
    }

    // 3. Category match fallback (if dead end)
    if (isDeadEnd) {
      for (const ref of state.references) {
        if (suggestions.length >= 5) break;
        if (ref.id !== referenceId && ref.status === "active" && ref.type === seed.type && !addedIds.has(ref.id)) {
          suggestions.push({
            reference: ref,
            category: "similar",
            reason: `Same category: ${ref.type}`
          });
          addedIds.add(ref.id);
        }
      }
    }

    // 4. Continue From Here / session context (up to 2)
    const recents = sessionState.recentReferences || [];
    for (const recentId of recents) {
      if (suggestions.length >= 6) break;
      if (recentId === referenceId) continue;
      const recentRef = getReferenceById(state, recentId);
      if (recentRef && !addedIds.has(recentId)) {
        suggestions.push({
          reference: recentRef,
          category: "continue",
          reason: `Continue exploring from recently viewed reference`
        });
        addedIds.add(recentId);
      }
    }

    // Fallback: suggest query based on keywords
    let suggestedQuery = "";
    if (seed.keywords && seed.keywords.length > 0) {
      suggestedQuery = seed.keywords.slice(0, 2).join(" ");
    }

    return {
      isDeadEnd,
      suggestedQuery,
      suggestions: suggestions.slice(0, 6)
    };
  }

  function getRelationshipNeighborhood(state, referenceId) {
    if (!referenceId) return null;
    const seed = getReferenceById(state, referenceId);
    if (!seed) return null;

    const rels = getRelationshipsForReference(state, referenceId);
    const neighbors = rels.map(rel => {
      const isOutgoing = rel.sourceReferenceId === referenceId;
      const neighborId = isOutgoing ? rel.targetReferenceId : rel.sourceReferenceId;
      const neighbor = getReferenceById(state, neighborId);
      return {
        relationshipId: rel.id,
        neighbor,
        direction: isOutgoing ? "outgoing" : "incoming",
        type: rel.type,
        strength: rel.strength,
        context: rel.context
      };
    });

    return {
      reference: seed,
      neighbors
    };
  }

  function getCitationContinuations(state, referenceId) {
    if (!referenceId) return [];
    const rels = getRelationshipsForReference(state, referenceId);
    const continuations = [];

    for (const rel of rels) {
      let actionLabel = "";
      let desc = "";

      const isOutgoing = rel.sourceReferenceId === referenceId;
      const targetId = isOutgoing ? rel.targetReferenceId : rel.sourceReferenceId;
      const targetRef = getReferenceById(state, targetId);
      if (!targetRef || targetRef.status !== "active") continue;

      const relType = rel.type.toLowerCase();
      if (relType === "cites") {
        actionLabel = "Follow citation";
        desc = `Follow bibliographic reference to ${targetId}`;
      } else if (relType === "referenced-by" || relType === "cited-by") {
        actionLabel = "Follow reference-by";
        desc = `Explore reference that cited this: ${targetId}`;
      } else if (relType === "extends") {
        actionLabel = "Explore extension";
        desc = `Explore extension details on ${targetId}`;
      } else if (relType === "implements") {
        actionLabel = "Explore implementation";
        desc = `Inspect implementation codebase link in ${targetId}`;
      } else if (relType === "supports" || relType === "uses") {
        actionLabel = "Inspect supporting evidence";
        desc = `Analyze supporting utility reference ${targetId}`;
      } else if (relType === "contrasts") {
        actionLabel = "Compare contrast";
        desc = `Compare contrasting findings in ${targetId}`;
      } else {
        actionLabel = `Inspect ${rel.type}`;
        desc = `Investigate relationship with ${targetId}`;
      }

      continuations.push({
        relationshipId: rel.id,
        targetReferenceId: targetId,
        targetTitle: targetRef.title,
        actionLabel,
        description: desc,
        relType: rel.type
      });
    }

    return continuations;
  }

  function compileEvidenceFromQuery(state, query) {
    if (!query || query.trim() === "") {
      return null;
    }

    const searchResults = searchReferences(state, query);
    const matchedReferences = searchResults.map(res => res.reference);
    const matchedIds = matchedReferences.map(r => r.id);

    const relList = getRelationshipsForReferences(state, matchedIds);
    const relatedReferences = getRelatedReferencesFromRels(state, relList, matchedIds);

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
    const relatedReferences = getRelatedReferencesFromRels(state, rels, [referenceId]);

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

  function filterRelationships(relationships, filterType) {
    if (!relationships) return [];
    if (!filterType || filterType === "all") return relationships;
    const type = filterType.toLowerCase();
    return relationships.filter(rel => {
      if (!rel || !rel.type) return false;
      const relType = rel.type.toLowerCase();
      if (type === "cites") return relType === "cites";
      if (type === "supports") return relType === "supports" || relType === "uses";
      if (type === "contrasts") return relType === "contrasts";
      if (type === "implements") return relType === "implements";
      if (type === "depends_on") return relType === "extends" || relType === "depends" || relType === "depends-on";
      if (type === "related") return relType === "related" || (!["cites", "supports", "uses", "contrasts", "implements", "extends", "depends", "depends-on"].includes(relType));
      return false;
    });
  }

  function getNeighborhoodNodesAndEdges(state, selectedId, depth, filteredRels) {
    const activeRefs = state.references.filter(r => r.status === "active");

    // If Full Graph or no selection
    if (depth === "full" || !selectedId) {
      return {
        nodes: activeRefs,
        edges: filteredRels
      };
    }

    const visibleNodeIds = new Set([selectedId]);
    const visibleEdges = [];

    // Find 1-Hop neighbors
    const hop1Rels = filteredRels.filter(rel => rel.sourceReferenceId === selectedId || rel.targetReferenceId === selectedId);
    for (const rel of hop1Rels) {
      visibleNodeIds.add(rel.sourceReferenceId);
      visibleNodeIds.add(rel.targetReferenceId);
      visibleEdges.push(rel);
    }

    if (depth === "2-hop") {
      const hop1Nodes = Array.from(visibleNodeIds);
      // Find edges connected to any of the 1-hop nodes
      const hop2Rels = filteredRels.filter(rel => {
        // Exclude already added
        if (visibleEdges.some(e => e.id === rel.id)) return false;
        return hop1Nodes.includes(rel.sourceReferenceId) || hop1Nodes.includes(rel.targetReferenceId);
      });
      for (const rel of hop2Rels) {
        visibleNodeIds.add(rel.sourceReferenceId);
        visibleNodeIds.add(rel.targetReferenceId);
        visibleEdges.push(rel);
      }
    }

    // Filter active nodes list to match visibleNodeIds
    const visibleNodes = activeRefs.filter(ref => visibleNodeIds.has(ref.id));

    return {
      nodes: visibleNodes,
      edges: visibleEdges
    };
  }

  function hashString(value) {
    const text = String(value || "");
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededUnit(value) {
    return (hashString(value) % 10000) / 10000;
  }

  function inferReferenceCluster(ref) {
    const keywords = (ref?.keywords || []).map(normalizeKeyword);
    const title = normalizeKeyword(ref?.title || "");
    const text = `${keywords.join(" ")} ${title}`;

    if (/\b(yolo|detection|real-time|cnn)\b/.test(text)) return "Detection";
    if (/\b(clip|vision|multimodal|vit|classification|image)\b/.test(text)) return "Vision";
    if (/\b(transformer|attention|bert|gpt|llama|llm)\b/.test(text)) return "Transformers";
    if (/\b(nlp|translation|language|pre-training|few-shot)\b/.test(text)) return "Language";
    if (/\b(rag|retrieval|evaluation|context|lineage)\b/.test(text)) return "Evaluation";
    if (/\b(agent|tool-use|reasoning|act)\b/.test(text)) return "Agents";
    if (/\b(pytorch|library|tensor|python|repository|framework)\b/.test(text) || ref?.type === "repository") return "Frameworks";
    if (ref?.type === "notes") return "Notes";
    return "Research";
  }

  function getClusterSummaries(nodes, positions = {}) {
    const clusters = new Map();
    nodes.forEach(node => {
      const name = inferReferenceCluster(node);
      if (!clusters.has(name)) {
        clusters.set(name, { name, nodes: [], x: 0, y: 0, radius: 0 });
      }
      clusters.get(name).nodes.push(node);
    });

    return Array.from(clusters.values()).map(cluster => {
      let totalX = 0;
      let totalY = 0;
      let positioned = 0;

      cluster.nodes.forEach(node => {
        const point = positions[node.id];
        if (!point) return;
        totalX += point.x;
        totalY += point.y;
        positioned += 1;
      });

      cluster.x = positioned ? totalX / positioned : 0;
      cluster.y = positioned ? totalY / positioned : 0;
      cluster.radius = Math.max(54, Math.min(150, 34 + cluster.nodes.length * 18));

      return cluster;
    });
  }

  /**
   * Deterministic, cluster-aware force-directed layout.
   * Runs a fixed relaxation pass and returns stable coordinates.
   *
   * @param {Array} nodes - Array of node objects with .id
   * @param {Array} edges - Array of edge objects with .sourceReferenceId, .targetReferenceId
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @param {string|null} centroidId - Optional node to anchor near center
   * @returns {Object} Map of nodeId -> { x, y }
   */
  function computeForceLayout(nodes, edges, width, height, centroidId) {
    if (nodes.length === 0) return {};
    if (nodes.length === 1) {
      const n = nodes[0];
      return { [n.id]: { x: width / 2, y: height / 2 } };
    }

    const padding = Math.max(48, Math.min(width, height) * 0.1);
    const innerW = Math.max(240, width - padding * 2);
    const innerH = Math.max(240, height - padding * 2);
    const positions = {};
    const cx = width / 2;
    const cy = height / 2;
    const sortedNodes = nodes.slice().sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const clusterNames = Array.from(new Set(sortedNodes.map(inferReferenceCluster))).sort();
    const clusterCenters = {};
    const centerRadiusX = innerW * 0.31;
    const centerRadiusY = innerH * 0.28;

    clusterNames.forEach((name, index) => {
      const angle = (-Math.PI / 2) + (index * 2 * Math.PI) / Math.max(1, clusterNames.length);
      const wobble = (seededUnit(name) - 0.5) * 0.32;
      clusterCenters[name] = {
        x: cx + Math.cos(angle + wobble) * centerRadiusX,
        y: cy + Math.sin(angle + wobble) * centerRadiusY
      };
    });

    if (centroidId) {
      const centroid = sortedNodes.find(node => node.id === centroidId);
      if (centroid) {
        clusterCenters[inferReferenceCluster(centroid)] = { x: cx, y: cy };
      }
    }

    const clusterIndexes = {};
    sortedNodes.forEach(node => {
      const cluster = inferReferenceCluster(node);
      clusterIndexes[cluster] = clusterIndexes[cluster] || 0;
      const localIndex = clusterIndexes[cluster]++;
      const localAngle = seededUnit(`${node.id}:angle`) * Math.PI * 2;
      const localRadius = 28 + localIndex * 14 + seededUnit(`${node.id}:radius`) * 38;
      const center = clusterCenters[cluster] || { x: cx, y: cy };
      positions[node.id] = {
        x: center.x + Math.cos(localAngle) * localRadius,
        y: center.y + Math.sin(localAngle) * localRadius,
        vx: 0,
        vy: 0,
        cluster
      };
    });

    if (centroidId && positions[centroidId]) {
      positions[centroidId].x = cx;
      positions[centroidId].y = cy;
    }

    const iterations = 110;
    const repulsionStrength = 3600;
    const attractionStrength = 0.012;
    const clusterGravity = 0.018;
    const centerGravity = 0.002;
    const idealEdgeLength = Math.max(86, Math.min(170, Math.min(innerW, innerH) / Math.max(1.8, Math.sqrt(nodes.length) * 0.72)));
    const damping = 0.82;
    const maxVelocity = 10;

    for (let iter = 0; iter < iterations; iter++) {
      const temperature = 1 - (iter / iterations) * 0.76;

      for (let i = 0; i < sortedNodes.length; i++) {
        for (let j = i + 1; j < sortedNodes.length; j++) {
          const a = positions[sortedNodes[i].id];
          const b = positions[sortedNodes[j].id];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1) dist = 1;

          const sameCluster = a.cluster === b.cluster;
          const force = ((sameCluster ? repulsionStrength * 0.62 : repulsionStrength) * temperature) / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }

      edges.forEach(e => {
        const a = positions[e.sourceReferenceId];
        const b = positions[e.targetReferenceId];
        if (!a || !b) return;

        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) dist = 1;

        const strength = typeof e.strength === "number" ? Math.max(0.45, Math.min(1.4, e.strength)) : 1;
        const targetLength = idealEdgeLength * (a.cluster === b.cluster ? 0.82 : 1.12);
        const displacement = dist - targetLength;
        const force = attractionStrength * strength * displacement * temperature;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      });

      sortedNodes.forEach(n => {
        const p = positions[n.id];
        const clusterCenter = clusterCenters[p.cluster] || { x: cx, y: cy };

        p.vx += (clusterCenter.x - p.x) * clusterGravity * temperature;
        p.vy += (clusterCenter.y - p.y) * clusterGravity * temperature;
        p.vx += (cx - p.x) * centerGravity * temperature;
        p.vy += (cy - p.y) * centerGravity * temperature;

        if (n.id === centroidId) {
          p.vx = 0;
          p.vy = 0;
          return;
        }

        p.vx *= damping;
        p.vy *= damping;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > maxVelocity) {
          p.vx = (p.vx / speed) * maxVelocity;
          p.vy = (p.vy / speed) * maxVelocity;
        }

        p.x += p.vx;
        p.y += p.vy;

        p.x = Math.max(padding, Math.min(width - padding, p.x));
        p.y = Math.max(padding, Math.min(height - padding, p.y));
      });
    }

    // Strip velocity from output
    const result = {};
    for (const id in positions) {
      result[id] = { x: positions[id].x, y: positions[id].y };
    }
    return result;
  }

  /**
   * Compute edge SVG path data, using quadratic bezier curves for
   * bidirectional edge pairs to prevent visual overlap.
   *
   * @param {Array} edges - Visible edges
   * @param {Object} nodeCoords - Map of nodeId -> { x, y }
   * @returns {Array} Array of { edge, pathData, isCurved }
   */
  function computeEdgePaths(edges, nodeCoords) {
    // Build a set of edge pair keys to detect bidirectional connections
    const pairKeys = new Set();
    const bidirectionalPairs = new Set();

    edges.forEach(e => {
      const fwd = `${e.sourceReferenceId}>${e.targetReferenceId}`;
      const rev = `${e.targetReferenceId}>${e.sourceReferenceId}`;

      if (pairKeys.has(rev)) {
        bidirectionalPairs.add(fwd);
        bidirectionalPairs.add(rev);
      }
      pairKeys.add(fwd);
    });

    const curveOffset = 25;

    return edges.map(e => {
      const src = nodeCoords[e.sourceReferenceId];
      const tgt = nodeCoords[e.targetReferenceId];
      if (!src || !tgt) return null;

      const key = `${e.sourceReferenceId}>${e.targetReferenceId}`;
      const isBidirectional = bidirectionalPairs.has(key);

      if (!isBidirectional) {
        // Straight line as simple path
        return {
          edge: e,
          pathData: `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`,
          isCurved: false
        };
      }

      // Compute perpendicular offset for bezier control point
      const mx = (src.x + tgt.x) / 2;
      const my = (src.y + tgt.y) / 2;
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;

      // Perpendicular unit vector
      const px = -dy / len;
      const py = dx / len;

      // Determine offset direction based on source->target ordering
      const isForwardDirection = e.sourceReferenceId < e.targetReferenceId;
      const sign = isForwardDirection ? 1 : -1;

      const cpx = mx + px * curveOffset * sign;
      const cpy = my + py * curveOffset * sign;

      return {
        edge: e,
        pathData: `M ${src.x} ${src.y} Q ${cpx} ${cpy} ${tgt.x} ${tgt.y}`,
        isCurved: true
      };
    }).filter(Boolean);
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
    getSimilarReferences,
    getDiscoverySuggestions,
    getRelationshipNeighborhood,
    getCitationContinuations,
    compileEvidenceFromQuery,
    compileEvidenceFromReference,
    filterRelationships,
    getNeighborhoodNodesAndEdges,
    inferReferenceCluster,
    getClusterSummaries,
    computeForceLayout,
    computeEdgePaths
  };
})();
