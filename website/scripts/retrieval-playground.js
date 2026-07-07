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
  let shouldFitGraphViewport = true;
  let graphLabelMode = "context";
  let graphFocusMode = "follow";
  let richPreviewController = null;
  let contextMenuController = null;
  const discoveryPanelPayloads = new Map();

  // Persistence State
  let pinnedReferences = [];
  let recentReferences = [];
  let savedQueries = [];
  let knowledgeTrail = [];
  let activeExplorationMode = "search";
  let activeInspectorTab = "reference";
  let evidenceTimeline = [];
  let compareSelection = [];
  let compareFeedback = "";
  let compareSynthesis = null;
  let preferencesEscapeHandlerBound = false;
  let inspectorResizeHandlerBound = false;

  // ---------------------------------------------------------------------------
  // React Island Bridge Helpers — NV-500-UX-007E.5
  // Safe wrappers: if React bundle is unavailable the fallback HTML remains.
  // ---------------------------------------------------------------------------
  function getNvReactBridge() {
    return window.NeuralVerse?.react?.bridge ?? null;
  }

  function getNvReactIsland(name) {
    return window.NeuralVerse?.react?.islands?.[name] ?? null;
  }

  /**
   * Attempt to mount or update a React island inside `container`.
   * If the bridge or island is unavailable, does nothing (fallback HTML persists).
   */
  function tryMountReactIsland(container, islandName, data, callbacks) {
    if (!container) return false;
    const bridge = getNvReactBridge();
    const Island = getNvReactIsland(islandName);
    if (!bridge || !Island) return false;
    try {
      bridge.mount(container, Island, { data, callbacks });
      return true;
    } catch (err) {
      if (window.NV_DEBUG) console.warn(`[NvIsland] mount failed for ${islandName}:`, err);
      return false;
    }
  }

  /**
   * Update props on an already-mounted React island.
   * Falls back to a full remount if update fails.
   */
  function tryUpdateReactIsland(container, islandName, data, callbacks) {
    if (!container) return false;
    const bridge = getNvReactBridge();
    const Island = getNvReactIsland(islandName);
    if (!bridge || !Island) return false;
    try {
      bridge.update(container, Island, { data, callbacks });
      return true;
    } catch (err) {
      if (window.NV_DEBUG) console.warn(`[NvIsland] update failed for ${islandName}:`, err);
      return false;
    }
  }

  /** Unmount a React island from a container (safe no-op if not mounted). */
  function tryUnmountReactIsland(container) {
    if (!container) return;
    const bridge = getNvReactBridge();
    if (!bridge) return;
    try { bridge.unmount(container); } catch (_) {}
  }

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
      const isContextKey = e.key === "ContextMenu" || e.key === "F10" || (e.shiftKey && e.key === "F10");
      if (isContextKey && contextMenuController?.open?.(element, e)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
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
    return label.length > 25 ? `${label.slice(0, 23)}...` : label;
  }

  function getGraphNodeTier(relationshipCount, isActive = false) {
    if (isActive || relationshipCount >= 6) return "hub";
    if (relationshipCount >= 3) return "connected";
    if (relationshipCount >= 1) return "leaf";
    return "inactive";
  }

  function getGraphNodeRadius(tier, isDistant = false) {
    if (isDistant) return 3.2;
    if (tier === "hub") return 8.5;
    if (tier === "connected") return 6.2;
    if (tier === "leaf") return 4.5;
    return 4.0;
  }

  function getGraphNodeShape(ref, radius) {
    if (ref?.type === "repository") {
      const size = radius * 1.7;
      return {
        tag: "rect",
        attrs: {
          x: -size / 2,
          y: -size / 2,
          width: size,
          height: size,
          rx: Math.max(2, radius * 0.34)
        }
      };
    }

    if (ref?.type === "notes") {
      const points = Array.from({ length: 6 }, (_, index) => {
        const angle = -Math.PI / 2 + (index * Math.PI * 2) / 6;
        const x = Math.cos(angle) * radius * 1.02;
        const y = Math.sin(angle) * radius * 1.02;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      }).join(" ");
      return {
        tag: "polygon",
        attrs: { points }
      };
    }

    return {
      tag: "circle",
      attrs: { r: radius }
    };
  }

  function getGraphNodeMark(ref, radius, relCount) {
    if (pinnedReferences.includes(ref.id)) {
      return createSvgElement("path", {
        class: "graph-node-mark graph-node-mark--pinned",
        d: `M ${radius * 0.15} ${-radius - 4} L ${radius + 4} ${-radius - 4} L ${radius + 4} ${-radius * 0.15}`
      });
    }
    if (getEvidenceCountForReference(ref.id) > 0) {
      return createSvgElement("circle", {
        class: "graph-node-mark graph-node-mark--evidence",
        cx: radius + 4,
        cy: radius + 4,
        r: Math.max(1.8, Math.min(3, relCount * 0.45))
      });
    }
    return null;
  }

  function shouldShowGraphLabel({ ref, activeRefId, firstHopNodeIds, secondHopNodeIds, labeledNeighborIds }) {
    if (!activeRefId) return graphLabelMode === "expanded" && graphViewport.scale >= 1.25;
    if (ref.id === activeRefId) return true;
    if (graphLabelMode === "minimal") return false;
    // Strictly active node and direct 1-hop neighbors are labeled persistently
    return firstHopNodeIds.has(ref.id);
  }

  function wrapGraphLabel(label, maxChars = 28, maxLines = 2) {
    const cleanLabel = String(label || "").replace(/\s*\([^)]*\)\s*$/, "");
    const words = cleanLabel.split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";
    words.forEach(word => {
      const next = `${current} ${word}`.trim();
      if (next.length > maxChars && current) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    });
    if (current) lines.push(current);

    if (lines.length > maxLines) {
      const result = lines.slice(0, maxLines);
      let lastLine = result[maxLines - 1];
      if (lastLine) {
        if (lastLine.endsWith(".") || lastLine.endsWith(",")) {
          lastLine = lastLine.slice(0, -1);
        }
        result[maxLines - 1] = lastLine + "...";
      }
      return result;
    }
    return lines;
  }

  function getGraphLabelPlacement(ref, coord, activeCoord, radius, width, height, index = 0) {
    const isActive = ref.id === selectedReferenceId;
    const dx = activeCoord ? coord.x - activeCoord.x : coord.x - width / 2;
    const dy = activeCoord ? coord.y - activeCoord.y : coord.y - height / 2;
    const horizontal = Math.abs(dx) >= Math.abs(dy) * 0.72;
    let side = horizontal ? (dx >= 0 ? 1 : -1) : (coord.x >= width / 2 ? -1 : 1);
    if (coord.x < width * 0.26) side = 1;
    if (coord.x > width * 0.74) side = -1;
    const vertical = dy >= 0 ? 1 : -1;
    const stagger = ((index % 3) - 1) * 8;
    if (isActive) {
      const lines = wrapGraphLabel(ref.title, 30, 2);
      return {
        anchor: "start",
        x: radius + 12,
        y: -radius - 12,
        lines,
        metricsX: radius + 12,
        metricsY: 17
      };
    }
    const lines = wrapGraphLabel(ref.title, 26, 2);
    const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);
    const estimatedWidth = Math.max(88, longestLine * 7.4);
    const distanceToActive = activeCoord ? Math.hypot(dx, dy) : Infinity;
    if (distanceToActive < 155) {
      const verticalDirection = dy >= 0 ? 1 : -1;
      return {
        anchor: "middle",
        x: 0,
        y: verticalDirection * (radius + 18),
        lines,
        metricsX: 0,
        metricsY: verticalDirection * (radius + 34)
      };
    }
    if (side > 0 && coord.x + radius + 10 + estimatedWidth > width - 18) side = -1;
    if (side < 0 && coord.x - radius - 10 - estimatedWidth < 18) side = 1;
    return {
      anchor: side > 0 ? "start" : "end",
      x: side * (radius + 10),
      y: horizontal ? 4 + stagger : vertical * (radius + 16),
      lines,
      metricsX: side * (radius + 10),
      metricsY: horizontal ? 18 + stagger : vertical * (radius + 30)
    };
  }

  function getElegantGraphLabel(ref) {
    const title = String(ref?.title || ref?.id || "").replace(/\s*\([^)]*\)\s*$/, "");
    if (title.length <= 34) return title;
    const words = title.split(/\s+/);
    let line = "";
    for (const word of words) {
      if ((line + " " + word).trim().length > 34) break;
      line = `${line} ${word}`.trim();
    }
    return line || title.slice(0, 34);
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

  function getDiscoveryRelationshipCount(refId) {
    if (!refId) return 0;
    return adapter.getRelationshipsForReference(retrievalState, refId).length;
  }

  function getConnectivityLabel(count) {
    if (count <= 0) return "Isolated";
    if (count <= 2) return "Sparse";
    if (count <= 5) return "Connected";
    return "Dense cluster";
  }

  function getDensityLabel(count) {
    if (count <= 0) return "Isolated";
    if (count <= 2) return "Sparse";
    if (count <= 5) return "Connected";
    return "Dense";
  }

  function getConnectivityScoreLabel(count) {
    if (count <= 2) return "Peripheral";
    if (count <= 5) return "Local Hub";
    return "Highly Connected";
  }

  function getEvidenceCoverageLabel(count) {
    if (count <= 1) return "Narrow";
    if (count <= 3) return "Balanced";
    return "Broad";
  }

  function getClusterLabel(ref) {
    const keywords = Array.isArray(ref?.keywords) ? ref.keywords.map(k => String(k).toLowerCase()) : [];
    if (keywords.some(k => ["transformer", "bert", "gpt", "llm", "nlp", "language"].includes(k))) return "Language models";
    if (keywords.some(k => ["vision", "detection", "classification", "clip", "vit", "yolo"].includes(k))) return "Vision systems";
    if (keywords.some(k => ["pytorch", "library", "framework", "tensor"].includes(k))) return "Frameworks";
    if (keywords.some(k => ["rag", "retrieval", "evaluation", "context"].includes(k))) return "Retrieval evaluation";
    if (keywords.some(k => ["agent", "reasoning", "tool-use"].includes(k))) return "Agent reasoning";
    return ref?.type ? `${ref.type} context` : "Context cluster";
  }

  function renderSegmentedMicroviz(className, label, activeCount, totalCount = 4) {
    const active = Math.max(0, Math.min(totalCount, activeCount));
    return `
      <span class="${className}" role="img" aria-label="${escapeHtml(label)}">
        <span class="${className}__track" aria-hidden="true">
          ${Array.from({ length: totalCount }, (_, index) => `<span class="${className}__segment${index < active ? " is-active" : ""}"></span>`).join("")}
        </span>
        <span class="${className}__label">${escapeHtml(label)}</span>
      </span>
    `;
  }

  function renderContributionBar(label, level) {
    return renderSegmentedMicroviz("nv-contribution-bar", label, level, 4);
  }

  function renderRelationshipDensityMeter(count) {
    const label = getDensityLabel(count);
    const level = label === "Isolated" ? 1 : label === "Sparse" ? 2 : label === "Connected" ? 3 : 4;
    return renderSegmentedMicroviz("nv-density-meter", `${label} relationship density`, level, 4);
  }

  function renderDensityMeter(count) {
    return renderRelationshipDensityMeter(count);
  }

  function renderEvidenceCoverageStrip(count) {
    const label = `${getEvidenceCoverageLabel(count)} evidence coverage`;
    const level = count <= 1 ? 1 : count <= 3 ? 2 : 3;
    return renderSegmentedMicroviz("nv-coverage-strip", label, level, 3);
  }

  function renderCoverageStrip(count) {
    return renderEvidenceCoverageStrip(count);
  }

  function renderConfidenceGauge(confidence) {
    const label = confidence === "high" ? "High Support" : confidence === "medium" ? "Moderate Support" : "Limited Support";
    const level = confidence === "high" ? 3 : confidence === "medium" ? 2 : 1;
    return renderSegmentedMicroviz("nv-confidence-gauge", label, level, 3);
  }

  function renderConnectivityScore(count) {
    const label = getConnectivityScoreLabel(count);
    const level = label === "Peripheral" ? 1 : label === "Local Hub" ? 2 : 3;
    return renderSegmentedMicroviz("nv-connectivity-score", label, level, 3);
  }

  function renderConnectivityIndicator(count) {
    return renderConnectivityScore(count);
  }

  function renderClusterIndicator(ref) {
    return `
      <span class="nv-cluster-indicator" role="img" aria-label="Cluster context: ${escapeHtml(getClusterLabel(ref))}">
        <span class="nv-cluster-indicator__nodes" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
        <span>${escapeHtml(getClusterLabel(ref))}</span>
      </span>
    `;
  }

  function renderTrailSparkline(events) {
    const visible = (events || []).slice(0, 8).reverse();
    if (visible.length === 0) return "";
    return `
      <span class="nv-trail-sparkline" role="img" aria-label="${visible.length} chronological trail events">
        <span class="nv-trail-sparkline__track" aria-hidden="true">
          ${visible.map((event, index) => `<span class="nv-trail-sparkline__dot" style="--nv-trail-step: ${index + 1};"></span>`).join("")}
        </span>
        <span>${visible.length} trail events</span>
      </span>
    `;
  }

  function renderSessionProgress() {
    const artifactCount = pinnedReferences.length + recentReferences.length + savedQueries.length + evidenceTimeline.length + knowledgeTrail.length;
    const activeKinds = [pinnedReferences.length, recentReferences.length, savedQueries.length, evidenceTimeline.length, knowledgeTrail.length].filter(Boolean).length;
    return `
      <span class="nv-session-progress" role="img" aria-label="${artifactCount} session artifacts across ${activeKinds} active artifact types">
        <span class="nv-session-progress__track" aria-hidden="true">
          ${Array.from({ length: 5 }, (_, index) => `<span class="nv-session-progress__segment${index < activeKinds ? " is-active" : ""}"></span>`).join("")}
        </span>
        <span>${artifactCount} session artifacts</span>
      </span>
    `;
  }

  function getDiscoveryRelationship(seedId, targetId) {
    if (!seedId || !targetId) return null;
    return adapter.getRelationshipsForReference(retrievalState, seedId)
      .find(rel => rel.sourceReferenceId === targetId || rel.targetReferenceId === targetId) || null;
  }

  function getRelevanceLabel({ strength, rank = 0, reason = "" } = {}) {
    if (Number.isFinite(strength)) {
      if (strength >= 0.82) return "High relevance";
      if (strength >= 0.6) return "Moderate relevance";
      return "Exploratory match";
    }
    const reasonText = String(reason).toLowerCase();
    if (reasonText.includes("direct") || reasonText.includes("citation") || reasonText.includes("support")) {
      return "High relevance";
    }
    if (rank <= 1) return "High relevance";
    if (rank <= 3) return "Moderate relevance";
    return "Exploratory match";
  }

  function getRelevanceLevel(label) {
    if (label === "High relevance") return 4;
    if (label === "Moderate relevance") return 3;
    return 2;
  }

  function normalizeRecommendationReason(rawReason, category, relType) {
    const reason = String(rawReason || "").toLowerCase();
    const type = String(relType || category || "").toLowerCase();
    if (type === "cites" || reason.includes("citation") || reason.includes("cites")) return "Related by citation";
    if (type === "supports" || type === "uses" || reason.includes("support")) return "Supports current evidence";
    if (type === "contrasts" || reason.includes("contrast")) return "Contrasts with selected reference";
    if (type === "implements" || reason.includes("implementation")) return "Direct relationship";
    if (type === "related" || reason.includes("direct relationship")) return "Direct relationship";
    if (type === "similar" || reason.includes("keyword") || reason.includes("concept")) return "Shares key concepts";
    if (type === "continue" || reason.includes("recent")) return "Frequently explored with current reference";
    if (reason.includes("same category") || reason.includes("same type")) return "Similar reference type";
    if (reason.includes("pinned")) return "Pinned context match";
    if (reason.includes("saved query")) return "Saved query match";
    if (reason.includes("graph") || reason.includes("path")) return "Connected through graph path";
    if (reason.includes("neighborhood")) return "Same knowledge neighborhood";
    if (reason.includes("build")) return "Builds on selected reference";
    return "Contextual match";
  }

  function getDiscoveryIconPath({ ref, reason, category, isPinned = false } = {}) {
    if (isPinned) return "assets/icons/scientific/collections/pinned-references.svg";
    const reasonText = String(reason || "").toLowerCase();
    const categoryText = String(category || "").toLowerCase();
    if (reasonText.includes("citation") || reasonText.includes("direct relationship") || categoryText === "related") {
      return "assets/icons/scientific/knowledge-graph/citation-bridge.svg";
    }
    if (reasonText.includes("evidence") || reasonText.includes("support")) {
      return "assets/icons/scientific/evidence/evidence-convergence.svg";
    }
    if (reasonText.includes("neighborhood")) {
      return "assets/icons/scientific/knowledge-graph/active-neighborhood.svg";
    }
    if (reasonText.includes("concept") || reasonText.includes("path") || categoryText === "similar") {
      return "assets/icons/scientific/knowledge-graph/semantic-path.svg";
    }
    if (categoryText === "recent") return "assets/icons/scientific/memory-session/recent-activity.svg";
    if (categoryText === "saved-query") return "assets/icons/scientific/collections/saved-queries.svg";
    if (ref?.type === "paper" || ref?.type === "notes") return "assets/icons/scientific/inspector/document-review.svg";
    return "assets/icons/scientific/inspector/reference-details.svg";
  }

  function getReferenceDescription(ref) {
    if (!ref) return "";
    if (Array.isArray(ref.keywords) && ref.keywords.length > 0) {
      return `Key concepts: ${ref.keywords.slice(0, 4).join(", ")}`;
    }
    return ref.source ? `Source: ${ref.source}` : "";
  }

  function resolveAssetPath(path) {
    const value = String(path || "");
    if (!value || value.startsWith("/") || value.startsWith("http")) return value;
    return new URL(value, document.baseURI).pathname;
  }

  function renderScientificIcon(path, extraClass = "") {
    const iconPath = resolveAssetPath(path);
    return `<span class="nv-scientific-icon nv-discovery-panel__icon-glyph ${extraClass}" style="--nv-scientific-icon-url: url('${iconPath}');" aria-hidden="true"></span>`;
  }

  function renderRelevanceMeter(label) {
    const level = getRelevanceLevel(label);
    return `
      <span class="nv-relevance-meter" aria-label="${escapeHtml(label)}">
        <span class="nv-relevance-meter__track" aria-hidden="true">
          ${[1, 2, 3, 4].map(step => `<span class="nv-relevance-meter__segment${step <= level ? " is-active" : ""}"></span>`).join("")}
        </span>
        <span>${escapeHtml(label)}</span>
      </span>
    `;
  }

  function renderDiscoveryPanel({
    variant = "standard",
    reference,
    reason,
    category,
    relationshipCount,
    relevanceLabel,
    connectivityLabel,
    iconPath,
    microvisualization = "",
    showDescription = true,
    actions = ["preview", "open", "pin"]
  }) {
    if (!reference) return "";
    const relCount = Number.isFinite(relationshipCount) ? relationshipCount : getDiscoveryRelationshipCount(reference.id);
    const connectivity = connectivityLabel || getConnectivityLabel(relCount);
    const relevance = relevanceLabel || getRelevanceLabel({ reason });
    const reasonLabel = normalizeRecommendationReason(reason, category);
    const description = getReferenceDescription(reference);
    const isPinned = pinnedReferences.includes(reference.id);
    const panelIcon = iconPath || getDiscoveryIconPath({ ref: reference, reason: reasonLabel, category, isPinned });
    const uid = `${variant}-${discoveryPanelPayloads.size}`;
    const previewId = `discovery-preview-${String(reference.id).replace(/[^a-zA-Z0-9_-]/g, "-")}-${uid}`;
    const actionSet = new Set(actions);
    const panelId = `discovery-card-${String(reference.id).replace(/[^a-zA-Z0-9_-]/g, "-")}-${uid}`;
    discoveryPanelPayloads.set(panelId, {
      variant,
      reference: {
        id: reference.id,
        title: reference.title,
        type: reference.type || "reference",
        source: reference.source || "",
        keywords: Array.isArray(reference.keywords) ? reference.keywords : []
      },
      reasonLabel,
      description,
      relationshipCount: relCount,
      microvisualization,
      iconPath: panelIcon,
      isPinned,
      showDescription,
      actions,
      previewId
    });

    const titleId = `discovery-title-${escapeHtml(reference.id)}-${uid}`;
    const fallbackHtml = `
      <article class="nv-discovery-panel nv-discovery-panel--${variant}" data-ref-id="${escapeHtml(reference.id)}" data-preview-ref="${escapeHtml(reference.id)}" tabindex="0" aria-labelledby="${titleId}">
        <div class="nv-discovery-panel__icon">
          ${renderScientificIcon(panelIcon)}
        </div>
        <div class="nv-discovery-panel__body">
          <div class="nv-discovery-panel__meta">
            <span class="nv-badge" data-variant="info">${escapeHtml(reference.type || "reference")}</span>
            <span class="nv-discovery-panel__reason">${escapeHtml(reasonLabel)}</span>
          </div>
          <h4 class="nv-discovery-panel__title" id="${titleId}">${escapeHtml(reference.title)}</h4>
          ${showDescription && variant !== "compact" && description ? `<p class="nv-discovery-panel__description">${escapeHtml(description)}</p>` : ""}
          <div class="nv-discovery-panel__metrics" aria-label="Recommendation metrics">
            <span>${relCount} relationship${relCount === 1 ? "" : "s"}</span>
          </div>
          ${microvisualization ? `<div class="nv-discovery-panel__microvisualization">${microvisualization}</div>` : ""}
          <div class="nv-discovery-panel__preview" id="${previewId}" hidden>
            <strong>${escapeHtml(reference.title)}</strong>
            <span>${escapeHtml(description || "No additional preview available.")}</span>
          </div>
          <div class="nv-discovery-panel__actions">
            ${actionSet.has("preview") ? `<button class="nv-button nv-discovery-panel__action" data-action="preview-discovery" data-id="${escapeHtml(reference.id)}" data-preview-id="${previewId}" data-variant="ghost" aria-expanded="false">Preview</button>` : ""}
            ${actionSet.has("open") ? `<button class="nv-button nv-discovery-panel__action" data-action="open-discovery" data-id="${escapeHtml(reference.id)}" data-variant="primary">Open</button>` : ""}
            ${actionSet.has("pin") ? `<button class="nv-button nv-discovery-panel__action" data-action="pin-discovery" data-id="${escapeHtml(reference.id)}" data-variant="secondary">${isPinned ? "Unpin" : "Pin"}</button>` : ""}
            ${actionSet.has("compare") ? `<button class="nv-button nv-discovery-panel__action" data-action="compare-discovery" data-id="${escapeHtml(reference.id)}" data-variant="secondary">Compare</button>` : ""}
            <button class="nv-button nv-discovery-panel__action nv-context-menu-trigger" data-context-menu-trigger data-ref-id="${escapeHtml(reference.id)}" data-variant="ghost" aria-label="More actions for ${escapeHtml(reference.title)}">More</button>
          </div>
        </div>
      </article>
    `;

    return `
      <div class="nv-react-discovery-card-root" data-discovery-card-id="${escapeHtml(panelId)}">
        ${fallbackHtml}
      </div>
    `;
  }

  function mountDiscoveryCards(container, options = {}) {
    if (!container) return false;
    const reactLayer = window.NeuralVerse?.react;
    if (!reactLayer?.bridge || !reactLayer?.islands?.NvDiscoveryCard) return false;

    container.querySelectorAll(".nv-react-discovery-card-root[data-discovery-card-id]").forEach(root => {
      const panelId = root.getAttribute("data-discovery-card-id");
      const payload = discoveryPanelPayloads.get(panelId);
      if (!payload) return;
      reactLayer.bridge.mount(root, reactLayer.islands.NvDiscoveryCard, {
        data: payload,
        callbacks: {
          onAction: (action, id) => {
            if (action === "open") {
              addTrailEvent("discovery_open", `Opened discovery panel "${id}"`, { referenceId: id });
              selectReference(id);
            } else if (action === "pin") {
              if (pinnedReferences.includes(id)) {
                unpinReference(id);
              } else {
                pinReference(id);
              }
              if (typeof options.onPinChange === "function") options.onPinChange(id);
            } else if (action === "compare") {
              addToCompare(id);
            }
          }
        }
      });
    });
    return true;
  }

  function bindDiscoveryPanelActions(container, options = {}) {
    if (!container) return;
    if (mountDiscoveryCards(container, options)) return;

    container.querySelectorAll(".nv-discovery-panel").forEach(panel => {
      const refId = panel.getAttribute("data-ref-id");
      const openPanel = () => {
        addTrailEvent("discovery_open", `Opened discovery panel "${refId}"`, { referenceId: refId });
        selectReference(refId);
      };
      panel.onclick = (event) => {
        if (event.target.closest("button")) return;
        openPanel();
      };
      bindKeyboardActivation(panel, openPanel);
    });

    container.querySelectorAll("button[data-action='preview-discovery']").forEach(btn => {
      btn.onclick = (event) => {
        event.stopPropagation();
        const preview = document.getElementById(btn.getAttribute("data-preview-id"));
        if (!preview) return;
        const willOpen = preview.hidden;
        preview.hidden = !willOpen;
        btn.setAttribute("aria-expanded", String(willOpen));
      };
    });

    container.querySelectorAll("button[data-action='open-discovery']").forEach(btn => {
      btn.onclick = (event) => {
        event.stopPropagation();
        const id = btn.getAttribute("data-id");
        addTrailEvent("discovery_open", `Opened discovery panel "${id}"`, { referenceId: id });
        selectReference(id);
      };
    });

    container.querySelectorAll("button[data-action='pin-discovery']").forEach(btn => {
      btn.onclick = (event) => {
        event.stopPropagation();
        const id = btn.getAttribute("data-id");
        if (pinnedReferences.includes(id)) {
          unpinReference(id);
        } else {
          pinReference(id);
        }
        if (typeof options.onPinChange === "function") options.onPinChange(id);
      };
    });

    container.querySelectorAll("button[data-action='compare-discovery']").forEach(btn => {
      btn.onclick = (event) => {
        event.stopPropagation();
        addToCompare(btn.getAttribute("data-id"));
      };
    });
  }

  function getRelationshipById(relId) {
    if (!relId) return null;
    return retrievalState.relationships.find(rel => rel.id === relId) || null;
  }

  function getReferencePreviewPayload(refId, sourceLabel = "") {
    const ref = adapter.getReferenceById(retrievalState, refId);
    if (!ref) return null;
    const relationshipCount = getDiscoveryRelationshipCount(ref.id);
    const evidenceCount = getEvidenceCountForReference(ref.id);
    return {
      type: "reference",
      ref,
      iconPath: getDiscoveryIconPath({ ref, category: sourceLabel }),
      eyebrow: [
        ref.type || "reference",
        adapter.inferReferenceCluster ? adapter.inferReferenceCluster(ref) : getClusterLabel(ref)
      ].filter(Boolean).join(" · "),
      title: ref.title,
      description: getReferenceDescription(ref),
      metrics: [
        `${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"}`,
        getConnectivityLabel(relationshipCount),
        evidenceCount > 0 ? `${evidenceCount} evidence input${evidenceCount === 1 ? "" : "s"}` : ""
      ].filter(Boolean),
      microvisualizations: "",
      actions: [
        { action: "open-reference", label: "Open", id: ref.id, variant: "primary" },
        { action: "pin-reference", label: pinnedReferences.includes(ref.id) ? "Unpin" : "Pin", id: ref.id, variant: "secondary" },
        { action: "add-to-compare", label: "Add to Compare", id: ref.id, variant: "secondary" }
      ]
    };
  }

  function getRelationshipPreviewPayload(relId) {
    const rel = getRelationshipById(relId);
    if (!rel) return null;
    const source = adapter.getReferenceById(retrievalState, rel.sourceReferenceId);
    const target = adapter.getReferenceById(retrievalState, rel.targetReferenceId);
    const relType = String(rel.type || "related").replace(/_/g, " ");
    const strength = typeof rel.strength === "number" ? `Strength ${rel.strength}` : "";
    return {
      type: "relationship",
      rel,
      iconPath: "assets/icons/scientific/knowledge-graph/citation-bridge.svg",
      eyebrow: `Relationship · ${relType}`,
      title: `${source?.title || rel.sourceReferenceId} → ${target?.title || rel.targetReferenceId}`,
      description: rel.context || "Relationship context from the current graph.",
      metrics: [strength, relType].filter(Boolean),
      microvisualizations: "",
      actions: [
        { action: "open-relationship", label: "Open Relationship", id: rel.id, variant: "primary" },
        { action: "follow-source", label: "Follow Source", id: rel.sourceReferenceId, variant: "secondary" },
        { action: "follow-target", label: "Follow Target", id: rel.targetReferenceId, variant: "secondary" }
      ]
    };
  }

  function getQueryPreviewPayload(query) {
    if (!query) return null;
    const results = adapter.searchReferences(retrievalState, query);
    return {
      type: "query",
      iconPath: "assets/icons/scientific/search-discovery/query-signal.svg",
      eyebrow: "Saved query",
      title: query,
      description: "Rerun this query to resume the investigation from the current workspace.",
      metrics: [`${results.length} current match${results.length === 1 ? "" : "es"}`],
      microvisualizations: "",
      actions: [
        { action: "rerun-query", label: "Rerun", id: query, variant: "primary" }
      ]
    };
  }

  function getTrailPreviewPayload(eventId) {
    const event = knowledgeTrail.find(item => item.id === eventId);
    if (!event) return null;
    const meta = event.meta || {};
    const actions = [];
    if (meta.referenceId) {
      actions.push({ action: "open-reference", label: "Open Reference", id: meta.referenceId, variant: "primary" });
    }
    if (meta.query) {
      actions.push({ action: "rerun-query", label: "Rerun Query", id: meta.query, variant: "primary" });
    }
    return {
      type: "trail",
      iconPath: "assets/icons/scientific/memory-session/knowledge-trail.svg",
      eyebrow: `Knowledge trail · ${event.timestamp || "session"}`,
      title: event.label || event.type || "Research event",
      description: `Action: ${event.type || "workspace event"}`,
      metrics: [meta.referenceId ? `Reference ${meta.referenceId}` : "", meta.query ? `Query "${meta.query}"` : ""].filter(Boolean),
      microvisualizations: "",
      actions
    };
  }

  function renderRichPreview(payload) {
    if (!payload) return "";
    const actions = payload.actions || [];
    return `
      <section class="nv-hover-preview nv-hover-preview--${escapeHtml(payload.type || "reference")}" role="region" aria-label="${escapeHtml(payload.title || "Research preview")}">
        <div class="nv-hover-preview__header">
          <span class="nv-hover-preview__icon">
            ${renderScientificIcon(payload.iconPath || "assets/icons/scientific/inspector/reference-details.svg")}
          </span>
          <span class="nv-hover-preview__eyebrow">${escapeHtml(payload.eyebrow || "Preview")}</span>
        </div>
        <h3 class="nv-hover-preview__title">${escapeHtml(payload.title || "Untitled reference")}</h3>
        ${payload.description ? `<p class="nv-hover-preview__description">${escapeHtml(payload.description)}</p>` : ""}
        ${payload.microvisualizations ? `<div class="nv-hover-preview__microviz">${payload.microvisualizations}</div>` : ""}
        ${payload.metrics?.length ? `
          <div class="nv-hover-preview__metrics">
            ${payload.metrics.map(metric => `<span>${escapeHtml(metric)}</span>`).join("")}
          </div>
        ` : ""}
        ${actions.length ? `
          <div class="nv-hover-preview__actions">
            ${actions.map(item => `
              <button class="nv-button nv-hover-preview__action" data-preview-action="${escapeHtml(item.action)}" data-id="${escapeHtml(item.id)}" data-variant="${escapeHtml(item.variant || "secondary")}">
                ${escapeHtml(item.label)}
              </button>
            `).join("")}
          </div>
        ` : ""}
      </section>
    `;
  }

  function createRichHoverPreviewController() {
    let layer = document.querySelector(".nv-hover-preview-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "nv-hover-preview-layer";
      layer.setAttribute("aria-live", "polite");
      document.body.appendChild(layer);
    }

    let activeTrigger = null;
    let showTimer = null;
    let hideTimer = null;
    let lastShownAt = 0;

    const clearTimers = () => {
      if (showTimer) window.clearTimeout(showTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
      showTimer = null;
      hideTimer = null;
    };

    const getTrigger = (target) => {
      if (!target || !target.closest) return null;
      return target.closest([
        "[data-preview-ref]",
        ".graph-node[data-id]",
        ".graph-link-target[data-rel-id]",
        ".nv-discovery-panel[data-ref-id]",
        ".nv-card[data-ref-id]",
        ".memory-item[data-ref-id]",
        ".clickable-lineage-node[data-id]",
        "button[data-action='open-supporting'][data-id]",
        ".nv-card[data-rel-id]",
        ".memory-item[data-query]",
        ".trail-event[data-event-id]"
      ].join(","));
    };

    const payloadForTrigger = (trigger) => {
      if (!trigger) return null;
      const relId = trigger.getAttribute("data-rel-id");
      if (relId) return getRelationshipPreviewPayload(relId);
      const query = trigger.getAttribute("data-query");
      if (query) return getQueryPreviewPayload(query);
      const eventId = trigger.getAttribute("data-event-id");
      if (eventId) return getTrailPreviewPayload(eventId);
      const refId = trigger.getAttribute("data-preview-ref") || trigger.getAttribute("data-ref-id") || trigger.getAttribute("data-id");
      if (refId) return getReferencePreviewPayload(refId, trigger.classList?.contains("graph-node") ? "graph" : "");
      return null;
    };

    const position = (trigger) => {
      const preview = layer.querySelector(".nv-hover-preview");
      if (!preview || !trigger?.getBoundingClientRect) return;
      const padding = 14;
      const triggerRect = trigger.getBoundingClientRect();
      const previewRect = preview.getBoundingClientRect();
      let left = triggerRect.right + 12;
      let top = triggerRect.top + Math.min(12, triggerRect.height / 2);

      if (left + previewRect.width > window.innerWidth - padding) {
        left = triggerRect.left - previewRect.width - 12;
      }
      if (top + previewRect.height > window.innerHeight - padding) {
        top = triggerRect.bottom - previewRect.height;
      }
      left = Math.max(padding, Math.min(left, window.innerWidth - previewRect.width - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - previewRect.height - padding));

      preview.style.left = `${left}px`;
      preview.style.top = `${top}px`;
    };

    const show = (trigger, immediate = false) => {
      clearTimers();
      if (!trigger || window.matchMedia("(max-width: 640px)").matches) return;
      activeTrigger = trigger;
      const delay = immediate ? 0 : 180;
      showTimer = window.setTimeout(() => {
        const payload = payloadForTrigger(trigger);
        if (!payload) return;

        // ----------------------------------------------------------------
        // NV-500-UX-007E.2: Use React NvHoverPreview island when available.
        // Falls back to innerHTML if React layer is not yet loaded.
        // The JS layer retains full ownership of payload, position, actions.
        // ----------------------------------------------------------------
        const reactBridge = window.NeuralVerse?.react;
        if (reactBridge) {
          // Ensure a clean container node inside the layer
          let previewContainer = layer.querySelector(".nv-react-hover-preview-root");
          if (!previewContainer) {
            layer.innerHTML = ""; // clear any stale HTML fallback content
            previewContainer = document.createElement("div");
            previewContainer.className = "nv-react-hover-preview-root";
            layer.appendChild(previewContainer);
          }

          reactBridge.bridge.mount(
            previewContainer,
            reactBridge.islands.NvHoverPreview,
            {
              data: payload,
              callbacks: {
                onAction: (action, id) => {
                  // Dispatch back to the existing JS action handler
                  const syntheticEvent = { target: document.createElement("button") };
                  syntheticEvent.target.setAttribute("data-preview-action", action);
                  syntheticEvent.target.setAttribute("data-id", id);
                  hide();
                  if (action === "open-reference" || action === "follow-source" || action === "follow-target") {
                    selectReference(id);
                  } else if (action === "pin-reference") {
                    if (pinnedReferences.includes(id)) {
                      unpinReference(id);
                    } else {
                      pinReference(id);
                    }
                  } else if (action === "add-to-compare") {
                    addToCompare(id);
                  } else if (action === "open-relationship") {
                    const rel = getRelationshipById(id);
                    if (rel) {
                      selectedRelationship = rel;
                      addTrailEvent("inspect_rel", `Inspected relationship "${rel.sourceReferenceId} \u27A4 ${rel.targetReferenceId}"`, { relationship: rel });
                      switchInspectorTab("relationship");
                      renderRelationshipInspector();
                      saveWorkspaceState();
                    }
                  } else if (action === "rerun-query") {
                    const searchInput = document.getElementById("playground-search-input");
                    if (searchInput) searchInput.value = id;
                    runSearch(id, true);
                  }
                },
              },
            }
          );
        } else {
          // Vanilla-JS fallback (identical to original behaviour)
          const html = renderRichPreview(payload);
          if (!html) return;
          layer.innerHTML = html;
        }

        layer.classList.add("is-visible");
        lastShownAt = Date.now();
        window.requestAnimationFrame(() => position(trigger));
      }, delay);
    };

    const hide = () => {
      clearTimers();
      activeTrigger = null;
      // Unmount React island if present
      const previewContainer = layer.querySelector(".nv-react-hover-preview-root");
      if (previewContainer && window.NeuralVerse?.react?.bridge) {
        window.NeuralVerse.react.bridge.unmount(previewContainer);
      }
      const preview = layer.querySelector(".nv-hover-preview");
      if (preview) preview.classList.add("is-closing");
      layer.classList.remove("is-visible");
      hideTimer = window.setTimeout(() => {
        if (!activeTrigger) layer.innerHTML = "";
      }, 140);
    };

    document.addEventListener("mouseover", (event) => {
      const trigger = getTrigger(event.target);
      if (!trigger || trigger === activeTrigger || layer.contains(event.target)) return;
      show(trigger, false);
    });

    document.addEventListener("mouseout", (event) => {
      const trigger = getTrigger(event.target);
      if (!trigger) return;
      const related = event.relatedTarget;
      if (related && (trigger.contains(related) || layer.contains(related))) return;
      hideTimer = window.setTimeout(() => {
        if (!layer.matches(":hover")) hide();
      }, 80);
    });

    document.addEventListener("focusin", (event) => {
      const trigger = getTrigger(event.target);
      if (trigger) show(trigger, true);
    });

    document.addEventListener("focusout", (event) => {
      if (event.relatedTarget && layer.contains(event.relatedTarget)) return;
      hide();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && layer.classList.contains("is-visible")) {
        event.preventDefault();
        event.stopPropagation();
        const triggerToRestore = activeTrigger;
        const shouldRestoreFocus = layer.contains(document.activeElement);
        hide();
        if (shouldRestoreFocus && triggerToRestore?.focus) triggerToRestore.focus();
      }
    }, true);

    document.addEventListener("scroll", () => {
      if (Date.now() - lastShownAt < 250) return;
      if (activeTrigger && document.activeElement === activeTrigger) return;
      if (activeTrigger?.matches?.(":hover")) return;
      hide();
    }, true);
    window.addEventListener("resize", hide);
    window.addEventListener("hashchange", hide);

    layer.addEventListener("mouseleave", () => {
      hideTimer = window.setTimeout(hide, 80);
    });
    layer.addEventListener("mouseenter", () => {
      if (hideTimer) window.clearTimeout(hideTimer);
    });
    layer.addEventListener("click", (event) => {
      const action = event.target.closest("[data-preview-action]");
      if (!action) return;
      event.preventDefault();
      event.stopPropagation();
      const id = action.getAttribute("data-id");
      const type = action.getAttribute("data-preview-action");
      hide();
      if (type === "open-reference" || type === "follow-source" || type === "follow-target") {
        selectReference(id);
      } else if (type === "pin-reference") {
        if (pinnedReferences.includes(id)) {
          unpinReference(id);
        } else {
          pinReference(id);
        }
      } else if (type === "open-relationship") {
        const rel = getRelationshipById(id);
        if (rel) {
          selectedRelationship = rel;
          addTrailEvent("inspect_rel", `Inspected relationship "${rel.sourceReferenceId} ➔ ${rel.targetReferenceId}"`, { relationship: rel });
          switchInspectorTab("relationship");
          renderRelationshipInspector();
          saveWorkspaceState();
        }
      } else if (type === "rerun-query") {
        const searchInput = document.getElementById("playground-search-input");
        if (searchInput) searchInput.value = id;
        runSearch(id, true);
      }
    });

    return { hide, show };
  }

  function getContextActionIcon(actionId) {
    const icons = {
      open: "assets/icons/scientific/inspector/reference-details.svg",
      preview: "assets/icons/scientific/search-discovery/research-lens.svg",
      pin: "assets/icons/scientific/collections/pinned-references.svg",
      unpin: "assets/icons/scientific/collections/pinned-references.svg",
      compare: "assets/icons/scientific/knowledge-graph/semantic-path.svg",
      "compile-evidence": "assets/icons/scientific/evidence/evidence-convergence.svg",
      "follow-source": "assets/icons/scientific/knowledge-graph/citation-bridge.svg",
      "follow-target": "assets/icons/scientific/knowledge-graph/citation-bridge.svg",
      "open-relationship": "assets/icons/scientific/knowledge-graph/citation-bridge.svg",
      "explore-neighborhood": "assets/icons/scientific/knowledge-graph/active-neighborhood.svg",
      "rerun-query": "assets/icons/scientific/search-discovery/query-signal.svg",
      "restore-trail-context": "assets/icons/scientific/memory-session/knowledge-trail.svg",
      "copy-reference-id": "assets/icons/scientific/inspector/metadata-panel.svg",
      "copy-query": "assets/icons/scientific/collections/saved-queries.svg",
      "copy-relationship-id": "assets/icons/scientific/inspector/metadata-panel.svg"
    };
    return icons[actionId] || "assets/icons/scientific/inspector/reference-details.svg";
  }

  function contextAction(id, label, options = {}) {
    return {
      id,
      label,
      iconPath: getContextActionIcon(id),
      variant: options.variant || "default",
      disabled: Boolean(options.disabled),
      shortcut: options.shortcut || ""
    };
  }

  function getReferenceContextActions(refId, targetType) {
    const isPinned = pinnedReferences.includes(refId);
    const actions = [
      contextAction("open", "Open", { variant: "primary" }),
      contextAction("preview", "Preview"),
      contextAction(isPinned ? "unpin" : "pin", isPinned ? "Unpin" : "Pin")
    ];

    actions.push(contextAction("compare", compareSelection.includes(refId) ? "Already in Compare" : "Add to Compare", { disabled: compareSelection.includes(refId) }));

    actions.push(contextAction("compile-evidence", "Compile Evidence"));

    if (["graph-node", "discovery-panel", "pinned-reference", "evidence-reference", "inspector-cross-link"].includes(targetType)) {
      actions.push(contextAction("explore-neighborhood", "Explore Neighborhood"));
    }

    actions.push(contextAction("copy-reference-id", "Copy Reference ID"));
    return actions;
  }

  function getTargetTypeForTrigger(trigger) {
    if (!trigger) return "";
    if (trigger.classList?.contains("graph-node")) return "graph-node";
    if (trigger.classList?.contains("graph-link-target")) return "graph-edge";
    if (trigger.classList?.contains("trail-event")) return "knowledge-trail-entry";
    if (trigger.classList?.contains("clickable-lineage-node")) return "evidence-reference";
    if (trigger.classList?.contains("clickable-evidence-rel")) return "relationship-chip";
    if (trigger.classList?.contains("compact-action-card") && trigger.hasAttribute("data-rel-id")) return "relationship-chip";
    if (trigger.hasAttribute("data-query")) return "saved-query";
    if (trigger.closest?.("#memory-pinned-list")) return "pinned-reference";
    if (trigger.closest?.("#memory-recent-list")) return "recent-reference";
    if (trigger.closest?.("#evidence-compilation-container")) return "evidence-reference";
    if (trigger.closest?.("#selected-reference-container") || trigger.closest?.("#selected-relationship-container")) return "inspector-cross-link";
    if (trigger.classList?.contains("nv-discovery-panel") || trigger.closest?.(".nv-discovery-panel")) return "discovery-panel";
    if (trigger.classList?.contains("result-card")) return "reference-card";
    if (trigger.hasAttribute("data-ref-id") || trigger.hasAttribute("data-preview-ref") || trigger.hasAttribute("data-id")) return "reference-card";
    return "";
  }

  function buildReferenceContextMenuPayload(trigger, targetType, point) {
    const refId = trigger.getAttribute("data-preview-ref") || trigger.getAttribute("data-ref-id") || trigger.getAttribute("data-id") || trigger.closest?.("[data-ref-id]")?.getAttribute("data-ref-id");
    const ref = adapter.getReferenceById(retrievalState, refId);
    if (!ref) return null;
    const relCount = getDiscoveryRelationshipCount(ref.id);
    return {
      id: `context-${targetType}-${ref.id}`,
      targetType,
      refId: ref.id,
      title: ref.title,
      subtitle: `${ref.type || "reference"} · ${getConnectivityLabel(relCount)}`,
      metadata: [`${relCount} relationship${relCount === 1 ? "" : "s"}`, getClusterLabel(ref)].filter(Boolean),
      iconPath: getDiscoveryIconPath({ ref, category: targetType }),
      position: point,
      actions: getReferenceContextActions(ref.id, targetType)
    };
  }

  function buildRelationshipContextMenuPayload(trigger, targetType, point) {
    const relId = trigger.getAttribute("data-rel-id") || trigger.getAttribute("data-id");
    const rel = getRelationshipById(relId);
    if (!rel) return null;
    const source = adapter.getReferenceById(retrievalState, rel.sourceReferenceId);
    const target = adapter.getReferenceById(retrievalState, rel.targetReferenceId);
    const relType = String(rel.type || "related").replace(/_/g, " ");
    return {
      id: `context-${targetType}-${rel.id}`,
      targetType,
      relationshipId: rel.id,
      sourceReferenceId: rel.sourceReferenceId,
      targetReferenceId: rel.targetReferenceId,
      title: relType,
      subtitle: `${source?.title || rel.sourceReferenceId} → ${target?.title || rel.targetReferenceId}`,
      metadata: [typeof rel.strength === "number" ? `Strength ${rel.strength}` : "", rel.context || ""].filter(Boolean).slice(0, 2),
      iconPath: "assets/icons/scientific/knowledge-graph/citation-bridge.svg",
      position: point,
      actions: [
        contextAction("preview", "Preview"),
        contextAction("follow-source", "Follow Source"),
        contextAction("follow-target", "Follow Target"),
        contextAction("open-relationship", "Open Relationship", { variant: "primary" }),
        contextAction("copy-relationship-id", "Copy Relationship ID")
      ]
    };
  }

  function buildQueryContextMenuPayload(trigger, point) {
    const query = trigger.getAttribute("data-query");
    if (!query) return null;
    const results = adapter.searchReferences(retrievalState, query);
    return {
      id: `context-saved-query-${query}`,
      targetType: "saved-query",
      query,
      title: query,
      subtitle: "Saved query",
      metadata: [`${results.length} current match${results.length === 1 ? "" : "es"}`],
      iconPath: "assets/icons/scientific/collections/saved-queries.svg",
      position: point,
      actions: [
        contextAction("rerun-query", "Rerun Query", { variant: "primary" }),
        contextAction("preview", "Preview"),
        contextAction("copy-query", "Copy Query")
      ]
    };
  }

  function buildTrailContextMenuPayload(trigger, point) {
    const eventId = trigger.getAttribute("data-event-id");
    const event = knowledgeTrail.find(item => item.id === eventId);
    if (!event) return null;
    const meta = event.meta || {};
    const actions = [
      contextAction("restore-trail-context", "Restore Trail Context", { variant: "primary" }),
      contextAction("preview", "Preview")
    ];
    if (meta.referenceId) actions.push(contextAction("open", "Open Reference"));
    if (meta.query) actions.push(contextAction("rerun-query", "Rerun Query"));
    if (meta.referenceId) actions.push(contextAction("copy-reference-id", "Copy Reference ID"));
    return {
      id: `context-trail-${event.id}`,
      targetType: "knowledge-trail-entry",
      eventId: event.id,
      refId: meta.referenceId || "",
      query: meta.query || "",
      title: event.label || event.type || "Research event",
      subtitle: `Knowledge trail · ${event.timestamp || "session"}`,
      metadata: [event.type, meta.referenceId ? `Reference ${meta.referenceId}` : "", meta.query ? `Query "${meta.query}"` : ""].filter(Boolean),
      iconPath: "assets/icons/scientific/memory-session/knowledge-trail.svg",
      position: point,
      actions
    };
  }

  function buildContextMenuPayload(trigger, point) {
    if (!trigger) return null;
    const targetType = getTargetTypeForTrigger(trigger);
    if (!targetType) return null;
    if (targetType === "graph-edge" || targetType === "relationship-chip") {
      return buildRelationshipContextMenuPayload(trigger, targetType, point);
    }
    if (targetType === "saved-query") {
      return buildQueryContextMenuPayload(trigger, point);
    }
    if (targetType === "knowledge-trail-entry") {
      return buildTrailContextMenuPayload(trigger, point);
    }
    return buildReferenceContextMenuPayload(trigger, targetType, point);
  }

  function openRelationshipById(relId) {
    const rel = getRelationshipById(relId);
    if (!rel) return;
    selectedRelationship = rel;
    addTrailEvent("inspect_rel", `Inspected relationship "${rel.sourceReferenceId} ➔ ${rel.targetReferenceId}"`, { relationship: rel });
    switchInspectorTab("relationship");
    renderRelationshipInspector();
    saveWorkspaceState();
    if (activeExplorationMode === "graph") renderVisualGraph();
  }

  function compileEvidenceFromReference(refId) {
    if (!refId) return;
    selectedReferenceId = refId;
    addToRecentlyViewed(refId);
    currentCompiledEvidence = adapter.compileEvidenceFromReference(retrievalState, refId);
    if (currentCompiledEvidence) addToTimeline(currentCompiledEvidence);
    addTrailEvent("compile_ref", `Compiled evidence from "${refId}" via context menu`, { referenceId: refId });
    switchInspectorTab("evidence");
    renderEvidence(currentCompiledEvidence);
    renderReferenceInspector();
    renderRelationshipInspector();
    renderMemoryLayer();
    saveWorkspaceState();
    syncSelectionHighlighting();
    if (activeExplorationMode === "graph") renderVisualGraph();
  }

  function exploreReferenceNeighborhood(refId) {
    if (!refId) return;
    selectedReferenceId = refId;
    selectedRelationship = null;
    addToRecentlyViewed(refId);
    shouldFitGraphViewport = true;
    if (neighborhoodDepth === "full") {
      neighborhoodDepth = "2-hop";
      const depthSelect = document.getElementById("graph-hop-select");
      if (depthSelect) depthSelect.value = neighborhoodDepth;
    }
    switchExplorationMode("graph");
    switchInspectorTab("reference");
    addTrailEvent("explore_neighborhood", `Explored neighborhood around "${refId}"`, { referenceId: refId });
    saveWorkspaceState();
    renderReferenceInspector();
    renderRelationshipInspector();
    renderVisualGraph();
  }

  function showCompareFeedback(message) {
    compareFeedback = message || "";
    const indicator = document.getElementById("session-restored-indicator");
    if (indicator && compareFeedback) {
      indicator.textContent = compareFeedback;
      indicator.style.opacity = "1";
      setTimeout(() => {
        if (indicator.textContent === compareFeedback) indicator.style.opacity = "0";
      }, 2200);
    }
    renderCompareMode();
  }

  function addToCompare(refId, { open = false } = {}) {
    if (!refId || !adapter.getReferenceById(retrievalState, refId)) return;
    if (compareSelection.includes(refId)) {
      showCompareFeedback("Reference already in compare tray.");
      if (open || compareSelection.length >= 2) switchExplorationMode("compare");
      return;
    }
    if (compareSelection.length >= 4) {
      showCompareFeedback("Compare supports up to 4 references. Remove one before adding another.");
      return;
    }
    compareSelection.push(refId);
    addTrailEvent("compare_add", `Added "${refId}" to compare`, { referenceId: refId });
    renderMemoryLayer();
    renderReferenceInspector();
    renderCompareMode();
    updateProgressiveFeatures();
    if (open || compareSelection.length >= 2) switchExplorationMode("compare");
    else showCompareFeedback("Added to compare. Add one more reference to open the workspace.");
  }

  function removeFromCompare(refId) {
    compareSelection = compareSelection.filter(id => id !== refId);
    addTrailEvent("compare_remove", `Removed "${refId}" from compare`, { referenceId: refId });
    renderCompareMode();
    renderMemoryLayer();
    renderReferenceInspector();
    updateProgressiveFeatures();
  }

  function focusCompareInGraph(refId) {
    if (!refId) return;
    selectedReferenceId = refId;
    addToRecentlyViewed(refId);
    shouldFitGraphViewport = true;
    switchExplorationMode("graph");
    switchInspectorTab("reference");
    addTrailEvent("compare_focus_graph", `Focused "${refId}" in graph from compare`, { referenceId: refId });
    saveWorkspaceState();
    renderReferenceInspector();
    renderVisualGraph();
  }

  function clearCompare() {
    compareSelection = [];
    compareFeedback = "";
    addTrailEvent("compare_clear", "Cleared compare tray", {});
    renderCompareMode();
    renderMemoryLayer();
    renderReferenceInspector();
    updateProgressiveFeatures();
  }

  function getEvidenceContribution(refId) {
    if (!currentCompiledEvidence) return null;
    const matched = currentCompiledEvidence.matchedReferences || [];
    const related = currentCompiledEvidence.relatedReferences || [];
    if (matched.some(ref => ref.id === refId)) {
      return { usedInCurrentEvidence: true, contributionLabel: "Primary contribution", contributionLevel: 4 };
    }
    if (related.some(ref => ref.id === refId)) {
      return { usedInCurrentEvidence: true, contributionLabel: "Supporting contribution", contributionLevel: 2 };
    }
    return { usedInCurrentEvidence: false, contributionLabel: "Not used in current evidence", contributionLevel: 1 };
  }

  function getCompareRelationshipLabel(rel, refId) {
    const otherId = rel.sourceReferenceId === refId ? rel.targetReferenceId : rel.sourceReferenceId;
    const other = adapter.getReferenceById(retrievalState, otherId);
    return `${String(rel.type || "related").replace(/_/g, " ")} · ${other ? other.title : otherId}`;
  }

  function getConnectedReferenceIds(refId) {
    const rels = adapter.getRelationshipsForReference(retrievalState, refId);
    const connected = new Set();
    rels.forEach(rel => {
      connected.add(rel.sourceReferenceId);
      connected.add(rel.targetReferenceId);
    });
    connected.delete(refId);
    return [...connected];
  }

  function buildComparePayload() {
    const refs = compareSelection
      .map(id => adapter.getReferenceById(retrievalState, id))
      .filter(Boolean)
      .slice(0, 4);
    const keywordSets = refs.map(ref => new Set((ref.keywords || []).map(keyword => String(keyword).toLowerCase())));
    const sharedConcepts = keywordSets.length >= 2
      ? [...keywordSets[0]].filter(keyword => keywordSets.every(set => set.has(keyword)))
      : [];
    const typeCounts = refs.reduce((acc, ref) => {
      acc[ref.type] = (acc[ref.type] || 0) + 1;
      return acc;
    }, {});
    const relationshipTypeSets = refs.map(ref => new Set(adapter.getRelationshipsForReference(retrievalState, ref.id).map(rel => rel.type)));
    const sharedRelationships = relationshipTypeSets.length >= 2
      ? [...relationshipTypeSets[0]].filter(type => relationshipTypeSets.every(set => set.has(type))).map(type => String(type).replace(/_/g, " "))
      : [];

    const sharedRelationshipTypes = sharedRelationships;

    const items = refs.map(ref => {
      const rels = adapter.getRelationshipsForReference(retrievalState, ref.id);
      const contribution = getEvidenceContribution(ref.id);
      return {
        id: ref.id,
        title: ref.title,
        type: ref.type,
        status: ref.status || "active",
        source: ref.source || "",
        summary: getReferenceDescription(ref),
        keywords: Array.isArray(ref.keywords) ? ref.keywords : [],
        relationshipCount: rels.length,
        clusterLabel: getClusterLabel(ref),
        evidenceContributionLabel: contribution?.contributionLabel || "",
        connectivityLabel: getConnectivityScoreLabel(rels.length),
        relatedRelationshipIds: rels.map(rel => rel.id),
        isPinned: pinnedReferences.includes(ref.id),
        canCompile: true,
        connectedReferenceIds: getConnectedReferenceIds(ref.id),
      };
    });

    const differences = refs.map(ref => {
      const rels = adapter.getRelationshipsForReference(retrievalState, ref.id);
      const otherRelLabels = new Set(refs
        .filter(other => other.id !== ref.id)
        .flatMap(other => adapter.getRelationshipsForReference(retrievalState, other.id).map(rel => getCompareRelationshipLabel(rel, other.id))));
      return {
        referenceId: ref.id,
        title: ref.title,
        uniqueConcepts: (ref.keywords || []).filter(keyword => !sharedConcepts.includes(String(keyword).toLowerCase())).slice(0, 6),
        uniqueRelationshipTypes: rels
          .map(rel => String(rel.type || "related").replace(/_/g, " "))
          .filter(type => !sharedRelationshipTypes.includes(type))
          .filter((type, i, arr) => arr.indexOf(type) === i)
          .slice(0, 6),
        uniqueConnectedReferences: getConnectedReferenceIds(ref.id).filter(cid => !refs.some(r => r.id === cid)).slice(0, 5),
        uniqueRelationships: rels.map(rel => getCompareRelationshipLabel(rel, ref.id)).filter(label => !otherRelLabels.has(label)).slice(0, 5),
      };
    });

    const graphContext = refs.map(ref => {
      const rels = adapter.getRelationshipsForReference(retrievalState, ref.id);
      return {
        referenceId: ref.id,
        title: ref.title,
        relationshipCount: rels.length,
        connectivityLabel: getConnectivityScoreLabel(rels.length),
        clusterLabel: getClusterLabel(ref),
        microvisualizationHtml: "",
      };
    });

    const evidenceContext = currentCompiledEvidence
      ? refs.map(ref => ({ referenceId: ref.id, title: ref.title, ...getEvidenceContribution(ref.id) }))
      : [];

    const allConnectedIds = new Set();
    refs.forEach(ref => {
      getConnectedReferenceIds(ref.id).forEach(cid => allConnectedIds.add(cid));
    });
    const sharedConnectedIds = [...allConnectedIds].filter(cid =>
      refs.every(ref => getConnectedReferenceIds(ref.id).includes(cid))
    );
    const commonNeighborhoodLabels = sharedConnectedIds
      .map(id => adapter.getReferenceById(retrievalState, id))
      .filter(Boolean)
      .map(r => r.title)
      .slice(0, 5);

    const sharedEvidenceReferenceIds = currentCompiledEvidence
      ? (currentCompiledEvidence.matchedReferences || []).filter(mr =>
          refs.some(ref => ref.id === mr.id)
        ).map(mr => mr.id)
      : [];

    return {
      items,
      shared: {
        concepts: sharedConcepts,
        types: Object.entries(typeCounts).filter(([, count]) => count > 1).map(([type]) => type),
        relationships: sharedRelationships,
      },
      convergence: {
        sharedConcepts,
        sharedRelationshipTypes: sharedRelationships,
        sharedEvidenceReferenceIds,
        commonNeighborhoodLabels,
      },
      semanticDiff: {
        uniqueByReference: refs.map(ref => {
          const diff = differences.find(d => d.referenceId === ref.id);
          return {
            referenceId: ref.id,
            title: ref.title,
            uniqueConcepts: diff?.uniqueConcepts || [],
            uniqueRelationshipTypes: diff?.uniqueRelationshipTypes || [],
            uniqueConnectedReferences: diff?.uniqueConnectedReferences || [],
          };
        }),
      },
      evidenceOverlap: {
        hasActiveEvidence: Boolean(currentCompiledEvidence),
        contributors: refs.map(ref => ({
          referenceId: ref.id,
          title: ref.title,
          ...getEvidenceContribution(ref.id),
        })),
      },
      graphSync: {
        activeCompareReferenceId: "",
        graphModeActive: activeExplorationMode === "graph",
        visibleInGraphReferenceIds: refs.map(ref => ref.id),
      },
      differences,
      graphContext,
      evidenceContext,
      feedback: compareFeedback,
      limit: 4,
      actions: {
        canSaveCompareSet: false,
        canCompileFromSet: refs.length >= 1,
        canFocusGraph: refs.length >= 1,
      },
    };
  }

  function deriveSynthesisConfidence(sharedConcepts, overlappingRels, evidenceRefs) {
    const conceptCount = sharedConcepts.length;
    const relOverlap = overlappingRels.length;
    const evidenceCount = evidenceRefs.length;
    if (conceptCount >= 2 && (relOverlap >= 2 || evidenceCount >= 1)) return "High Support";
    if (conceptCount >= 1 || relOverlap >= 1 || evidenceCount >= 1) return "Moderate Support";
    return "Limited Support";
  }

  function buildCompareSynthesisPayload() {
    const refs = compareSelection
      .map(id => adapter.getReferenceById(retrievalState, id))
      .filter(Boolean)
      .slice(0, 4);

    if (refs.length === 0) return null;

    const keywordSets = refs.map(ref => new Set((ref.keywords || []).map(keyword => String(keyword).toLowerCase())));
    const sharedConcepts = keywordSets.length >= 2
      ? [...keywordSets[0]].filter(keyword => keywordSets.every(set => set.has(keyword)))
      : [];

    const relationshipTypeSets = refs.map(ref =>
      new Set(adapter.getRelationshipsForReference(retrievalState, ref.id).map(rel => rel.type)));
    const overlappingRelationships = relationshipTypeSets.length >= 2
      ? [...relationshipTypeSets[0]].filter(type => relationshipTypeSets.every(set => set.has(type))).map(type => String(type).replace(/_/g, " "))
      : [];

    const evidenceRefs = currentCompiledEvidence
      ? [...(currentCompiledEvidence.matchedReferences || []), ...(currentCompiledEvidence.relatedReferences || [])].filter(mr => refs.some(r => r.id === mr.id))
      : [];

    const sharedSupport = refs.filter(ref => {
      if (refs.length < 2) return false;
      const rels = adapter.getRelationshipsForReference(retrievalState, ref.id);
      const connectedIds = new Set();
      rels.forEach(rel => { connectedIds.add(rel.sourceReferenceId); connectedIds.add(rel.targetReferenceId); });
      connectedIds.delete(ref.id);
      const shareConcepts = (ref.keywords || []).some(keyword => sharedConcepts.includes(String(keyword).toLowerCase()));
      const shareRels = overlappingRelationships.length > 0 && relationshipTypeSets.find(rs => rs.has(ref.type));
      const inEvidence = evidenceRefs.some(er => er.id === ref.id);
      return shareConcepts || shareRels || inEvidence;
    }).map(ref => {
      const rels = adapter.getRelationshipsForReference(retrievalState, ref.id);
      const relTypes = [...new Set(rels.map(rel => String(rel.type || "related").replace(/_/g, " ")))];
      const sharedRels = relTypes.filter(rt => overlappingRelationships.includes(rt));
      const inEvidence = evidenceRefs.some(er => er.id === ref.id);
      const shareConcepts = (ref.keywords || []).filter(keyword => sharedConcepts.includes(String(keyword).toLowerCase())).length;
      let contributionLabel = "Context";
      if (inEvidence && shareConcepts >= 2) contributionLabel = "Primary";
      else if (inEvidence) contributionLabel = "Supporting";
      else if (shareConcepts >= 1 || sharedRels.length >= 1) contributionLabel = "Supporting";
      else contributionLabel = "Minor";
      return {
        referenceId: ref.id,
        title: ref.title,
        type: ref.type,
        sharedConcepts: (ref.keywords || []).filter(keyword => sharedConcepts.includes(String(keyword).toLowerCase())).slice(0, 6),
        relationshipTypes: sharedRels.slice(0, 4),
        contributionLabel,
      };
    });

    const divergenceThreshold = refs.length > 2 ? 2 : 0;
    const divergentNotes = refs.map(ref => {
      const uniqueConcepts = (ref.keywords || []).filter(keyword => !sharedConcepts.includes(String(keyword).toLowerCase())).slice(0, 4);
      const rels = adapter.getRelationshipsForReference(retrievalState, ref.id);
      const connectedIds = new Set();
      rels.forEach(rel => { connectedIds.add(rel.sourceReferenceId); connectedIds.add(rel.targetReferenceId); });
      connectedIds.delete(ref.id);
      const uniqueRelationships = [...connectedIds].filter(cid => !refs.some(other => other.id === cid)).slice(0, 3);
      if (uniqueConcepts.length <= divergenceThreshold && uniqueRelationships.length === 0) return null;
      const note = uniqueConcepts.length > 2
        ? "This reference adds unique context not shared across the whole compare set."
        : "Limited unique context from this reference.";
      return {
        referenceId: ref.id,
        title: ref.title,
        uniqueConcepts,
        uniqueRelationships: uniqueRelationships.map(id => {
          const target = adapter.getReferenceById(retrievalState, id);
          return target ? target.title : id;
        }),
        note,
      };
    }).filter(Boolean);

    const contributionMap = refs.map(ref => {
      const inEvidence = evidenceRefs.some(er => er.id === ref.id);
      const shareConcepts = (ref.keywords || []).filter(keyword => sharedConcepts.includes(String(keyword).toLowerCase())).length;
      const rels = adapter.getRelationshipsForReference(retrievalState, ref.id);
      const allRels = [...new Set(rels.map(rel => String(rel.type).replace(/_/g, " ")))];
      const sharedRels = allRels.filter(rt => overlappingRelationships.includes(rt));
      let contributionLabel = "Context";
      let contributionLevel = 1;
      if (inEvidence && shareConcepts >= 2) { contributionLabel = "Primary"; contributionLevel = 4; }
      else if (inEvidence) { contributionLabel = "Supporting"; contributionLevel = 3; }
      else if (shareConcepts >= 1 || sharedRels.length >= 1) { contributionLabel = "Supporting"; contributionLevel = 2; }
      return {
        referenceId: ref.id,
        title: ref.title,
        contributionLabel,
        contributionLevel,
        basis: inEvidence ? "In active evidence" : shareConcepts >= 1 ? `Shared ${shareConcepts} concept${shareConcepts === 1 ? "" : "s"}` : "Graph context only",
      };
    });

    const confidence = deriveSynthesisConfidence(sharedConcepts, overlappingRelationships, evidenceRefs);
    const summaryText = refs.length >= 2
      ? `This comparative synthesis is based on ${refs.length} selected references. The set shares ${sharedConcepts.length} concept${sharedConcepts.length === 1 ? "" : "s"} and ${overlappingRelationships.length} relationship pattern${overlappingRelationships.length === 1 ? "" : "s"}. Evidence support is strongest where references overlap through shared concepts and direct graph relationships.`
      : `Comparative synthesis requires at least two references in the compare set. Add more references to generate richer synthesis.`;

    const id = `comp-synth-${Date.now()}`;
    const createdAt = new Date().toISOString();

    return {
      id,
      createdAt,
      compareSet: refs.map(ref => ({
        id: ref.id,
        title: ref.title,
        type: ref.type,
        source: ref.source || "",
        keywords: Array.isArray(ref.keywords) ? ref.keywords.slice(0, 6) : [],
        relationshipCount: adapter.getRelationshipsForReference(retrievalState, ref.id).length,
        clusterLabel: getClusterLabel(ref),
      })),
      summary: {
        title: `Comparative Synthesis: ${refs.length} references`,
        text: summaryText,
        basis: "compare-set",
      },
      sharedSupport,
      divergentNotes,
      contributionMap,
      confidence: {
        label: confidence,
        rationale: confidence === "High Support"
          ? "At least 2 shared concepts and overlapping relationships or active evidence overlap."
          : confidence === "Moderate Support"
            ? "At least 1 shared concept or relationship overlap detected."
            : "Limited overlap in available metadata. Use as exploratory context.",
      },
      provenance: {
        comparedReferences: refs.length,
        sharedConceptCount: sharedConcepts.length,
        relationshipOverlapCount: overlappingRelationships.length,
        evidenceSourceCount: evidenceRefs.length,
        generatedFrom: "compare-set",
      },
      actions: {
        canOpenReferences: true,
        canReturnToCompare: true,
        canCopyBlock: true,
        canExport: false,
      },
    };
  }

  function compileCompareSynthesis() {
    const payload = buildCompareSynthesisPayload();
    if (!payload) return;
    compareSynthesis = payload;
    addTrailEvent("compare_synthesis", `Compiled comparative evidence from ${payload.provenance.comparedReferences} references`, {});
    saveWorkspaceState();
    renderCompareMode();
  }

  function clearCompareSynthesis() {
    compareSynthesis = null;
    saveWorkspaceState();
    renderCompareMode();
  }

  function buildSynthesisTextBlock() {
    const syn = compareSynthesis;
    if (!syn) return "";
    const lines = [
      `=== Comparative Evidence Synthesis ===`,
      syn.summary.title,
      syn.summary.text,
      ``,
      `Confidence: ${syn.confidence.label}`,
      `${syn.confidence.rationale}`,
      ``,
      `=== Compared References ===`,
      ...syn.compareSet.map((r, i) => `${i + 1}. ${r.title} (${r.type || "reference"}) — ${r.relationshipCount} relationships`),
      ``,
      `Shared concepts: ${syn.shared.concepts?.join(", ") || "none"}`,
      `Shared relationship patterns: ${syn.shared.relationships?.join(", ") || "none"}`,
      ``,
      `=== Shared Support ===`,
      ...syn.sharedSupport.map(s => `- ${s.title}: ${s.contributionLabel} — concepts: ${s.sharedConcepts.join(", ") || "none"}`),
      ``,
      `=== Divergent Notes ===`,
      ...syn.divergentNotes.map(d => `- ${d.title}: ${d.note}`),
      ``,
      `=== Provenance ===`,
      `References: ${syn.provenance.comparedReferences}`,
      `Generated: ${syn.createdAt}`,
    ];
    return lines.join("\n");
  }

  function compareReference(refId) {
    if (!refId) return;
    addToCompare(refId, { open: true });
  }

  function restoreTrailContextById(eventId) {
    const event = knowledgeTrail.find(item => item.id === eventId);
    if (event) restoreTrailContext(event);
  }

  async function copyContextValue(value) {
    if (!value) return;
    try {
      await navigator.clipboard?.writeText?.(value);
    } catch (err) {
      if (window.NV_DEBUG) console.warn("Clipboard copy unavailable:", err);
    }
  }

  function executeContextMenuAction(actionId, payload, trigger) {
    if (!actionId || !payload) return;
    const refId = payload.refId;
    const relId = payload.relationshipId;
    if (richPreviewController) richPreviewController.hide();

    if (actionId === "open") {
      if (refId) selectReference(refId);
    } else if (actionId === "preview") {
      if (richPreviewController && trigger) {
        window.setTimeout(() => richPreviewController.show(trigger, true), 0);
      }
    } else if (actionId === "pin") {
      pinReference(refId);
    } else if (actionId === "unpin") {
      unpinReference(refId);
    } else if (actionId === "compare") {
      compareReference(refId);
    } else if (actionId === "compile-evidence") {
      compileEvidenceFromReference(refId);
    } else if (actionId === "explore-neighborhood") {
      exploreReferenceNeighborhood(refId);
    } else if (actionId === "follow-source") {
      selectReference(payload.sourceReferenceId);
    } else if (actionId === "follow-target") {
      selectReference(payload.targetReferenceId);
    } else if (actionId === "open-relationship") {
      openRelationshipById(relId);
    } else if (actionId === "rerun-query") {
      const query = payload.query;
      const searchInput = document.getElementById("playground-search-input");
      if (searchInput) searchInput.value = query;
      runSearch(query, true);
    } else if (actionId === "restore-trail-context") {
      restoreTrailContextById(payload.eventId);
    } else if (actionId === "copy-reference-id") {
      copyContextValue(refId);
    } else if (actionId === "copy-query") {
      copyContextValue(payload.query);
    } else if (actionId === "copy-relationship-id") {
      copyContextValue(relId);
    }
  }

  function createContextMenuController() {
    let layer = document.querySelector(".nv-context-menu-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "nv-context-menu-layer";
      document.body.appendChild(layer);
    }

    let root = layer.querySelector(".nv-react-context-menu-root");
    if (!root) {
      root = document.createElement("div");
      root.className = "nv-react-context-menu-root";
      layer.appendChild(root);
    }

    let activeTrigger = null;
    let activePayload = null;

    const getReactIsland = () => {
      const reactLayer = window.NeuralVerse?.react;
      if (!reactLayer?.bridge || !reactLayer?.islands?.NvContextMenu) return null;
      return reactLayer;
    };

    const getTrigger = (target) => {
      if (!target?.closest) return null;
      return target.closest([
        "[data-context-menu-trigger]",
        ".graph-node[data-id]",
        ".graph-link-target[data-rel-id]",
        ".nv-discovery-panel[data-ref-id]",
        ".nv-card[data-ref-id]",
        ".memory-item[data-ref-id]",
        ".clickable-lineage-node[data-id]",
        "button[data-action='open-supporting'][data-id]",
        ".nv-card[data-rel-id]",
        ".clickable-evidence-rel[data-id]",
        ".memory-item[data-query]",
        ".trail-event[data-event-id]"
      ].join(","));
    };

    const getPointForTrigger = (trigger, event) => {
      if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
        return { x: event.clientX, y: event.clientY };
      }
      const rect = trigger.getBoundingClientRect();
      return { x: rect.left + Math.min(rect.width, 36), y: rect.bottom + 8 };
    };

    const positionMenu = (point) => {
      const menu = layer.querySelector(".nv-context-menu");
      if (!menu) return;
      const padding = 14;
      const rect = menu.getBoundingClientRect();
      let left = point.x;
      let top = point.y;
      if (left + rect.width > window.innerWidth - padding) left = point.x - rect.width;
      if (top + rect.height > window.innerHeight - padding) top = point.y - rect.height;
      left = Math.max(padding, Math.min(left, window.innerWidth - rect.width - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - rect.height - padding));
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
    };

    const hide = (restoreFocus = false) => {
      const triggerToRestore = activeTrigger;
      const reactLayer = getReactIsland();
      if (reactLayer) reactLayer.bridge.unmount(root);
      layer.classList.remove("is-visible");
      activeTrigger = null;
      activePayload = null;
      root.innerHTML = "";
      if (restoreFocus && triggerToRestore?.focus) triggerToRestore.focus();
    };

    const open = (trigger, event) => {
      const reactLayer = getReactIsland();
      if (!reactLayer || !trigger) return false;
      const point = getPointForTrigger(trigger, event);
      const payload = buildContextMenuPayload(trigger, point);
      if (!payload || !payload.actions?.length) return false;

      if (richPreviewController) richPreviewController.hide();
      activeTrigger = trigger;
      activePayload = payload;
      layer.classList.add("is-visible");
      reactLayer.bridge.mount(root, reactLayer.islands.NvContextMenu, {
        data: payload,
        callbacks: {
          onAction: (actionId, currentPayload) => {
            const payloadToUse = currentPayload || activePayload;
            const triggerToUse = activeTrigger;
            hide(false);
            executeContextMenuAction(actionId, payloadToUse, triggerToUse);
          },
          onClose: () => hide(true)
        }
      });
      window.requestAnimationFrame(() => positionMenu(point));
      return true;
    };

    document.addEventListener("contextmenu", (event) => {
      const trigger = getTrigger(event.target);
      if (!trigger) return;
      if (open(trigger, event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    document.addEventListener("click", (event) => {
      const explicitTrigger = event.target.closest?.("[data-context-menu-trigger]");
      if (explicitTrigger) {
        if (open(explicitTrigger, event)) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      if (layer.classList.contains("is-visible") && !layer.contains(event.target)) {
        hide(false);
      }
    }, true);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && layer.classList.contains("is-visible")) {
        event.preventDefault();
        event.stopPropagation();
        hide(true);
        return;
      }
      const isContextKey = event.key === "ContextMenu" || event.key === "F10" || (event.shiftKey && event.key === "F10");
      if (!isContextKey) return;
      const trigger = getTrigger(event.target);
      if (!trigger) return;
      if (open(trigger, event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);

    document.addEventListener("scroll", () => {
      if (layer.classList.contains("is-visible")) hide(false);
    }, true);
    window.addEventListener("resize", () => hide(false));
    window.addEventListener("hashchange", () => hide(false));

    return { hide, open };
  }

  function clampGraphScale(scale) {
    return Math.max(0.3, Math.min(4.0, scale));
  }

  function setGraphViewport(nextViewport, shouldSave = true) {
    const minX = -1200;
    const maxX = 1200;
    const minY = -1200;
    const maxY = 1200;
    graphViewport = {
      x: Math.max(minX, Math.min(maxX, Number.isFinite(nextViewport.x) ? nextViewport.x : 0)),
      y: Math.max(minY, Math.min(maxY, Number.isFinite(nextViewport.y) ? nextViewport.y : 0)),
      scale: clampGraphScale(Number.isFinite(nextViewport.scale) ? nextViewport.scale : 1)
    };
    const world = document.querySelector("#visual-graph-svg .graph-world");
    if (world) {
      world.setAttribute("transform", `translate(${graphViewport.x} ${graphViewport.y}) scale(${graphViewport.scale})`);
    }
    if (shouldSave) saveWorkspaceState();
  }

  function resetGraphViewport(shouldRender = false) {
    shouldFitGraphViewport = true;
    setGraphViewport({ x: 0, y: 0, scale: 1 });
    if (shouldRender) renderVisualGraph();
  }

  function runTransientClass(element, className, duration) {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth; // force reflow
    element.classList.add(className);
    setTimeout(() => {
      element.classList.remove(className);
    }, duration);
  }

  function setButtonBusy(button, busyText, callback) {
    if (!button) {
      callback();
      return;
    }
    const originalContent = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="is-loading-spinner"></span> ${busyText}`;
    button.classList.add("is-loading");

    setTimeout(() => {
      button.classList.remove("is-loading");
      button.innerHTML = `<span class="is-loading-check">✓</span> Updated`;
      button.classList.add("is-success");

      callback();

      setTimeout(() => {
        button.classList.remove("is-success");
        button.innerHTML = originalContent;
        button.disabled = false;
      }, 1000);
    }, 220);
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
        graphLabelMode = state.graphLabelMode || "context";
        graphFocusMode = state.graphFocusMode || "follow";
        graphViewport = state.graphViewport || { x: 0, y: 0, scale: 1 };
        evidenceTimeline = state.evidenceTimeline || [];
        compareSelection = state.compareSelection || [];
        compareFeedback = state.compareFeedback || "";
        compareSynthesis = state.compareSynthesis || null;

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

        if (lastActiveTimestamp > 0) {
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
    graphLabelMode = "context";
    graphFocusMode = "follow";
    graphViewport = { x: 0, y: 0, scale: 1 };
    evidenceTimeline = [];
    compareSelection = [];
    compareFeedback = "";
    compareSynthesis = null;

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
        graphLabelMode,
        graphFocusMode,
        graphViewport,
        evidenceTimeline,
        compareSelection,
        compareFeedback,
        compareSynthesis,
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
      indicator.textContent = "Previous research restored";
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
        focusBtn.setAttribute("aria-pressed", "true");
      }
    } else {
      body.classList.remove("nv-focus-mode");
      if (focusBtn) {
        focusBtn.textContent = "Focus Mode";
        focusBtn.setAttribute("data-variant", "secondary");
        focusBtn.setAttribute("aria-pressed", "false");
      }
    }
  }

  function applyMemoryCollapseStyles() {
    const memorySection = document.getElementById("memory-layer-section");
    const memoryGrid = document.getElementById("memory-layer-grid");
    const collapseBtn = document.getElementById("memory-toggle-collapse-button");
    if (memoryGrid) {
      memoryGrid.classList.add("nv-motion", "nv-motion-collapse");
      memoryGrid.setAttribute("data-expanded", String(!memoryPanelCollapsed));
      memoryGrid.setAttribute("aria-hidden", String(memoryPanelCollapsed));
    }
    if (memorySection) {
      if (memoryPanelCollapsed) {
        memorySection.classList.add("collapsed");
        if (collapseBtn) {
          collapseBtn.textContent = "Expand Layer";
          collapseBtn.setAttribute("aria-expanded", "false");
        }
      } else {
        memorySection.classList.remove("collapsed");
        if (collapseBtn) {
          collapseBtn.textContent = "Collapse Layer";
          collapseBtn.setAttribute("aria-expanded", "true");
        }
      }
    }
  }

  function toggleMemoryPanelCollapsed() {
    memoryPanelCollapsed = !memoryPanelCollapsed;
    applyMemoryCollapseStyles();
    saveWorkspaceState();
    renderMemoryLayer();
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

  // Live Research Snapshot — simplified to Current Investigation summary
  function renderResearchSnapshot() {
    const container = document.getElementById("research-snapshot-container");
    if (!container) return;

    const selectedRef = selectedReferenceId ? adapter.getReferenceById(retrievalState, selectedReferenceId) : null;
    const hasContext = Boolean(currentSearchQuery || selectedRef || currentCompiledEvidence);

    container.innerHTML = `
      <div class="nv-workspace-dashboard-fallback" style="padding: var(--sys-space-stack-sm) 0;">
        <div class="nv-stack nv-stack--gap-xs">
          <span class="nv-muted" style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;">Current Investigation</span>
          <div style="font-size: var(--sys-font-body-size); color: var(--sys-color-text-primary);">
            ${currentSearchQuery ? `<div><strong>Query:</strong> ${escapeHtml(currentSearchQuery)}</div>` : ""}
            ${selectedRef ? `<div><strong>Reference:</strong> ${escapeHtml(selectedRef.title)}</div>` : ""}
            ${currentCompiledEvidence ? `<div><strong>Evidence:</strong> ${currentCompiledEvidence.matchedReferences?.length || 0} sources</div>` : ""}
            ${!hasContext ? '<div class="nv-muted" style="font-size: 0.7rem;">No active investigation. Search or select a reference to begin.</div>' : ""}
          </div>
          <span class="nv-muted" style="font-size: 0.65rem;">Mode: ${activeExplorationMode || "search"}</span>
        </div>
      </div>
    `;
  }

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
                  <button class="nv-card compact-action-card" data-empty-ref="${escapeHtml(ref.id)}">
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
                <button class="nv-button" data-empty-query="${escapeHtml(q)}" data-variant="secondary" style="text-align: left; padding: 4px 8px; font-size: 0.65rem; width: 100%; min-block-size: unset;">
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
                  <button class="nv-card compact-action-card" data-empty-ref="${escapeHtml(ref.id)}">
                    ${escapeHtml(ref.title)}
                  </button>
                ` : "";
              }).join("")}
            </div>
          </div>
        `;
      }

      resultsContainer.innerHTML = `
        <div class="nv-empty-state-shell">
          ${createRichEmptyState({
            icon: "search",
            title: "Start a new investigation",
            explanation: "Search references, models, papers, or research notes to begin exploration.",
            primaryAction: {
              id: "smart-empty-focus-search",
              label: "Focus search input",
              onclick: ""
            },
            secondaryAction: (pinnedReferences.length || recentReferences.length || savedQueries.length) ? {
              id: "smart-empty-run-saved-query",
              label: "Open recent research",
              onclick: ""
            } : null
          })}
          ${pinnedSection || recentQuerySection || recentRefSection ? `
          <div class="nv-empty-state__continuations">
            ${pinnedSection}
            ${recentQuerySection}
            ${recentRefSection}
          </div>
          ` : ""}
        </div>
      `;

      resultsContainer.querySelectorAll("[data-empty-ref]").forEach(button => {
        button.onclick = () => selectReference(button.getAttribute("data-empty-ref"));
      });
      resultsContainer.querySelectorAll("[data-empty-query]").forEach(button => {
        button.onclick = () => {
          const query = button.getAttribute("data-empty-query");
          const searchInput = document.getElementById("playground-search-input");
          if (searchInput) searchInput.value = query;
          runSearch(query, true);
        };
      });
      const focusSearchButton = document.getElementById("smart-empty-focus-search");
      if (focusSearchButton) {
        focusSearchButton.onclick = () => document.getElementById("playground-search-input")?.focus();
      }
      const runSavedQueryButton = document.getElementById("smart-empty-run-saved-query");
      if (runSavedQueryButton) {
        runSavedQueryButton.onclick = () => {
          if (savedQueries.length > 0) {
            const query = savedQueries[0];
            const searchInput = document.getElementById("playground-search-input");
            if (searchInput) searchInput.value = query;
            runSearch(query, true);
            return;
          }
          if (pinnedReferences.length > 0) {
            selectReference(pinnedReferences[0]);
            return;
          }
          if (recentReferences.length > 0) {
            selectReference(recentReferences[0]);
          }
        };
      }
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
      if ((pinnedReferences && pinnedReferences.length >= 2) || compareSelection.length > 0) {
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

  // Reusable official scientific icons for empty states
  function getSvgMotif(name) {
    const icons = {
      search: "assets/icons/scientific/search-discovery/search-constellation.svg",
      no_results: "assets/icons/scientific/search-discovery/research-lens.svg",
      graph: "assets/icons/scientific/knowledge-graph/knowledge-cluster.svg",
      discovery: "assets/icons/scientific/search-discovery/discovery-beacon.svg",
      evidence: "assets/icons/scientific/evidence/evidence-convergence.svg",
      relationship: "assets/icons/scientific/knowledge-graph/citation-bridge.svg",
      compare: "assets/icons/scientific/knowledge-graph/semantic-path.svg",
      memory: "assets/icons/scientific/memory-session/research-archive.svg",
      pinned: "assets/icons/scientific/collections/pinned-references.svg",
      recent: "assets/icons/scientific/memory-session/recent-activity.svg",
      queries: "assets/icons/scientific/collections/saved-queries.svg",
      trail: "assets/icons/scientific/memory-session/session-timeline.svg",
      presentation: "assets/icons/scientific/inspector/reference-details.svg",
      snapshot: "assets/icons/scientific/memory-session/workspace-snapshot.svg",
      settings: "assets/icons/scientific/inspector/metadata-panel.svg",
    };
    const iconPath = icons[name] || icons.search;
    const resolvedIconPath = resolveAssetPath(iconPath);
    return `
      <span
        class="nv-empty-illustration nv-scientific-icon nv-scientific-icon--xl"
        style="--nv-scientific-icon-url: url('${resolvedIconPath}')"
        aria-hidden="true"
      ></span>
    `;
  }

  // Reusable empty-state visual system helper
  function createRichEmptyState(config) {
    const variantClass = config.variant ? `nv-empty-state--${config.variant}` : '';
    const compactClass = config.compact ? 'nv-empty-state--compact' : '';
    const panelClass = config.panel ? 'nv-empty-state--panel' : '';

    const svgMotif = getSvgMotif(config.motif || config.icon);

    let actionsHtml = '';
    if (config.primaryAction || config.secondaryAction) {
      actionsHtml = `
        <div class="nv-empty-state__actions">
          ${config.primaryAction ? `
            <button class="nv-button nv-empty-state__action" id="${config.primaryAction.id || ''}" data-variant="primary" ${typeof config.primaryAction.onclick === 'string' && config.primaryAction.onclick ? `onclick="${config.primaryAction.onclick}"` : ''}>
              ${escapeHtml(config.primaryAction.label || '')}
            </button>
          ` : ''}
          ${config.secondaryAction ? `
            <button class="nv-button nv-empty-state__action" id="${config.secondaryAction.id || ''}" data-variant="secondary" ${typeof config.secondaryAction.onclick === 'string' && config.secondaryAction.onclick ? `onclick="${config.secondaryAction.onclick}"` : ''}>
              ${escapeHtml(config.secondaryAction.label || '')}
            </button>
          ` : ''}
        </div>
      `;
    }

    return `
      <div class="nv-empty-state ${variantClass} ${compactClass} ${panelClass} nv-motion nv-motion-slide-reveal" role="status" aria-label="${escapeHtml(config.title || 'Empty state')}">
        ${svgMotif ? `<div class="nv-empty-state__visual" aria-hidden="true">${svgMotif}</div>` : ''}
        <h4 class="nv-empty-state__title">${escapeHtml(config.title || '')}</h4>
        <p class="nv-empty-state__message">${escapeHtml(config.explanation || config.message || '')}</p>
        ${actionsHtml}
      </div>
    `;
  }

  // Helper: Add knowledge trail event log
  let _trailCounter = 0;
  function addTrailEvent(type, label, metadata = null) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    _trailCounter += 1;
    const event = {
      id: 'trail_' + Date.now() + '_' + _trailCounter.toString(36),
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
      container.innerHTML = createRichEmptyState({
        icon: "no_results",
        title: "No references found",
        explanation: "No references match the current search. Try broader terms or reopen a saved query.",
        primaryAction: {
          id: "search-empty-clear-button",
          label: "Clear search",
          onclick: "document.getElementById('playground-search-input').value = ''; window.runSearch('');"
        },
        secondaryAction: savedQueries.length > 0 ? {
          id: "search-empty-saved-query-button",
          label: "Open saved queries",
          onclick: "const qEl = document.getElementById('memory-queries-list'); if (qEl) qEl.scrollIntoView({ behavior: 'smooth' });"
        } : null
      });
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
          <div class="nv-cluster nv-cluster--gap-xs" style="justify-content: flex-end;">
            <button class="nv-button search-card-compare-btn" data-id="${res.reference.id}" data-variant="secondary" style="padding: 4px 10px; font-size: 0.7rem; min-block-size: unset;" aria-label="Add ${escapeHtml(res.reference.title)} to compare">
              Compare
            </button>
            <button class="nv-button search-card-compile-btn" data-id="${res.reference.id}" data-variant="primary" style="padding: 4px 10px; font-size: 0.7rem; min-block-size: unset;" aria-label="Compile evidence for ${escapeHtml(res.reference.title)}">
              Compile
            </button>
          </div>
        </div>
      `;
    }).join("");

    bindSelectionClicks(container);
  }

  function renderLocalConstellationMinimap(ref, rels) {
    if (!ref) return "";
    const activeId = ref.id;
    const neighbors = [];
    const seen = new Set();
    rels.forEach(rel => {
      const isOutgoing = rel.sourceReferenceId === activeId;
      const neighborId = isOutgoing ? rel.targetReferenceId : rel.sourceReferenceId;
      if (!seen.has(neighborId)) {
        seen.add(neighborId);
        const neighborRef = adapter.getReferenceById(retrievalState, neighborId);
        if (neighborRef) {
          neighbors.push({
            id: neighborId,
            title: neighborRef.title,
            type: neighborRef.type,
            relType: rel.type
          });
        }
      }
    });

    const width = 240;
    const height = 120;
    const cx = width / 2;
    const cy = height / 2;

    let svgContent = "";

    // Draw edges first
    neighbors.forEach((n, index) => {
      const angle = (index * 2 * Math.PI) / neighbors.length;
      const nx = cx + Math.cos(angle) * 40;
      const ny = cy + Math.sin(angle) * 40;
      svgContent += `
        <line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}"
              stroke="var(--sys-color-border-subtle)"
              stroke-width="1.2"
              stroke-opacity="0.6" />
      `;
    });

    // Draw active node (center)
    svgContent += `
      <circle cx="${cx}" cy="${cy}" r="7"
              fill="var(--sys-color-accent-primary)"
              stroke="var(--sys-color-text-primary)"
              stroke-width="1.5"
              role="img"
              aria-label="Active Node: ${escapeHtml(ref.title)}" />
      <text x="${cx}" y="${cy - 10}"
            fill="var(--sys-color-text-primary)"
            font-size="8"
            font-weight="bold"
            text-anchor="middle">Active</text>
    `;

    // Draw neighbors
    neighbors.forEach((n, index) => {
      const angle = (index * 2 * Math.PI) / neighbors.length;
      const nx = cx + Math.cos(angle) * 40;
      const ny = cy + Math.sin(angle) * 40;

      let color = "var(--sys-color-surface-container-high)";
      if (n.type === "paper") {
        color = "color-mix(in srgb, var(--sys-color-accent-primary) 62%, var(--sys-color-surface-container-high))";
      } else if (n.type === "repository") {
        color = "color-mix(in srgb, var(--sys-color-warning) 58%, var(--sys-color-surface-container-high))";
      } else if (n.type === "notes") {
        color = "color-mix(in srgb, var(--sys-color-success) 58%, var(--sys-color-surface-container-high))";
      }

      svgContent += `
        <g class="minimap-node"
           data-id="${escapeHtml(n.id)}"
           tabindex="0"
           role="button"
           aria-label="Neighbor: ${escapeHtml(n.title)}. Click to view."
           style="cursor: pointer; outline: none;">
          <circle cx="${nx}" cy="${ny}" r="5"
                  fill="${color}"
                  stroke="var(--sys-color-border-strong)"
                  stroke-width="1" />
        </g>
      `;
    });

    return `
      <div class="local-constellation-minimap" style="margin-top: 10px; border-top: var(--sys-border-subtle) solid var(--sys-color-border-subtle); padding-top: 8px;">
        <h5 style="margin: 0 0 6px 0; font-size: 0.65rem; text-transform: uppercase; color: var(--sys-color-text-secondary); letter-spacing: 0.05em;">Local Constellation Minimap</h5>
        <div style="background-color: var(--sys-color-surface-container-lowest); border: 1px dashed var(--sys-color-border-subtle); border-radius: var(--ref-radius-soft); padding: 4px; display: flex; justify-content: center; align-items: center;">
          <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="display: block; overflow: visible;">
            ${svgContent}
          </svg>
        </div>
      </div>
    `;
  }

  // DOM Rendering: Reference Inspector Panel
  function renderReferenceInspector() {
    const container = document.getElementById("selected-reference-container");
    const pinBtn = document.getElementById("playground-pin-button");
    const compileRefBtn = document.getElementById("playground-compile-ref-button");
    if (!container) return;

    if (!selectedReferenceId) {
      container.innerHTML = createRichEmptyState({
        icon: "search",
        title: "No reference selected",
        explanation: "Choose a result, graph node, or memory item to inspect its details.",
        primaryAction: {
          label: "Focus Search",
          onclick: "document.getElementById('playground-search-input').focus();"
        }
      });
      if (pinBtn) pinBtn.disabled = true;
      if (compileRefBtn) compileRefBtn.disabled = true;
      runTransientClass(container, "is-updated", 200);
      renderDiscoverySpace();
      renderRelationshipNeighborhood();
      return;
    }

    const ref = adapter.getReferenceById(retrievalState, selectedReferenceId);
    if (!ref) {
      container.innerHTML = createRichEmptyState({
        icon: "no_results",
        title: "Reference not found",
        explanation: "Selected reference details could not be loaded from registry.",
        primaryAction: {
          label: "Return to Search",
          onclick: "window.switchExplorationMode('search'); document.getElementById('playground-search-input').focus();"
        }
      });
      if (pinBtn) pinBtn.disabled = true;
      if (compileRefBtn) compileRefBtn.disabled = true;
      runTransientClass(container, "is-updated", 200);
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

        <div class="nv-cluster nv-cluster--gap-xs">
          <button id="reference-add-compare-button" class="nv-button" data-variant="secondary" style="font-size: var(--sys-font-caption-size); padding: 4px 8px; min-block-size: unset;">
            ${compareSelection.includes(ref.id) ? "In Compare" : "Add to Compare"}
          </button>
        </div>

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

    runTransientClass(container, "is-updated", 200);

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

    // Bind minimap node clicks
    container.querySelectorAll(".minimap-node[data-id]").forEach(node => {
      node.onclick = (e) => {
        e.stopPropagation();
        const refId = node.getAttribute("data-id");
        selectReference(refId);
      };
      bindKeyboardActivation(node, node.onclick);
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

    const addCompareBtn = document.getElementById("reference-add-compare-button");
    if (addCompareBtn) {
      addCompareBtn.disabled = compareSelection.includes(ref.id);
      addCompareBtn.onclick = () => addToCompare(ref.id);
    }

    if (compileRefBtn) {
      compileRefBtn.disabled = false;
      compileRefBtn.onclick = () => {
        setButtonBusy(compileRefBtn, "Compiling...", () => {
          if (window.NV_DEBUG) console.log(`Compiling evidence from reference: ${ref.id}`);
          currentCompiledEvidence = adapter.compileEvidenceFromReference(retrievalState, ref.id);
          if (currentCompiledEvidence) {
            addToTimeline(currentCompiledEvidence);
          }
          addTrailEvent("compile_ref", `Compiled evidence from "${ref.id}"`, { referenceId: ref.id });
          switchInspectorTab("evidence");
          renderEvidence(currentCompiledEvidence);
          saveWorkspaceState();
        });
      };
    }

    renderDiscoverySpace();
    renderRelationshipNeighborhood();

    // ── React Island Enhancement ──────────────────────────────────────────
    // Attempt to upgrade the reference inspector container with React.
    // Fallback HTML rendered above persists if React is unavailable.
    const inspectorPayload = {
      mode: 'reference',
      reference: {
        id: ref.id,
        title: ref.title,
        type: ref.type,
        source: ref.source,
        sourceLabel,
        relationshipCount: rels.length,
        summary: ref.keywords.slice(0, 4).length
          ? `Useful for ${ref.keywords.slice(0, 4).join(', ')}.`
          : 'No keywords available.',
        isPinned,
        keywords: ref.keywords || [],
        connections: rels.map(rel => {
          const isOutgoing = rel.sourceReferenceId === ref.id;
          const targetId = isOutgoing ? rel.targetReferenceId : rel.sourceReferenceId;
          const targetRef = adapter.getReferenceById(retrievalState, targetId);
          return {
            relId: rel.id,
            type: rel.type,
            direction: isOutgoing ? 'to' : 'from',
            targetTitle: targetRef ? targetRef.title : targetId,
          };
        }),
        metrics: [],
      },
    };

    const inspectorCallbacks = {
      onOpenReference: (id) => selectReference(id),
      onPinReference: (id) => pinReference(id),
      onUnpinReference: (id) => unpinReference(id),
      onCompileEvidence: () => {
        if (compileRefBtn) compileRefBtn.click();
      },
      onFollowRelationship: (relId) => {
        const rel = retrievalState.relationships.find(r => r.id === relId);
        if (rel) {
          selectedRelationship = rel;
          addTrailEvent('inspect_rel', `Inspected relationship "${rel.sourceReferenceId} ➔ ${rel.targetReferenceId}"`, { relationship: rel });
          switchInspectorTab('relationship');
          renderRelationshipInspector();
        }
      },
      onOpenNeighbor: (id) => selectReference(id),
    };

    tryMountReactIsland(container, 'NvInspectorPanel', inspectorPayload, inspectorCallbacks);
    // ── End React Island Enhancement ──────────────────────────────────────
  }

  // DOM Rendering: contextual discovery recommendations.
  function renderDiscoverySpace() {
    const container = document.getElementById("discovery-container");
    if (!container) return;

    if (!selectedReferenceId) {
      // Show Discovery Empty State
      container.innerHTML = createRichEmptyState({
        icon: "discovery",
        title: "Recommendations appear after selection",
        explanation: "Select a reference to see the next useful paths."
      });
      return;
    }

    const sessionState = { recentReferences };
    const discoveryData = adapter.getDiscoverySuggestions(retrievalState, selectedReferenceId, sessionState);
    const continuations = adapter.getCitationContinuations(retrievalState, selectedReferenceId);

    const cards = [];
    if (discoveryData.suggestions && discoveryData.suggestions.length > 0) {
      discoveryData.suggestions.slice(0, 4).forEach(item => {
        const rel = getDiscoveryRelationship(selectedReferenceId, item.reference.id);
        cards.push({
          ref: item.reference,
          category: item.category,
          reason: item.reason,
          relType: item.relType,
          strength: rel?.strength
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
            reason: c.description,
            relType: c.relType,
            strength: getDiscoveryRelationship(selectedReferenceId, ref.id)?.strength
          });
        }
      }
    });

    if (cards.length === 0) {
      container.innerHTML = createRichEmptyState({
        icon: "discovery",
        title: "No discovery paths yet",
        explanation: "There are no suggested paths for the current context yet. Start exploration from a search or reference.",
        primaryAction: {
          label: "Start exploration",
          onclick: "window.switchExplorationMode('search'); document.getElementById('playground-search-input').focus();"
        },
        secondaryAction: pinnedReferences.length > 0 ? {
          label: "Open pinned reference",
          onclick: `window.selectReference('${pinnedReferences[0]}');`
        } : null
      });
      runTransientClass(container, "is-updated", 200);
      return;
    }

    let html = "";
    if (cards.length > 0) {
      html += `
        <div class="discovery-section-title">Recommended Next</div>
        <div class="nv-discovery-panel-list" aria-label="Contextual recommendations">
          ${cards.slice(0, 6).map((item, index) => {
            const relCount = getDiscoveryRelationshipCount(item.ref.id);
            const reasonLabel = normalizeRecommendationReason(item.reason, item.category, item.relType);
            return renderDiscoveryPanel({
              variant: index === 0 ? "rich" : "standard",
              reference: item.ref,
              reason: reasonLabel,
              category: item.category,
              relationshipCount: relCount,
              relevanceLabel: getRelevanceLabel({ strength: item.strength, rank: index, reason: reasonLabel }),
              connectivityLabel: getConnectivityLabel(relCount),
              actions: ["preview", "open", "pin", "compare"]
            });
          }).join("")}
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
    runTransientClass(container, "is-updated", 200);
    bindDiscoveryPanelActions(container, { onPinChange: renderDiscoverySpace });

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
      const reasonLabel = normalizeRecommendationReason(item.context, "related", item.type);
      const relCount = getDiscoveryRelationshipCount(neighbor.id);

      html += `
        ${renderDiscoveryPanel({
          variant: "compact",
          reference: neighbor,
          reason: `${reasonLabel} ${dirText}`,
          category: item.type,
          relationshipCount: relCount,
          relevanceLabel: getRelevanceLabel({ strength: item.strength, reason: reasonLabel }),
          connectivityLabel: getConnectivityLabel(relCount),
          iconPath: "assets/icons/scientific/knowledge-graph/active-neighborhood.svg",
          showDescription: false,
          actions: ["open", "pin", "compare"]
        })}
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    bindDiscoveryPanelActions(container, { onPinChange: renderRelationshipNeighborhood });
  }

  // DOM Rendering: Relationship Inspector Panel
  function renderRelationshipInspector() {
    const container = document.getElementById("selected-relationship-container");
    if (!container) return;

    if (!selectedRelationship) {
      container.innerHTML = createRichEmptyState({
        icon: "relationship",
        title: "No relationship selected",
        explanation: "Select a graph edge to inspect how two references are connected.",
        primaryAction: {
          label: "Open Graph Mode",
          onclick: "window.switchExplorationMode('graph');"
        }
      });
      runTransientClass(container, "is-updated", 200);
      return;
    }

    const rel = selectedRelationship;
    container.innerHTML = `
      <div class="nv-card nv-card--selected" style="margin: 0; border: none; background-color: var(--sys-color-surface-container-low) !important; cursor: default;">
        <p class="nv-muted" style="font-size: var(--sys-font-caption-size); line-height: 1.6; margin: 0;">
          <span class="nv-badge" data-variant="info">${rel.type}</span><br>
          <strong>Source:</strong> <span style="font-family: var(--sys-font-code-family);">${rel.sourceReferenceId}</span><br>
          <strong>Target:</strong> <span style="font-family: var(--sys-font-code-family);">${rel.targetReferenceId}</span>
        </p>
        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-xs); opacity: 0.4;"></div>
        <p class="nv-muted" style="font-size: var(--sys-font-body-size); line-height: 1.5; margin: 0; font-style: italic;">
          "${rel.context || 'No citation context details available.'}"
        </p>
        <div class="nv-cluster nv-cluster--gap-sm" style="margin-top: 8px;">
          <button id="playground-follow-source-btn" class="nv-button" data-variant="secondary" style="flex: 1; padding: 4px 8px; font-size: 0.65rem; min-block-size: unset;">Follow Source</button>
          <button id="playground-follow-target-btn" class="nv-button" data-variant="primary" style="flex: 1; padding: 4px 8px; font-size: 0.65rem; min-block-size: unset;">Follow Target</button>
        </div>
      </div>
    `;

    runTransientClass(container, "is-updated", 200);

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

    // ── React Island Enhancement ──────────────────────────────────────────
    const relPayload = {
      mode: 'relationship',
      relationship: {
        id: rel.id,
        type: rel.type,
        strength: rel.strength,
        sourceReferenceId: rel.sourceReferenceId,
        sourceTitle: adapter.getReferenceById(retrievalState, rel.sourceReferenceId)?.title || rel.sourceReferenceId,
        targetReferenceId: rel.targetReferenceId,
        targetTitle: adapter.getReferenceById(retrievalState, rel.targetReferenceId)?.title || rel.targetReferenceId,
        context: rel.context || '',
      },
    };
    const relCallbacks = {
      onFollowSource: (srcId) => {
        addTrailEvent('Followed relationship source', `Followed source "${srcId}" from edge "${rel.id}"`, { referenceId: srcId });
        selectReference(srcId);
      },
      onFollowTarget: (tgtId) => {
        addTrailEvent('Followed relationship target', `Followed target "${tgtId}" from edge "${rel.id}"`, { referenceId: tgtId });
        selectReference(tgtId);
      },
    };
    tryMountReactIsland(container, 'NvInspectorPanel', relPayload, relCallbacks);
    // ── End React Island Enhancement ──────────────────────────────────────
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
        ${createRichEmptyState({
          icon: "evidence",
          title: "No evidence compiled yet",
          explanation: "Compile evidence from the current search or selected reference to create an explainable synthesis.",
          primaryAction: currentSearchQuery ? {
            id: "evidence-empty-compile-query",
            label: "Compile Evidence",
            onclick: ""
          } : null,
          secondaryAction: selectedReferenceId ? {
            id: "evidence-empty-compile-ref",
            label: "Compile selected reference",
            onclick: ""
          } : null
        })}

        <div class="nv-divider" aria-hidden="true" style="margin-block: var(--sys-space-stack-md); opacity: 0.4;"></div>

        <!-- Timeline / History at bottom of empty state -->
        <div id="evidence-timeline-empty-container"></div>
      `;
      runTransientClass(container, "is-updated", 200);

      // Bind empty state buttons
      const emptyCompileQuery = document.getElementById("evidence-empty-compile-query");
      if (emptyCompileQuery) {
        emptyCompileQuery.disabled = !currentSearchQuery;
        if (currentSearchQuery) {
          emptyCompileQuery.innerHTML = `Compile Query: <span style="font-family: var(--sys-font-code-family); font-size: 0.55rem; opacity: 0.8;">"${escapeHtml(currentSearchQuery)}"</span>`;
        } else {
          emptyCompileQuery.innerHTML = `Compile Query <span style="font-size: 0.55rem; opacity: 0.8;">(No Active Query)</span>`;
        }
        emptyCompileQuery.onclick = () => {
          if (currentSearchQuery) {
            setButtonBusy(emptyCompileQuery, "Compiling...", () => {
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
            });
          }
        };
      }

      const emptyCompileRef = document.getElementById("evidence-empty-compile-ref");
      if (emptyCompileRef) {
        emptyCompileRef.disabled = !selectedReferenceId;
        if (selectedReferenceId) {
          emptyCompileRef.innerHTML = `Compile Ref: <span style="font-family: var(--sys-font-code-family); font-size: 0.55rem; opacity: 0.8;">"${escapeHtml(selectedReferenceId)}"</span>`;
        } else {
          emptyCompileRef.innerHTML = `Compile Ref <span style="font-size: 0.55rem; opacity: 0.8;">(No Selected Ref)</span>`;
        }
        emptyCompileRef.onclick = () => {
          if (selectedReferenceId) {
            setButtonBusy(emptyCompileRef, "Compiling...", () => {
              currentCompiledEvidence = adapter.compileEvidenceFromReference(retrievalState, selectedReferenceId);
              if (currentCompiledEvidence) addToTimeline(currentCompiledEvidence);
              addTrailEvent("compile_ref", `Compiled evidence from "${selectedReferenceId}" via empty state`, { referenceId: selectedReferenceId });
              renderEvidence(currentCompiledEvidence);
            });
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
      <div class="evidence-report nv-stack nv-stack--gap-sm" role="region" aria-label="Evidence compilation details">

        <div class="evidence-confidence-card nv-stack nv-stack--gap-xs" data-confidence="${confVariant}">
          <div class="nv-cluster nv-cluster--gap-xs" style="align-items: center; justify-content: space-between;">
            <span style="font-size: 0.68rem; color: var(--sys-color-text-secondary);">${comp.mode === "query" ? "Query evidence" : "Reference evidence"}</span>
            <span class="nv-badge" data-variant="${confVariant}" style="font-weight: var(--ref-font-weight-semibold);">${confLabel}</span>
          </div>
          <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0; line-height: 1.3;">${escapeHtml(confExplanation)}</p>
        </div>

        <div class="evidence-section nv-stack nv-stack--gap-xs">
          <h5>Summary</h5>
          <p class="evidence-summary">
            ${escapeHtml(comp.summary)}
          </p>
        </div>

        <div class="nv-divider evidence-divider" aria-hidden="true"></div>

        <div class="evidence-section nv-stack nv-stack--gap-xs nv-provenance-summary">
          <h5>Supporting References</h5>
          <div class="nv-stack nv-stack--gap-xs">
            ${allContributing.length === 0 ? '<p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">No contributing references found.</p>' : allContributing.map(item => {
              const relCount = getDiscoveryRelationshipCount(item.ref.id);
              const reasonLabel = item.role === "Primary Match" ? "Supports current evidence" : "Same knowledge neighborhood";
              const contributionLevel = item.role === "Primary Match" ? 4 : 2;
              const contributionLabel = item.role === "Primary Match" ? "Primary contribution" : "Supporting contribution";
              return renderDiscoveryPanel({
                variant: "standard",
                reference: item.ref,
                reason: reasonLabel,
                category: item.role,
                relationshipCount: relCount,
                relevanceLabel: item.role === "Primary Match" ? "High relevance" : "Moderate relevance",
                connectivityLabel: getConnectivityLabel(relCount),
                iconPath: "assets/icons/scientific/evidence/evidence-convergence.svg",
                microvisualization: renderContributionBar(contributionLabel, contributionLevel),
                actions: ["preview", "open", "pin", "compare"]
              });
            }).join("")}
          </div>
        </div>

        <div class="nv-divider evidence-divider" aria-hidden="true"></div>

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

        <div class="nv-divider evidence-divider" aria-hidden="true"></div>

        <div class="evidence-section nv-stack nv-stack--gap-xs">
          <h5>Next</h5>
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

        <div class="nv-divider evidence-divider" aria-hidden="true"></div>

        <!-- Timeline History at bottom of active state -->
        <div id="evidence-timeline-active-container"></div>

      </div>
    `;

    runTransientClass(container, "is-updated", 200);
    bindDiscoveryPanelActions(container, { onPinChange: () => renderEvidence(comp) });

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

    // ── React Island Enhancement ──────────────────────────────────────────
    // NvContributionBar levels come from existing qualitative assignment in
    // allContributing; this is read-only — no new numeric values invented.
    const evidencePayload = {
      mode: 'evidence',
      evidence: {
        mode: comp.mode || 'query',
        confidence: comp.confidence,
        confidenceLabel: confLabel,
        confidenceExplanation: confExplanation,
        confidenceVariant: confVariant,
        summary: comp.summary || '',
        confidenceGaugeHtml: "",
        coverageStripHtml: "",
        primaryReferenceId: comp.matchedReferences[0]?.id || '',
        lineage: [
          ...comp.matchedReferences.map(r => ({ id: r.id, title: r.title, role: 'Primary' })),
          ...comp.relatedReferences.map(r => ({ id: r.id, title: r.title, role: 'Support' })),
        ],
        relatedRelationships: comp.relationships.map(rel => ({
          id: rel.id,
          type: rel.type,
          sourceReferenceId: rel.sourceReferenceId,
          targetReferenceId: rel.targetReferenceId,
        })),
        metadata: [
          { label: 'Compilation Mode', value: comp.mode === 'query' ? 'Search Query' : 'Reference Seed' },
          { label: 'Input Target', value: `"${comp.input}"` },
          { label: 'Timestamp', value: new Date(comp.createdAt).toLocaleTimeString() },
          { label: 'Direct Matches', value: String(comp.matchedReferences.length) },
          { label: 'Graph Relationships', value: String(comp.relationships.length) },
          { label: 'Context References', value: String(comp.relatedReferences.length) },
        ],
        supportingRefs: allContributing.map(item => ({
          ref: { id: item.ref.id, title: item.ref.title, type: item.ref.type },
          role: item.role,
          contributionLevel: item.role === 'Primary Match' ? 4 : 2,
          contributionLabel: item.role === 'Primary Match' ? 'Primary contribution' : 'Supporting contribution',
          reasonLabel: item.role === 'Primary Match' ? 'Supports current evidence' : 'Same knowledge neighborhood',
          relevanceLabel: item.role === 'Primary Match' ? 'High relevance' : 'Moderate relevance',
          connectionCount: getDiscoveryRelationshipCount(item.ref.id),
        })),
      },
    };
    const evidenceCallbacks = {
      onOpenReference: (id) => {
        addTrailEvent('supporting_ref_opened', `Opened supporting reference "${id}"`, { referenceId: id });
        selectReference(id);
      },
      onOpenRelationship: (relId) => {
        const rel = retrievalState.relationships.find(r => r.id === relId);
        if (rel) {
          selectedRelationship = rel;
          addTrailEvent('relationship_navigated', `Navigated to relationship "${rel.sourceReferenceId} ➔ ${rel.targetReferenceId}" via evidence context`, { relationship: rel });
          switchInspectorTab('relationship');
          renderRelationshipInspector();
        }
      },
      onExploreNeighborhood: (id) => {
        selectedReferenceId = id;
        addToRecentlyViewed(id);
        switchExplorationMode('graph');
        addTrailEvent('action_explore_neighborhood', `Explored neighborhood around "${id}" from suggested next actions`, { referenceId: id });
        saveWorkspaceState();
        renderVisualGraph();
      },
      onReturnToSearch: () => {
        switchExplorationMode('search');
        addTrailEvent('action_return_search', 'Returned to search mode from suggested next actions');
        saveWorkspaceState();
      },
    };
    tryMountReactIsland(container, 'NvInspectorPanel', evidencePayload, evidenceCallbacks);
    // ── End React Island Enhancement ──────────────────────────────────────
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
      <pattern id="graph-grid" width="36" height="36" patternUnits="userSpaceOnUse">
        <circle cx="18" cy="18" r="0.65" fill="var(--sys-color-text-muted)" fill-opacity="0.09" />
      </pattern>
      <radialGradient id="radial-halo-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="var(--sys-color-accent-primary)" stop-opacity="0.42" />
        <stop offset="44%" stop-color="var(--sys-color-accent-primary)" stop-opacity="0.12" />
        <stop offset="100%" stop-color="var(--sys-color-accent-primary)" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="graph-edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="var(--sys-color-text-muted)" stop-opacity="0.08" />
        <stop offset="48%" stop-color="var(--sys-color-text-primary)" stop-opacity="0.34" />
        <stop offset="100%" stop-color="var(--sys-color-text-muted)" stop-opacity="0.08" />
      </linearGradient>
    `;
    svg.appendChild(defs);

    const overlay = document.getElementById("graph-empty-state-overlay");
    const preview = document.getElementById("graph-hover-preview");

    const hideOverlay = () => {
      if (overlay) overlay.style.display = "none";
    };

    const hidePreview = () => {
      if (!preview) return;
      preview.hidden = true;
      preview.innerHTML = "";
    };
    const showPreview = (content, event) => {
      // Rich previews are handled by delegated hover/focus bindings.
      if (!preview) return;
      preview.hidden = true;
      preview.innerHTML = "";
    };

    const showOverlay = (type) => {
      if (!overlay) return;
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";

      let config = {};
      if (type === 'no-focus') {
        config = {
          icon: 'graph',
          title: 'No relationships available',
          explanation: 'No graph relationships are available yet. Start a search or select a reference to reveal the knowledge map.',
          primaryAction: {
            id: 'graph-empty-discovery-button',
            label: 'Open Discovery'
          },
          secondaryAction: {
            id: 'graph-empty-search-button',
            label: 'Return to search'
          }
        };
      } else if (type === 'no-filter') {
        config = {
          icon: 'relationship',
          title: 'No relationships match this filter',
          explanation: 'No relationships match this filter. Try All connections or continue exploring similar references.',
          primaryAction: {
            id: 'graph-empty-all-button',
            label: 'All connections'
          }
        };
      } else {
        config = {
          icon: 'graph',
          title: 'No relationships available',
          explanation: 'No graph relationships are available yet. Start a search or select a reference to reveal the knowledge map.',
          primaryAction: {
            id: 'graph-empty-discovery-button',
            label: 'Open Discovery'
          },
          secondaryAction: {
            id: 'graph-empty-search-button',
            label: 'Return to search'
          }
        };
      }

      overlay.innerHTML = createRichEmptyState(config);

      const discoveryBtn = overlay.querySelector('#graph-empty-discovery-button');
      if (discoveryBtn) {
        discoveryBtn.onclick = () => {
          switchExplorationMode("discovery");
          addTrailEvent("Graph empty state resolved", "Opened Discovery from empty graph state", { depth: neighborhoodDepth, filter: relationshipFilter });
          saveWorkspaceState();
        };
      }

      const searchBtn = overlay.querySelector('#graph-empty-search-button');
      if (searchBtn) {
        searchBtn.onclick = () => {
          switchExplorationMode("search");
          const searchInput = document.getElementById("playground-search-input");
          if (searchInput) searchInput.focus();
        };
      }

      const allBtn = overlay.querySelector('#graph-empty-all-button');
      if (allBtn) {
        allBtn.onclick = () => {
          relationshipFilter = "all";
          const filterSelect = document.getElementById("graph-filter-select");
          if (filterSelect) filterSelect.value = relationshipFilter;
          addTrailEvent("Graph filter cleared", "Returned to All connections from empty state", { filter: relationshipFilter });
          saveWorkspaceState();
          renderVisualGraph();
        };
      }
    };

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
        showOverlay('no-filter');
      } else {
        hideOverlay();
      }
    } else {
      if (filteredRels.length === 0) {
        showOverlay('no-filter');
        return;
      } else {
        hideOverlay();
      }
    }

    if (visibleNodes.length === 0) {
      showOverlay('no-focus');
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

    if (shouldFitGraphViewport) {
      shouldFitGraphViewport = false;
      const xs = Object.values(nodeCoords).map(c => c.x);
      const ys = Object.values(nodeCoords).map(c => c.y);
      if (xs.length > 0) {
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const graphWidth = maxX - minX || 1;
        const graphHeight = maxY - minY || 1;

        const paddingRatio = 0.75;
        const scaleX = (width * paddingRatio) / graphWidth;
        const scaleY = (height * paddingRatio) / graphHeight;
        const autoScale = clampGraphScale(Math.min(scaleX, scaleY, 1.2));

        const graphCenterX = minX + graphWidth / 2;
        const graphCenterY = minY + graphHeight / 2;

        const autoX = width / 2 - graphCenterX * autoScale;
        const autoY = height / 2 - graphCenterY * autoScale;

        graphViewport = {
          x: autoX,
          y: autoY,
          scale: autoScale
        };
      }
    }

    const edgePaths = adapter.computeEdgePaths(visibleEdges, nodeCoords);
    const clusterSummaries = adapter.getClusterSummaries ? adapter.getClusterSummaries(visibleNodes, nodeCoords) : [];
    const nodeHitZones = visibleNodes
      .map(ref => {
        const coord = nodeCoords[ref.id];
        if (!coord) return null;
        const relCount = allRels.filter(rel => rel.sourceReferenceId === ref.id || rel.targetReferenceId === ref.id).length;
        const isActiveNode = ref.id === selectedReferenceId;
        const isDistant = Boolean(selectedReferenceId && ref.id !== selectedReferenceId);
        const radius = getGraphNodeRadius(getGraphNodeTier(relCount, isActiveNode), isDistant);
        return { id: ref.id, x: coord.x, y: coord.y, radius: Math.max(22, radius + 12) };
      })
      .filter(Boolean);

    const isPointerInsideNodeHitZone = (event) => {
      if (!event || typeof event.clientX !== "number" || typeof event.clientY !== "number" || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return false;
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const matrix = svg.getScreenCTM();
      if (!matrix) return false;
      const local = point.matrixTransform(matrix.inverse());
      const gx = (local.x - graphViewport.x) / graphViewport.scale;
      const gy = (local.y - graphViewport.y) / graphViewport.scale;
      return nodeHitZones.some(zone => Math.hypot(gx - zone.x, gy - zone.y) <= zone.radius);
    };

    const activeRefId = selectedReferenceId;
    const firstHopNodeIds = new Set();
    const secondHopNodeIds = new Set();
    const activeRelIds = new Set();
    const labeledNeighborIds = new Set();

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

      visibleEdges
        .filter(rel => rel.sourceReferenceId === activeRefId || rel.targetReferenceId === activeRefId)
        .sort((a, b) => (b.strength || 0) - (a.strength || 0))
        .slice(0, 3)
        .forEach(rel => {
          labeledNeighborIds.add(rel.sourceReferenceId === activeRefId ? rel.targetReferenceId : rel.sourceReferenceId);
        });
    }

    const panSurface = createSvgElement("rect", {
      class: "graph-pan-surface",
      x: -width * 4,
      y: -height * 4,
      width: width * 9,
      height: height * 9,
      fill: "url(#graph-grid)"
    });
    svg.appendChild(panSurface);



    const world = createSvgElement("g", { class: "graph-world" });
    const clusterLayer = createSvgElement("g", { class: "graph-clusters" });
    const observatoryLayer = createSvgElement("g", { class: "graph-observatory-signals" });
    const edgeLayer = createSvgElement("g", { class: "graph-edges" });
    const nodeLayer = createSvgElement("g", { class: "graph-nodes" });

    // Active reference observatory signals (subtle crosshair)
    if (activeRefId && nodeCoords[activeRefId]) {
      const activeCoord = nodeCoords[activeRefId];
      const crosshairX = createSvgElement("line", {
        x1: activeCoord.x - 12,
        y1: activeCoord.y,
        x2: activeCoord.x + 12,
        y2: activeCoord.y,
        stroke: "var(--sys-color-accent-primary)",
        "stroke-width": "0.75",
        "stroke-opacity": "0.25"
      });
      const crosshairY = createSvgElement("line", {
        x1: activeCoord.x,
        y1: activeCoord.y - 12,
        x2: activeCoord.x,
        y2: activeCoord.y + 12,
        stroke: "var(--sys-color-accent-primary)",
        "stroke-width": "0.75",
        "stroke-opacity": "0.25"
      });
      observatoryLayer.appendChild(crosshairX);
      observatoryLayer.appendChild(crosshairY);
    }
    world.appendChild(clusterLayer);
    world.appendChild(observatoryLayer);
    world.appendChild(edgeLayer);
    world.appendChild(nodeLayer);
    svg.appendChild(world);
    setGraphViewport(graphViewport, false);

    const summaryLayer = createSvgElement("g", { class: "graph-summary-readout" });
    const summaryText = createSvgElement("text", {
      x: width - 18,
      y: 24,
      "text-anchor": "end"
    });
    summaryText.textContent = `${visibleNodes.length} refs · ${visibleEdges.length} rels · ${relationshipFilter === "all" ? "all" : relationshipFilter} · ${activeDepth}`;
    summaryLayer.appendChild(summaryText);
    svg.appendChild(summaryLayer);

    if (activeRefId) {
      const recentTrail = [activeRefId, ...recentReferences.filter(id => id !== activeRefId)]
        .slice(0, 3)
        .map(id => adapter.getReferenceById(retrievalState, id))
        .filter(Boolean)
        .reverse();
      if (recentTrail.length > 0) {
        const trailLayer = createSvgElement("g", { class: "graph-breadcrumb-readout" });
        const trailText = createSvgElement("text", {
          x: 18,
          y: 24,
          "text-anchor": "start"
        });
        trailText.textContent = recentTrail.map(ref => getShortGraphLabel(ref)).join("  →  ");
        trailLayer.appendChild(trailText);
        svg.appendChild(trailLayer);
      }
    }

    clusterSummaries
      .filter(cluster => cluster.nodes.length > 1 && cluster.x && cluster.y)
      .forEach(cluster => {
        const label = createSvgElement("text", {
          class: "graph-cluster-label",
          x: cluster.x,
          y: cluster.y,
          "text-anchor": "middle"
        });
        label.textContent = cluster.name;
        clusterLayer.appendChild(label);
      });

    edgePaths.forEach(({ edge: rel, pathData }) => {
      const hitEl = createSvgElement("path");
      hitEl.setAttribute("d", pathData);
      hitEl.setAttribute("fill", "none");
      hitEl.setAttribute("class", "graph-link-target");
      hitEl.setAttribute("data-rel-id", rel.id);
      hitEl.setAttribute("tabindex", "0");
      hitEl.setAttribute("role", "button");
      hitEl.setAttribute("pointer-events", "stroke");
      hitEl.setAttribute("aria-label", `Relationship: ${getRelationshipLabel(rel)}`);

      const pathEl = createSvgElement("path");
      pathEl.setAttribute("d", pathData);
      pathEl.setAttribute("fill", "none");
      pathEl.setAttribute("class", `graph-link graph-link--${normalizeGraphType(rel.type)}`);
      pathEl.setAttribute("aria-hidden", "true");
      pathEl.setAttribute("data-source", rel.sourceReferenceId);
      pathEl.setAttribute("data-target", rel.targetReferenceId);
      pathEl.setAttribute("stroke", "url(#graph-edge-gradient)");
      const strength = typeof rel.strength === "number" ? rel.strength : 1.0;
      const strokeWidth = 0.6 + strength * 1.05;
      pathEl.style.setProperty("--link-width", `${strokeWidth}px`);
      // Arrowheads completely removed for Obsidian-like organic connections
      const selectEdge = (e) => {
        e.stopPropagation();
        if (isPointerInsideNodeHitZone(e)) return;
        selectedRelationship = rel;
        addTrailEvent("Graph edge selected", `Inspected relationship "${rel.sourceReferenceId} ➔ ${rel.targetReferenceId}"`, { relationship: rel });
        switchInspectorTab("relationship");
        renderRelationshipInspector();
        saveWorkspaceState();
        renderVisualGraph();
      };
      const showEdgePreview = (event) => {
        if (isPointerInsideNodeHitZone(event)) {
          hidePreview();
          return;
        }
        if (richPreviewController) richPreviewController.show(hitEl, false);
        const source = adapter.getReferenceById(retrievalState, rel.sourceReferenceId);
        const target = adapter.getReferenceById(retrievalState, rel.targetReferenceId);
        const context = rel.context || (rel.strength ? `Strength ${rel.strength}` : "Relationship context");
        showPreview(`
          <div class="nv-stack nv-stack--gap-xs" style="min-width: 185px;">
            <strong style="font-size: 0.7rem; color: var(--sys-color-accent-primary); text-transform: uppercase; display: block;">${escapeHtml(String(rel.type || "related").replace(/_/g, " "))}</strong>
            <span style="font-size: 0.65rem; color: var(--sys-color-text-primary); display: block; line-height: 1.3;">${escapeHtml(source?.title || rel.sourceReferenceId)} to ${escapeHtml(target?.title || rel.targetReferenceId)}</span>
            <small style="font-size: 0.6rem; color: var(--sys-color-text-muted); display: block; margin-top: 2px; line-height: 1.3;">${escapeHtml(context)}</small>
          </div>
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
      pathEl.onmouseenter = showEdgePreview;
      pathEl.onmousemove = showEdgePreview;
      pathEl.onmouseleave = hidePreview;

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

    const activeCoord = activeRefId ? nodeCoords[activeRefId] : null;

    const placedLabelBoxes = [];

    visibleNodes.forEach((ref, nodeIndex) => {
      const coord = nodeCoords[ref.id];
      if (!coord) return;

      const g = createSvgElement("g");
      g.setAttribute("class", `graph-node graph-node--${ref.type || "reference"}`);
      g.setAttribute("data-id", ref.id);
      g.setAttribute("transform", `translate(${coord.x}, ${coord.y})`);
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `Reference node: ${ref.title}. ${ref.type || "reference"}. Press Enter to inspect.`);

      const relsForNode = allRels.filter(rel => rel.sourceReferenceId === ref.id || rel.targetReferenceId === ref.id).length;
      const isDistantNode = Boolean(activeRefId && ref.id !== activeRefId && !firstHopNodeIds.has(ref.id) && !secondHopNodeIds.has(ref.id));
      const tier = getGraphNodeTier(relsForNode, ref.id === activeRefId);
      g.classList.add(`graph-node-tier-${tier}`);

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

      const radius = getGraphNodeRadius(tier, isDistantNode);
      const placement = getGraphLabelPlacement(ref, coord, activeCoord, radius, width, height, nodeIndex);
      const labelIsPersistent = Boolean(activeRefId && (ref.id === activeRefId || labeledNeighborIds.has(ref.id)));
      if (labelIsPersistent && placement.lines.length > 0) {
        const longestLine = placement.lines.reduce((max, line) => Math.max(max, line.length), 0);
        const boxWidth = Math.max(72, longestLine * 5.4);
        const boxHeight = Math.max(14, placement.lines.length * 10);
        const direction = coord.y >= (activeCoord?.y || height / 2) ? 1 : -1;
        let attempts = 0;
        const makeBox = () => {
          const x1 = coord.x + placement.x + (placement.anchor === "end" ? -boxWidth : placement.anchor === "middle" ? -boxWidth / 2 : 0);
          const y1 = coord.y + placement.y - 9;
          return { x1, y1, x2: x1 + boxWidth, y2: y1 + boxHeight };
        };
        let box = makeBox();
        const overlaps = (a, b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
        while (placedLabelBoxes.some(existing => overlaps(box, existing)) && attempts < 5) {
          placement.y += direction * 11;
          placement.metricsY += direction * 11;
          box = makeBox();
          attempts += 1;
        }
        placedLabelBoxes.push(box);
      }

      const hitArea = createSvgElement("circle", { class: "graph-node-hit", r: Math.max(18, radius + 8) });
      const aura = createSvgElement("circle", { class: "graph-node-aura", r: radius + 7 });
      const shape = getGraphNodeShape(ref, radius);
      const circle = createSvgElement(shape.tag, { class: "graph-node-core", ...shape.attrs });
      const text = createSvgElement("text", { class: "graph-node-label" });
      const subtitle = createSvgElement("text", { class: "graph-node-subtitle" });
      text.setAttribute("text-anchor", placement.anchor);
      text.setAttribute("x", placement.x);
      text.setAttribute("y", placement.y);
      subtitle.setAttribute("text-anchor", placement.anchor);
      subtitle.setAttribute("x", placement.x);
      subtitle.setAttribute("y", placement.y + Math.max(12, placement.lines.length * 10 + 4));
      subtitle.textContent = "";

      const setNodeLabel = (lines, opacity) => {
        text.innerHTML = "";
        lines.forEach((line, index) => {
          const tspan = createSvgElement("tspan");
          tspan.setAttribute("x", placement.x);
          tspan.setAttribute("dy", index === 0 ? "0" : "1.18em");
          tspan.textContent = line;
          text.appendChild(tspan);
        });
        text.style.opacity = String(opacity);
      };

      // Label hierarchy implementation:
      const setLabelState = () => {
        const showPersistentLabel = shouldShowGraphLabel({
          ref,
          activeRefId,
          firstHopNodeIds,
          secondHopNodeIds,
          labeledNeighborIds
        });
        if (activeRefId) {
          if (ref.id === activeRefId) {
            setNodeLabel(placement.lines, 1);
            subtitle.textContent = "";
            subtitle.style.opacity = "0";
          } else if (showPersistentLabel && firstHopNodeIds.has(ref.id)) {
            setNodeLabel(placement.lines, graphLabelMode === "expanded" ? 0.78 : 0.84);
            subtitle.textContent = "";
            subtitle.style.opacity = "0";
          } else if (showPersistentLabel && secondHopNodeIds.has(ref.id)) {
            setNodeLabel(wrapGraphLabel(ref.title, 24).slice(0, 2), 0.46);
            subtitle.textContent = "";
            subtitle.style.opacity = "0";
          } else {
            setNodeLabel([], 0);
            subtitle.textContent = "";
            subtitle.style.opacity = "0";
          }
        } else {
          if (showPersistentLabel) {
            setNodeLabel(wrapGraphLabel(ref.title, 24).slice(0, 2), 0.58);
            subtitle.textContent = "";
            subtitle.style.opacity = "0";
          } else {
            setNodeLabel([], 0);
            subtitle.textContent = "";
            subtitle.style.opacity = "0";
          }
        }
      };
      setLabelState();

      // Dynamic hover to reveal full title and highlight paths (Obsidian-style)
      g.addEventListener("mouseenter", () => {
        setNodeLabel(wrapGraphLabel(ref.title || ref.id, 32), 1);
        world.classList.add("has-hovered-node");
        g.classList.add("is-hovered");

        // Find immediate neighbors
        const neighbors = new Set();
        visibleEdges.forEach(rel => {
          if (rel.sourceReferenceId === ref.id) {
            neighbors.add(rel.targetReferenceId);
          } else if (rel.targetReferenceId === ref.id) {
            neighbors.add(rel.sourceReferenceId);
          }
        });

        // Set hover classes on node elements
        const allNodeEls = world.querySelectorAll(".graph-node");
        allNodeEls.forEach(nodeEl => {
          const nodeId = nodeEl.getAttribute("data-id");
          if (neighbors.has(nodeId)) {
            nodeEl.classList.add("hover-neighbor");
            const neighborText = nodeEl.querySelector(".graph-node-label");
            if (neighborText) {
              const nodeRef = visibleNodes.find(n => n.id === nodeId);
              if (nodeRef) {
                const lines = wrapGraphLabel(nodeRef.title, 26, 2);
                neighborText.innerHTML = "";
                lines.forEach((line, index) => {
                  const tspan = createSvgElement("tspan");
                  tspan.setAttribute("x", neighborText.getAttribute("x") || "0");
                  tspan.setAttribute("dy", index === 0 ? "0" : "1.18em");
                  tspan.textContent = line;
                  neighborText.appendChild(tspan);
                });
              }
              neighborText.style.opacity = "0.85";
            }
          }
        });

        // Highlight connected paths
        highlightNodeConnections(ref.id);
      });

      g.addEventListener("mouseleave", () => {
        setLabelState();
        world.classList.remove("has-hovered-node");
        g.classList.remove("is-hovered");

        const allNodeEls = world.querySelectorAll(".graph-node");
        allNodeEls.forEach(nodeEl => {
          nodeEl.classList.remove("hover-neighbor");
          const nodeText = nodeEl.querySelector(".graph-node-label");
          if (nodeText) {
            const nodeId = nodeEl.getAttribute("data-id");
            const nodeRef = visibleNodes.find(n => n.id === nodeId);
            if (nodeRef) {
              const showPersistent = shouldShowGraphLabel({
                ref: nodeRef,
                activeRefId,
                firstHopNodeIds,
                secondHopNodeIds,
                labeledNeighborIds
              });
              if (showPersistent) {
                const lines = wrapGraphLabel(nodeRef.title, 26, 2);
                nodeText.innerHTML = "";
                lines.forEach((line, idx) => {
                  const tspan = createSvgElement("tspan");
                  tspan.setAttribute("x", nodeText.getAttribute("x") || "0");
                  tspan.setAttribute("dy", idx === 0 ? "0" : "1.18em");
                  tspan.textContent = line;
                  nodeText.appendChild(tspan);
                });
                nodeText.style.opacity = nodeId === activeRefId ? "1.0" : "0.78";
              } else {
                nodeText.innerHTML = "";
                nodeText.style.opacity = "0";
              }
            }
          }
        });

        resetNodeConnections();
      });

      g.appendChild(hitArea);
      g.appendChild(aura);
      g.appendChild(circle);
      g.appendChild(text);
      g.appendChild(subtitle);

      if (ref.id === activeRefId) {
        const metrics = createSvgElement("g", {
          class: "graph-node-microviz",
          transform: `translate(${placement.metricsX}, ${placement.metricsY})`
        });
        const activeRelationshipCount = allRels.filter(rel => rel.sourceReferenceId === ref.id || rel.targetReferenceId === ref.id).length;
        const filledSegments = Math.max(1, Math.min(5, Math.ceil(activeRelationshipCount / 2)));
        for (let i = 0; i < 5; i++) {
          metrics.appendChild(createSvgElement("rect", {
            class: i < filledSegments ? "graph-node-microviz-segment is-filled" : "graph-node-microviz-segment",
            x: i * 6,
            y: 0,
            width: 4,
            height: 4,
            rx: 1
          }));
        }
        const densityText = createSvgElement("text", {
          class: "graph-node-microviz-label",
          x: 35,
          y: 5
        });
        densityText.textContent = `${getConnectivityLabel(activeRelationshipCount)} · ${activeRelationshipCount} relationships`;
        metrics.appendChild(densityText);
        g.appendChild(metrics);
      }

      const highlightNodeConnections = (nodeId) => {
        const connectedEdgePaths = Array.from(edgeLayer.querySelectorAll(`.graph-link`));
        connectedEdgePaths.forEach(path => {
          if (path.getAttribute("data-source") === nodeId || path.getAttribute("data-target") === nodeId) {
            path.classList.add("hover-active");
          } else {
            path.classList.add("hover-dimmed");
          }
        });
      };

      const resetNodeConnections = () => {
        const connectedEdgePaths = Array.from(edgeLayer.querySelectorAll(`.graph-link`));
        connectedEdgePaths.forEach(path => {
          path.classList.remove("hover-active", "hover-dimmed");
        });
      };

      const activateNode = (e) => {
        e.stopPropagation();
        selectReference(ref.id);
      };
      g.onclick = activateNode;

      g.onkeydown = (e) => {
        const isContextKey = e.key === "ContextMenu" || e.key === "F10" || (e.shiftKey && e.key === "F10");
        if (isContextKey && contextMenuController?.open?.(g, e)) {
          e.preventDefault();
          e.stopPropagation();
        } else if (e.key === "Enter" || e.key === " ") {
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
        if (richPreviewController) richPreviewController.show(g, false);
        setNodeLabel(wrapGraphLabel(ref.title || ref.id, ref.id === activeRefId ? 38 : 32, ref.id === activeRefId ? 3 : 2), 1);

        highlightNodeConnections(ref.id);

        const relCount = allRels.filter(rel => rel.sourceReferenceId === ref.id || rel.targetReferenceId === ref.id).length;
        const neighborhoodSize = new Set(allRels.flatMap(rel => (
          rel.sourceReferenceId === ref.id ? [rel.targetReferenceId] :
          rel.targetReferenceId === ref.id ? [rel.sourceReferenceId] : []
        ))).size;
        showPreview(`
          <div class="nv-stack nv-stack--gap-xs" style="min-width: 195px;">
            <strong style="font-size: 0.75rem; color: var(--sys-color-text-primary); display: block; line-height: 1.3;">${escapeHtml(ref.title)}</strong>
            <span style="font-size: 0.65rem; color: var(--sys-color-text-secondary); display: block; margin-bottom: 4px;">
              ${escapeHtml(ref.type || "reference")} · ${escapeHtml(adapter.inferReferenceCluster ? adapter.inferReferenceCluster(ref) : "Research")} · ${escapeHtml(tier)}
            </span>

            <small style="font-size: 0.6rem; color: var(--sys-color-text-muted); display: block; margin-top: 4px; line-height: 1.3;">
              ${relCount} relationships · ${getEvidenceCountForReference(ref.id)} evidence · ${neighborhoodSize} neighbors
            </small>
            <small style="font-size: 0.58rem; color: var(--sys-color-accent-primary); display: block; margin-top: 3px; line-height: 1.2;">
              Click to inspect · Enter to open
            </small>
          </div>
        `, event);
      };
      g.onmousemove = g.onmouseenter;
      g.onmouseleave = () => {
        hidePreview();
        resetNodeConnections();
        setLabelState();
      };
      g.onfocus = (event) => g.onmouseenter(event);
      g.onblur = () => {
        hidePreview();
        resetNodeConnections();
        setLabelState();
      };

      nodeLayer.appendChild(g);
    });

    let isPanning = false;
    let panStart = null;
    svg.onwheel = (event) => {
      event.preventDefault();
      hidePreview();
      if (richPreviewController) richPreviewController.hide();
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
      if (richPreviewController) richPreviewController.hide();
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

      anchorsContainer.innerHTML = sortedRefs.slice(0, 3).map((ref, index) => renderDiscoveryPanel({
        variant: "rich",
        reference: ref,
        reason: index === 0 ? "Same knowledge neighborhood" : "Connected through graph path",
        category: "discovery-anchor",
        relationshipCount: counts[ref.id],
        relevanceLabel: index === 0 ? "High relevance" : "Moderate relevance",
        connectivityLabel: getConnectivityLabel(counts[ref.id]),
        iconPath: "assets/icons/scientific/knowledge-graph/knowledge-cluster.svg",
        actions: ["preview", "open", "pin", "compare"]
      })).join("");
      bindDiscoveryPanelActions(anchorsContainer, { onPinChange: renderDiscoveryMode });
    }
  }

  // DOM Rendering: Semantic Compare Workspace
  function renderCompareMode() {
    const container = document.getElementById("compare-workspace-container");
    if (!container) return;

    if (compareSelection.length === 0 && pinnedReferences.length >= 2) {
      compareSelection = pinnedReferences.slice(0, 4);
    }

    const payload = buildComparePayload();
    tryUnmountReactIsland(container);
    const fallbackRows = payload.items.map(item => `
      <tr data-ref-id="${escapeHtml(item.id)}">
        <td>${escapeHtml(item.id)}</td>
        <td>${escapeHtml(item.title)}</td>
        <td>${escapeHtml(item.type || "reference")}</td>
        <td>${escapeHtml(item.status || "active")}</td>
        <td>${escapeHtml(item.source || "")}</td>
        <td>${item.relationshipCount} relationships</td>
      </tr>
    `).join("");

    container.innerHTML = `
      <div class="nv-compare-fallback">
        <div class="nv-cluster nv-cluster--gap-sm" style="justify-content: space-between; align-items: center;">
          <div>
            <h3 style="margin: 0; font-size: var(--sys-font-body-size);">Semantic Compare Workspace</h3>
            <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">Select 2-4 references to compare metadata, concepts, evidence contribution, and graph position.</p>
          </div>
          ${payload.items.length > 0 ? `<button id="compare-fallback-clear" class="nv-button" data-variant="ghost">Clear Compare</button>` : ""}
        </div>
        ${compareFeedback ? `<p class="nv-compare-feedback" role="status" aria-live="polite">${escapeHtml(compareFeedback)}</p>` : ""}
        ${payload.items.length < 2 ? `<p class="nv-compare-empty">Add at least two references from discovery panels, memory, inspector, hover previews, evidence, or graph context menus.</p>` : `
          <div style="overflow-x: auto;">
            <table class="compare-table">
              <thead>
                <tr><th>ID</th><th>Title</th><th>Type</th><th>Status</th><th>Source</th><th>Direct Relations</th></tr>
              </thead>
              <tbody>${fallbackRows}</tbody>
            </table>
          </div>
        `}
      </div>
    `;

    document.getElementById("compare-fallback-clear")?.addEventListener("click", clearCompare);
    container.querySelectorAll("tr[data-ref-id]").forEach(row => {
      row.onclick = () => selectReference(row.getAttribute("data-ref-id"));
      bindKeyboardActivation(row, row.onclick);
    });

    const callbacks = {
      onOpenReference: (id) => selectReference(id),
      onTogglePin: (id) => {
        if (pinnedReferences.includes(id)) unpinReference(id);
        else pinReference(id);
        renderCompareMode();
      },
      onCompile: (id) => {
        compileEvidenceFromReference(id);
        renderCompareMode();
      },
      onCompileFromQuery: () => {
        if (currentSearchQuery) {
          document.getElementById("playground-compile-query-button")?.click();
        }
      },
      onRemove: (id) => removeFromCompare(id),
      onClear: () => clearCompare(),
      onOpenCompare: () => switchExplorationMode("compare"),
      onRunSearchFocus: () => {
        switchExplorationMode("search");
        document.getElementById("playground-search-input")?.focus();
      },
      onFocusInGraph: (id) => focusCompareInGraph(id),
      onFocusItem: (id) => {
        if (id) {
          payload.graphSync.activeCompareReferenceId = id;
          payload.graphSync.graphModeActive = activeExplorationMode === "graph";
          if (activeExplorationMode === "graph") {
            const node = document.querySelector(`.graph-node[data-id="${id}"]`);
            if (node) {
              node.dispatchEvent(new Event("click"));
            }
          }
        }
      },
      onCompileSynthesis: () => compileCompareSynthesis(),
      onClearSynthesis: () => clearCompareSynthesis(),
      onCopySynthesisBlock: () => {
        const block = buildSynthesisTextBlock();
        if (block) copyContextValue(block);
      },
    };

    payload.compareSynthesis = compareSynthesis || null;

    if (tryMountReactIsland(container, "NvCompareWorkspace", payload, callbacks)) {
      return;
    }
  }

  // DOM Rendering: Research Presentation Mode
  function buildPresentationPayload() {
    const now = Date.now();
    const evidenceCount = evidenceTimeline.length || (currentCompiledEvidence ? 1 : 0);
    const selectedRef = selectedReferenceId ? adapter.getReferenceById(retrievalState, selectedReferenceId) : null;
    const confidenceLabel = compareSynthesis?.confidence?.label || currentCompiledEvidence?.confidence
      ? `${String(currentCompiledEvidence?.confidence || "").charAt(0).toUpperCase()}${String(currentCompiledEvidence?.confidence || "").slice(1)} Support`
      : "";
    const hasPresentationContext = Boolean(
      currentSearchQuery ||
      selectedReferenceId ||
      evidenceCount ||
      compareSelection.length ||
      pinnedReferences.length ||
      recentReferences.length ||
      knowledgeTrail.length ||
      compareSynthesis
    );

    if (!hasPresentationContext) {
      return {
        actions: {
          canReturnToWorkspace: true,
        },
      };
    }

    const narrativeTypes = { search: "search", rerun_query: "search", compile_query: "evidence-compiled", compile_ref: "evidence-compiled", compare_add: "comparison", compare_synthesis: "synthesis-created", pin: "pin", open: "reference-opened", select_node: "graph-explored", save_query: "saved-query", explore_neighborhood: "graph-explored", compare_reference: "comparison" };

    const narrative = knowledgeTrail.slice(0, 8).map(event => {
      const type = narrativeTypes[event.type] || "reference-opened";
      const titleBase = String(event.label || "").replace(/^Searched "?/i, "").replace(/"$/, "");
      return {
        id: event.id,
        type,
        title: type === "search" ? `Query: ${titleBase}` : type === "reference-opened" ? `Opened reference` : type === "evidence-compiled" ? `Compiled evidence` : type === "comparison" ? `Comparison` : type === "synthesis-created" ? `Synthesis created` : type === "pin" ? `Pinned reference` : type === "graph-explored" ? `Graph exploration` : titleBase,
        text: event.label || "",
        timestamp: event.timestamp,
        targetId: event.metadata?.referenceId || event.metadata?.query || "",
      };
    });

    const roleForRef = (refId) => {
      if (refId === selectedReferenceId) return "Primary";
      if (compareSelection.includes(refId)) return "Compared";
      if (pinnedReferences.includes(refId)) return "Pinned";
      if (compareSynthesis?.sharedSupport?.some(s => s.referenceId === refId)) return "Supporting";
      if (currentCompiledEvidence?.matchedReferences?.some(r => r.id === refId)) return "Supporting";
      if (currentCompiledEvidence?.relatedReferences?.some(r => r.id === refId)) return "Context";
      return "Context";
    };

    const allRefIds = new Set([
      ...recentReferences,
      ...pinnedReferences,
      ...compareSelection,
      selectedReferenceId,
      ...(currentCompiledEvidence?.matchedReferences || []).map(r => r.id),
      ...(currentCompiledEvidence?.relatedReferences || []).map(r => r.id),
      ...(compareSynthesis?.sharedSupport || []).map(s => s.referenceId),
    ].filter(Boolean));

    const references = [...allRefIds].map(id => {
      const ref = adapter.getReferenceById(retrievalState, id);
      if (!ref) return null;
      const rels = adapter.getRelationshipsForReference(retrievalState, ref.id);
      return {
        id: ref.id,
        title: ref.title,
        type: ref.type,
        source: ref.source,
        role: roleForRef(ref.id),
        relationshipCount: rels.length,
        clusterLabel: getClusterLabel(ref),
      };
    }).filter(Boolean);

    const evidence = [];
    if (currentCompiledEvidence) {
      evidence.push({
        id: currentCompiledEvidence.id || "current-evidence",
        title: `Evidence: ${(currentCompiledEvidence.input || "").slice(0, 40)}`,
        summary: currentCompiledEvidence.summary || "",
        confidenceLabel: `${String(currentCompiledEvidence.confidence || "low").charAt(0).toUpperCase()}${String(currentCompiledEvidence.confidence || "low").slice(1)} Support`,
        supportingReferenceIds: [...(currentCompiledEvidence.matchedReferences || []).map(r => r.id), ...(currentCompiledEvidence.relatedReferences || []).map(r => r.id)],
        createdAt: currentCompiledEvidence.createdAt,
      });
    }

    const comparisons = compareSelection.length >= 2 ? {
      comparedReferences: compareSelection.slice(0, 4),
      sharedConcepts: compareSynthesis?.provenance?.sharedConceptCount ? [] : [],
      uniqueConceptsByReference: compareSelection.map(id => {
        const ref = adapter.getReferenceById(retrievalState, id);
        return { referenceId: id, uniqueConcepts: ref?.keywords?.slice(0, 4) || [] };
      }),
      convergenceSummary: compareSynthesis ? `The compared set shares ${compareSynthesis.provenance?.sharedConceptCount || 0} concepts and ${compareSynthesis.provenance?.relationshipOverlapCount || 0} relationship patterns.` : "",
      divergenceSummary: compareSynthesis?.divergentNotes?.length ? `${compareSynthesis.divergentNotes.length} divergent evidence notes found.` : "",
    } : null;

    const synthesis = compareSynthesis ? {
      summary: compareSynthesis.summary?.text || "",
      sharedSupportCount: compareSynthesis.sharedSupport?.length || 0,
      divergentNoteCount: compareSynthesis.divergentNotes?.length || 0,
      confidenceLabel: compareSynthesis.confidence?.label,
      provenance: compareSynthesis.provenance?.generatedFrom || "compare-set",
    } : null;

    const trailConceptCount = new Set(knowledgeTrail.flatMap(e => {
      if (!e.metadata?.referenceId) return [];
      const ref = adapter.getReferenceById(retrievalState, e.metadata.referenceId);
      return ref?.keywords || [];
    })).size;

    const summaryText = currentSearchQuery
      ? `Research investigation "${currentSearchQuery}" — ${references.length} references, ${evidenceCount} evidence compilation${evidenceCount === 1 ? "" : "s"}, ${compareSelection.length} compared, ${pinnedReferences.length} pinned.`
      : `Research investigation — ${references.length} references reviewed, ${evidenceCount} evidence compilation${evidenceCount === 1 ? "" : "s"}, ${compareSelection.length} compared, ${pinnedReferences.length} pinned.`;

    return {
      id: `presentation-${now}`,
      createdAt: new Date().toISOString(),
      executiveSummary: {
        title: currentSearchQuery ? `Investigation: ${currentSearchQuery}` : "Research Investigation",
        text: summaryText,
        confidenceLabel: confidenceLabel || undefined,
      },
      investigation: {
        activeQuery: currentSearchQuery || "",
        selectedReferenceId: selectedReferenceId || "",
        selectedReferenceTitle: selectedRef?.title || "",
        focusedCluster: selectedRef ? getClusterLabel(selectedRef) : "",
        evidenceCount,
        comparedReferenceCount: compareSelection.length,
        pinnedCount: pinnedReferences.length,
        trailEventCount: knowledgeTrail.length,
        trailConceptCount,
      },
      narrative,
      references,
      evidence,
      comparisons,
      synthesis,
      actions: {
        canCopySnapshot: true,
        canReturnToWorkspace: true,
        canOpenEvidence: evidence.length > 0,
        canOpenCompare: compareSelection.length >= 2,
      },
    };
  }

  function renderPresentationMode() {
    const container = document.getElementById("presentation-container");
    if (!container) return;

    const payload = buildPresentationPayload();
    tryUnmountReactIsland(container);

    container.innerHTML = payload.id ? `
      <div class="nv-presentation-fallback">
        <h3>Research Presentation</h3>
        <p class="nv-muted">${escapeHtml(payload.executiveSummary?.text || "")}</p>
        ${payload.references?.length > 0 ? `<p class="nv-muted">${payload.references.length} references · ${payload.investigation.evidenceCount} evidence · ${payload.narrative.length} events</p>` : ""}
      </div>
    ` : createRichEmptyState({
      icon: "presentation",
      title: "No research narrative available",
      explanation: "No presentation is available until the current investigation has enough research context.",
      panel: true,
      primaryAction: { id: "presentation-empty-open-workspace", label: "Open workspace" }
    });

    document.getElementById("presentation-empty-open-workspace")?.addEventListener("click", () => {
      switchExplorationMode("search");
      document.getElementById("playground-search-input")?.focus();
    });

    if (tryMountReactIsland(container, "NvResearchPresentation", payload, {})) return;
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
        recentList.innerHTML = createRichEmptyState({
          icon: "recent",
          title: "No recent references",
          explanation: "Opened references will appear here for short-term recall.",
          compact: true,
          primaryAction: { id: "memory-empty-recent-action", label: "Begin investigation" }
        });
      } else {
        recentList.innerHTML = visibleRecent.map(id => {
          const ref = adapter.getReferenceById(retrievalState, id);
          if (!ref) {
            return `
              <li class="memory-item" data-ref-id="${id}" title="${escapeHtml(id)}" tabindex="0" role="button">
                <span>${escapeHtml(id)}</span>
              </li>
            `;
          }
          return `
            <li class="memory-panel-item">
              ${renderDiscoveryPanel({
                variant: "compact",
                reference: ref,
                reason: "Frequently explored with current reference",
                category: "recent",
                relationshipCount: getDiscoveryRelationshipCount(ref.id),
                relevanceLabel: "Moderate relevance",
                connectivityLabel: getConnectivityLabel(getDiscoveryRelationshipCount(ref.id)),
                iconPath: "assets/icons/scientific/memory-session/recent-activity.svg",
                showDescription: false,
                actions: ["open", "pin", "compare"]
              })}
            </li>
          `;
        }).join("");
        bindDiscoveryPanelActions(recentList, { onPinChange: renderMemoryLayer });

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
        pinnedList.innerHTML = createRichEmptyState({
          icon: "pinned",
          title: "No pinned references yet",
          explanation: "Pin important references to resume them quickly.",
          compact: true,
          primaryAction: {
            id: "memory-empty-pinned-action",
            label: selectedReferenceId ? "Pin current reference" : "Explore references"
          }
        });
      } else {
        pinnedList.innerHTML = pinnedReferences.map(id => {
          const ref = adapter.getReferenceById(retrievalState, id);
          if (!ref) {
            return `
              <li class="memory-item" data-ref-id="${id}" title="${escapeHtml(id)}" tabindex="0" role="button">
                <span>${escapeHtml(id)}</span>
                <button class="memory-action-btn" data-action="unpin" data-id="${id}" aria-label="Unpin ${id}">×</button>
              </li>
            `;
          }
          return `
            <li class="memory-panel-item">
              ${renderDiscoveryPanel({
                variant: "compact",
                reference: ref,
                reason: "Pinned context match",
                category: "pinned",
                relationshipCount: getDiscoveryRelationshipCount(ref.id),
                relevanceLabel: "High relevance",
                connectivityLabel: getConnectivityLabel(getDiscoveryRelationshipCount(ref.id)),
                iconPath: "assets/icons/scientific/collections/pinned-references.svg",
                showDescription: false,
                actions: ["open", "pin", "compare"]
              })}
            </li>
          `;
        }).join("");
        bindDiscoveryPanelActions(pinnedList, { onPinChange: renderMemoryLayer });

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
        queriesList.innerHTML = createRichEmptyState({
          icon: "queries",
          title: "No saved queries",
          explanation: "Save recurring investigations to resume them later.",
          compact: true,
          primaryAction: {
            id: "memory-empty-query-action",
            label: currentSearchQuery ? "Save search" : "Focus search input"
          }
        });
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
        trailList.innerHTML = createRichEmptyState({
          icon: "trail",
          title: "No knowledge trail yet",
          explanation: "Your trail will build as you explore references.",
          compact: true,
          primaryAction: { id: "memory-empty-trail-action", label: "Explore references" }
        });
      } else {
        const trailSummary = "";
        trailList.innerHTML = trailSummary + knowledgeTrail.map(event => {
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

    const focusSearchFromMemory = () => {
      switchExplorationMode("search");
      document.getElementById("playground-search-input")?.focus();
    };
    document.getElementById("memory-empty-recent-action")?.addEventListener("click", focusSearchFromMemory);
    document.getElementById("memory-empty-trail-action")?.addEventListener("click", focusSearchFromMemory);
    document.getElementById("memory-empty-pinned-action")?.addEventListener("click", () => {
      if (selectedReferenceId) pinReference(selectedReferenceId);
      else focusSearchFromMemory();
    });
    document.getElementById("memory-empty-query-action")?.addEventListener("click", () => {
      if (currentSearchQuery) document.getElementById("playground-save-query-button")?.click();
      else focusSearchFromMemory();
    });

    // ── React Island Enhancement ──────────────────────────────────────────
    // Mount the NvMemoryLayer island over the memory-layer-grid container.
    // Fallback HTML rendered above persists if React is unavailable.
    // JS callbacks own all state mutations; React only enhances the UI.
    const memoryGridContainer = document.getElementById('memory-layer-grid');
    if (memoryGridContainer) {
      const visibleRecent = recentReferences.filter(id => !pinnedReferences.includes(id));

      const buildMemoryItem = (id) => {
        const ref = adapter.getReferenceById(retrievalState, id);
        if (!ref) return { id, title: id, type: 'reference', relationshipCount: 0 };
        return {
          id: ref.id,
          title: ref.title,
          type: ref.type,
          relationshipCount: getDiscoveryRelationshipCount(ref.id),
        };
      };

      const memoryPayload = {
        pinned: pinnedReferences.map(buildMemoryItem),
        recent: visibleRecent.map(buildMemoryItem),
        savedQueries: savedQueries.map(query => ({
          query,
          matchCount: adapter.searchReferences(retrievalState, query).length,
        })),
        selectedReferenceId: selectedReferenceId || '',
        currentQuery: currentSearchQuery || '',
        trail: knowledgeTrail.map(event => ({
          id: event.id,
          type: event.type,
          label: event.label,
          timestamp: event.timestamp,
        })),
        trailSummaryHtml: "",
      };

      const memoryCallbacks = {
        onOpenReference: (id) => selectReference(id),
        onPinReference: (id) => pinReference(id),
        onUnpinReference: (id) => unpinReference(id),
        onRerunQuery: (query) => {
          const searchInput = document.getElementById('playground-search-input');
          if (searchInput) searchInput.value = query;
          runSearch(query, true);
        },
        onDeleteQuery: (query) => {
          savedQueries = savedQueries.filter(q => q !== query);
          const searchInput = document.getElementById('playground-search-input');
          const activeQuery = searchInput ? searchInput.value.trim() : '';
          const saveQueryBtn = document.getElementById('playground-save-query-button');
          if (saveQueryBtn && activeQuery === query) saveQueryBtn.disabled = false;
          saveWorkspaceState();
          renderMemoryLayer();
        },
        onRestoreTrail: (event) => restoreTrailContext(event),
        onClearTrail: () => {
          knowledgeTrail = [];
          saveWorkspaceState();
          renderMemoryLayer();
        },
        onToggleCollapse: () => {
          toggleMemoryPanelCollapsed();
        },
        onRunSearchFocus: () => {
          switchExplorationMode("search");
          const searchInput = document.getElementById('playground-search-input');
          if (searchInput) searchInput.focus();
        },
        onPinCurrentReference: () => {
          if (selectedReferenceId) pinReference(selectedReferenceId);
        },
        onSaveCurrentQuery: () => {
          document.getElementById('playground-save-query-button')?.click();
        },
        onAddToCompare: (id) => addToCompare(id),
      };

      tryMountReactIsland(memoryGridContainer, 'NvMemoryLayer', memoryPayload, memoryCallbacks);
    }
    // ── End React Island Enhancement ──────────────────────────────────────
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
        const isContextKey = e.key === "ContextMenu" || e.key === "F10" || (e.shiftKey && e.key === "F10");
        if (isContextKey && contextMenuController?.open?.(card, e)) {
          e.preventDefault();
          e.stopPropagation();
        } else if (e.key === "Enter" || e.key === " ") {
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

      const compareBtn = card.querySelector(".search-card-compare-btn");
      if (compareBtn) {
        compareBtn.onclick = (e) => {
          e.stopPropagation();
          addToCompare(compareBtn.getAttribute("data-id"));
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
      if (activeExplorationMode === "graph" && graphFocusMode === "follow" && neighborhoodDepth === "full") {
        neighborhoodDepth = "2-hop";
        const depthSelect = document.getElementById("graph-hop-select");
        if (depthSelect) depthSelect.value = neighborhoodDepth;
      }

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
    shouldFitGraphViewport = true;
    if (activeExplorationMode === "graph" && graphFocusMode === "follow" && neighborhoodDepth === "full") {
      neighborhoodDepth = "2-hop";
      const depthSelect = document.getElementById("graph-hop-select");
      if (depthSelect) depthSelect.value = neighborhoodDepth;
    }

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

      const pinnedList = document.getElementById("memory-pinned-list");
      if (pinnedList) runTransientClass(pinnedList, "is-updated", 200);
      const pinBtn = document.getElementById("playground-pin-button");
      if (pinBtn) runTransientClass(pinBtn, "is-updated", 200);
    }
  }

  function unpinReference(refId) {
    if (!refId) return;
    pinnedReferences = pinnedReferences.filter(id => id !== refId);
    addTrailEvent("unpin", `Unpinned "${refId}"`, { referenceId: refId });
    saveWorkspaceState();
    renderMemoryLayer();
    renderReferenceInspector();

    const pinnedList = document.getElementById("memory-pinned-list");
    if (pinnedList) runTransientClass(pinnedList, "is-updated", 200);
    const pinBtn = document.getElementById("playground-pin-button");
    if (pinBtn) runTransientClass(pinBtn, "is-updated", 200);
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
      if (mode === "graph" && graphFocusMode === "follow" && selectedReferenceId && neighborhoodDepth === "full") {
        neighborhoodDepth = "2-hop";
        const depthSelect = document.getElementById("graph-hop-select");
        if (depthSelect) depthSelect.value = neighborhoodDepth;
        shouldFitGraphViewport = true;
      }
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
      const modes = ["search", "graph", "discovery", "compare", "presentation"];
      modes.forEach(m => {
        const el = document.getElementById(`mode-${m}`);
        if (el) {
          if (m === mode) {
            el.classList.add("active", "nv-motion", "nv-motion-fade-in");
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
      } else if (mode === "presentation") {
        renderPresentationMode();
      }
      renderResearchSnapshot();
    } catch (err) {
      console.error(`Error in switchExplorationMode(${mode}):`, err);

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
          el.classList.add("active", "nv-motion", "nv-motion-slide-reveal");
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
      const setPreferencesOpen = (isOpen) => {
        prefsPanel.style.display = isOpen ? "flex" : "none";
        prefsBtn.setAttribute("aria-expanded", String(isOpen));
      };
      setPreferencesOpen(prefsPanel.style.display !== "none");
      prefsBtn.onclick = () => {
        setPreferencesOpen(prefsPanel.style.display === "none");
      };
      prefsPanel.onkeydown = (e) => {
        if (e.key === "Escape") {
          setPreferencesOpen(false);
          prefsBtn.focus();
        }
      };
      if (!preferencesEscapeHandlerBound) {
        document.addEventListener("keydown", (e) => {
          const panel = document.getElementById("preferences-panel");
          const trigger = document.getElementById("playground-preferences-button");
          if (!panel || e.key !== "Escape" || panel.style.display === "none") return;
          panel.style.display = "none";
          if (trigger) {
            trigger.setAttribute("aria-expanded", "false");
            trigger.focus();
          }
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
      if (!richPreviewController) {
        richPreviewController = createRichHoverPreviewController();
      }
      if (!contextMenuController) {
        contextMenuController = createContextMenuController();
      }
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
      const memoryCollapseBtn = document.getElementById("memory-toggle-collapse-button");
      const graphResetButton = document.getElementById("graph-reset-view-button");
      const graphZoomInButton = document.getElementById("graph-zoom-in-button");
      const graphZoomOutButton = document.getElementById("graph-zoom-out-button");

      if (graphResetButton) {
        graphResetButton.onclick = () => {
          resetGraphViewport(true);
          addTrailEvent("Graph view reset", "Reset graph zoom and pan", { viewport: graphViewport });
        };
      }

      if (graphZoomInButton) {
        graphZoomInButton.onclick = () => {
          setGraphViewport({
            x: graphViewport.x,
            y: graphViewport.y,
            scale: clampGraphScale(graphViewport.scale * 1.16)
          });
          renderVisualGraph();
          addTrailEvent("Graph zoom changed", "Zoomed graph in", { scale: graphViewport.scale });
        };
      }

      if (graphZoomOutButton) {
        graphZoomOutButton.onclick = () => {
          setGraphViewport({
            x: graphViewport.x,
            y: graphViewport.y,
            scale: clampGraphScale(graphViewport.scale * 0.86)
          });
          renderVisualGraph();
          addTrailEvent("Graph zoom changed", "Zoomed graph out", { scale: graphViewport.scale });
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
      const labelModeSelect = document.getElementById("graph-label-mode-select");
      const focusModeSelect = document.getElementById("graph-focus-mode-select");

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

      if (labelModeSelect) {
        labelModeSelect.value = graphLabelMode;
        labelModeSelect.onchange = (e) => {
          graphLabelMode = e.target.value;
          addTrailEvent("Graph labels changed", `Changed graph label mode to "${graphLabelMode}"`, { labelMode: graphLabelMode });
          saveWorkspaceState();
          renderVisualGraph();
        };
      }

      if (focusModeSelect) {
        focusModeSelect.value = graphFocusMode;
        focusModeSelect.onchange = (e) => {
          graphFocusMode = e.target.value;
          if (graphFocusMode === "follow" && selectedReferenceId && neighborhoodDepth === "full") {
            neighborhoodDepth = "2-hop";
            if (depthSelect) depthSelect.value = neighborhoodDepth;
          }
          shouldFitGraphViewport = true;
          addTrailEvent("Graph focus changed", `Changed graph focus behavior to "${graphFocusMode}"`, { focusMode: graphFocusMode });
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
          setButtonBusy(compileQueryBtn, "Compiling...", () => {
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
          });
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
          const focusModeSelect = document.getElementById("graph-focus-mode-select");
          if (filterSelect) filterSelect.value = "all";
          if (depthSelect) depthSelect.value = "full";
          if (focusModeSelect) focusModeSelect.value = "follow";

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
          renderResearchSnapshot();

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
          renderResearchSnapshot();
        };
      }

      if (memoryCollapseBtn) {
        memoryCollapseBtn.onclick = (e) => {
          e.stopPropagation();
          toggleMemoryPanelCollapsed();
        };
      }
    } catch (err) {
      console.error("Error in initPlayground():", err);

    }
  }

  // Listen for the custom route render event or fallback if already loaded
  window.addEventListener('nv:routerendered', (e) => {
    if (e.detail?.routeId === "retrieval-playground") {
      initPlayground();
      consumeSemanticContext();
    }
  });

  // Consume semantic context from URL or sessionStorage
  function consumeSemanticContext() {
    const SemanticContext = window.NeuralVerse?.SemanticContext;
    if (!SemanticContext) return;

    // Check URL for query parameter
    const urlQuery = SemanticContext.getParamFromHash('q');
    if (urlQuery) {
      const searchInput = document.getElementById("playground-search-input");
      if (searchInput) {
        searchInput.value = urlQuery;
        if (typeof window.runSearch === 'function') {
          window.runSearch(urlQuery);
        }
      }
      return;
    }

    // Check sessionStorage for semantic context
    const ctx = SemanticContext.getActiveContext();
    if (ctx && ctx.name) {
      const searchInput = document.getElementById("playground-search-input");
      if (searchInput) {
        searchInput.value = ctx.name;
        if (typeof window.runSearch === 'function') {
          window.runSearch(ctx.name);
        }
      }
    }
  }

  // Subscribe to live semantic context updates
  function handleSemanticContextUpdate(e) {
    const ctx = e && e.detail;
    if (!ctx || !ctx.name) return;
    const searchInput = document.getElementById("playground-search-input");
    if (searchInput && document.visibilityState === 'visible') {
      searchInput.value = ctx.name;
      if (typeof window.runSearch === 'function') {
        window.runSearch(ctx.name);
      }
    }
  }

  window.addEventListener('nv:semantic-concept-selected', handleSemanticContextUpdate);

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

  // Export standardized microvisualization rendering helpers
  window.renderContributionBar = renderContributionBar;
  window.renderDensityMeter = renderDensityMeter;
  window.renderCoverageStrip = renderCoverageStrip;
  window.renderConfidenceGauge = renderConfidenceGauge;
  window.renderConnectivityIndicator = renderConnectivityIndicator;
  window.renderTrailSparkline = renderTrailSparkline;
  window.renderClusterIndicator = renderClusterIndicator;
  window.renderSessionProgress = renderSessionProgress;
})();
