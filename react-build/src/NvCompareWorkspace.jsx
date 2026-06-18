import React, { useState } from "react";
import {
  NvBadge,
  NvButton,
  NvChip,
  NvContributionBar,
  NvInspectorSection,
  NvMetric,
  NvMicroViz,
  NvScientificIcon,
} from "./components.jsx";
import { NvSlideReveal } from "./motion/NvMotion.jsx";

const ICONS = {
  compare: "assets/icons/scientific/knowledge-graph/semantic-path.svg",
  graph: "assets/icons/scientific/knowledge-graph/active-neighborhood.svg",
  evidence: "assets/icons/scientific/evidence/evidence-convergence.svg",
  concepts: "assets/icons/scientific/knowledge-graph/knowledge-cluster.svg",
  convergence: "assets/icons/scientific/knowledge-graph/citation-bridge.svg",
  diff: "assets/icons/scientific/knowledge-graph/semantic-path.svg",
  graphSync: "assets/icons/scientific/knowledge-graph/active-neighborhood.svg",
};

function shortSource(source = "") {
  if (!source) return "No source";
  return source
    .replace(/^https?:\/\//, "")
    .replace(/^local:\/\//, "")
    .slice(0, 42);
}

export function NvCompareMetricRow({ label, value }) {
  return (
    <div className="nv-compare-metric-row">
      <span>{label}</span>
      <strong>{value || "Not available"}</strong>
    </div>
  );
}

export function NvCompareTray({ items = [], limit = 4, feedback = "", callbacks = {} }) {
  return (
    <section className="nv-compare-tray" aria-labelledby="nv-compare-tray-title">
      <div className="nv-compare-section-heading">
        <NvScientificIcon iconPath={ICONS.compare} size="sm" />
        <h3 id="nv-compare-tray-title">Compare Tray</h3>
        <NvBadge variant={items.length >= 2 ? "success" : "neutral"}>
          {items.length}/{limit}
        </NvBadge>
      </div>
      {feedback && (
        <p className="nv-compare-feedback" role="status" aria-live="polite">
          {feedback}
        </p>
      )}
      {items.length === 0 ? (
        <p className="nv-compare-empty">
          Add 2-4 references from discovery cards, memory, inspector links, hover previews, or graph context menus.
        </p>
      ) : (
        <div className="nv-compare-tray__items" aria-label="Selected compare references">
          {items.map((item, index) => (
            <article
              key={item.id}
              className="nv-compare-tray-card"
              aria-label={`Comparison item ${index + 1}: ${item.title}`}
            >
              <span className="nv-compare-tray-card__index">{index + 1}</span>
              <div>
                <strong>{item.title}</strong>
                <span>
                  {item.type || "reference"} &middot; {item.relationshipCount} link
                  {item.relationshipCount === 1 ? "" : "s"}
                </span>
              </div>
              <NvButton
                variant="ghost"
                className="nv-compare-mini-action"
                ariaLabel={`Remove ${item.title} from compare`}
                onClick={() => callbacks.onRemove?.(item.id)}
              >
                Remove
              </NvButton>
            </article>
          ))}
        </div>
      )}
      <div className="nv-compare-actions-inline">
        {items.length >= 2 && (
          <NvButton variant="primary" onClick={() => callbacks.onOpenCompare?.()}>
            Open Compare Workspace
          </NvButton>
        )}
        {items.length > 0 && (
          <NvButton variant="ghost" onClick={() => callbacks.onClear?.()}>
            Clear Compare
          </NvButton>
        )}
      </div>
    </section>
  );
}

export function NvCompareActions({ item, callbacks = {} }) {
  if (!item) return null;
  const compileDisabled = !item.canCompile;
  const focusDisabled = !callbacks.onFocusInGraph;
  return (
    <div className="nv-compare-column__actions">
      <NvButton
        variant="primary"
        onClick={() => callbacks.onOpenReference?.(item.id)}
      >
        Open Reference
      </NvButton>
      <NvButton
        variant="secondary"
        onClick={() => callbacks.onTogglePin?.(item.id)}
      >
        {item.isPinned ? "Unpin" : "Pin"}
      </NvButton>
      <NvButton
        variant="secondary"
        disabled={compileDisabled}
        ariaLabel={
          compileDisabled
            ? "Compile uses the primary compared reference when available"
            : `Compile evidence from ${item.title}`
        }
        onClick={() => callbacks.onCompile?.(item.id)}
      >
        Compile Evidence
      </NvButton>
      <NvButton
        variant="secondary"
        disabled={focusDisabled}
        ariaLabel={focusDisabled ? "Graph mode required" : `Focus ${item.title} in graph`}
        onClick={() => callbacks.onFocusInGraph?.(item.id)}
      >
        Focus in Graph
      </NvButton>
      <NvButton variant="ghost" onClick={() => callbacks.onRemove?.(item.id)}>
        Remove
      </NvButton>
    </div>
  );
}

export function NvCompareColumn({ item, index = 0, callbacks = {} }) {
  if (!item) return null;
  return (
    <article
      className="nv-compare-column"
      aria-label={`Comparison item ${index + 1}: ${item.title}`}
    >
      <header className="nv-compare-column__header">
        <span className="nv-compare-column__index">{index + 1}</span>
        <div>
          <h3>{item.title}</h3>
          <div className="nv-compare-column__meta">
            <NvBadge variant="info">{item.type || "reference"}</NvBadge>
            <NvMetric label={item.status || "active"} />
          </div>
        </div>
      </header>
      <div className="nv-compare-column__body">
        <NvCompareMetricRow label="Source" value={shortSource(item.source)} />
        <NvCompareMetricRow label="Cluster" value={item.clusterLabel} />
        <NvCompareMetricRow
          label="Relationships"
          value={`${item.relationshipCount} direct`}
        />
        <NvCompareMetricRow
          label="Connectivity"
          value={item.connectivityLabel}
        />
        {item.keywords?.length > 0 && (
          <div
            className="nv-compare-keywords"
            aria-label={`Concepts for ${item.title}`}
          >
            {item.keywords
              .slice(0, 6)
              .map((keyword) => (
                <NvChip key={keyword}>{keyword}</NvChip>
              ))}
          </div>
        )}
      </div>
      <NvCompareActions item={item} callbacks={callbacks} />
    </article>
  );
}

export function NvCompareMatrix({ items = [], callbacks = {} }) {
  if (items.length < 2) {
    return (
      <p className="nv-compare-empty">
        Select at least two references to compare metadata side by side.
      </p>
    );
  }
  return (
    <section
      className="nv-compare-matrix"
      aria-label="Metadata comparison columns"
    >
      {items.map((item, index) => (
        <NvCompareColumn
          key={item.id}
          item={item}
          index={index}
          callbacks={callbacks}
        />
      ))}
    </section>
  );
}

export function NvCompareSection({ title, iconPath, children, className = "" }) {
  return (
    <NvInspectorSection title={title} className={`nv-compare-section ${className}`}>
      <div className="nv-compare-section__title" aria-hidden="true">
        <NvScientificIcon iconPath={iconPath} size="sm" />
      </div>
      {children}
    </NvInspectorSection>
  );
}

export function NvCompareEmptyState({ title, message, iconPath }) {
  return (
    <div className="nv-compare-empty-state" role="status">
      {iconPath && (
        <NvScientificIcon iconPath={iconPath} size="md" aria-hidden="true" />
      )}
      <p className="nv-compare-empty-state__title">{title}</p>
      {message && <p className="nv-compare-empty-state__message">{message}</p>}
    </div>
  );
}

export function NvCompareConvergenceLine({
  convergence = {},
  callbacks = {},
}) {
  const {
    sharedConcepts = [],
    sharedRelationshipTypes = [],
    sharedEvidenceReferenceIds = [],
    commonNeighborhoodLabels = [],
  } = convergence;

  if (sharedConcepts.length === 0 && sharedRelationshipTypes.length === 0 && sharedEvidenceReferenceIds.length === 0 && commonNeighborhoodLabels.length === 0) {
    return null;
  }

  return (
    <section
      className="nv-compare-convergence-line"
      aria-label="Shared comparison context"
    >
      <div className="nv-compare-convergence-line__header">
        <NvScientificIcon iconPath={ICONS.convergence} size="sm" />
        <h3>Convergence Line</h3>
        <span className="nv-compare-convergence-line__badge">
          Shared analytical context
        </span>
      </div>
      <div className="nv-compare-convergence-line__body">
        {sharedConcepts.length > 0 && (
          <div className="nv-compare-convergence-line__block">
            <span className="nv-compare-convergence-line__label">
              Shared concepts
            </span>
            <div className="nv-compare-chip-row">
              {sharedConcepts.map((concept) => (
                <NvChip key={concept} variant="accent">
                  {concept}
                </NvChip>
              ))}
            </div>
          </div>
        )}
        {sharedRelationshipTypes.length > 0 && (
          <div className="nv-compare-convergence-line__block">
            <span className="nv-compare-convergence-line__label">
              Shared relationship types
            </span>
            <div className="nv-compare-chip-row">
              {sharedRelationshipTypes.map((type) => (
                <NvChip key={type} variant="neutral">
                  {type}
                </NvChip>
              ))}
            </div>
          </div>
        )}
        {commonNeighborhoodLabels.length > 0 && (
          <div className="nv-compare-convergence-line__block">
            <span className="nv-compare-convergence-line__label">
              Common neighborhood
            </span>
            <p className="nv-compare-muted">
              {commonNeighborhoodLabels.join(", ")}
            </p>
          </div>
        )}
        {sharedEvidenceReferenceIds.length > 0 && (
          <div className="nv-compare-convergence-line__block">
            <span className="nv-compare-convergence-line__label">
              Shared in active evidence
            </span>
            <NvBadge variant="success">
              {sharedEvidenceReferenceIds.length} reference
              {sharedEvidenceReferenceIds.length === 1 ? "" : "s"}
            </NvBadge>
          </div>
        )}
      </div>
    </section>
  );
}

export function NvCompareSemanticDiff({ semanticDiff = {}, callbacks = {} }) {
  const { uniqueByReference = [] } = semanticDiff;

  if (uniqueByReference.length === 0) return null;

  const hasAnyContent = uniqueByReference.some(
    (ref) =>
      ref.uniqueConcepts?.length > 0 ||
      ref.uniqueRelationshipTypes?.length > 0 ||
      ref.uniqueConnectedReferences?.length > 0
  );

  return (
    <section
      className="nv-compare-semantic-diff"
      aria-label="Semantic difference analysis"
    >
      <div className="nv-compare-semantic-diff__header">
        <NvScientificIcon iconPath={ICONS.diff} size="sm" />
        <h3>Semantic Differences</h3>
      </div>
      <div className="nv-compare-semantic-diff__body">
        {!hasAnyContent && (
          <p className="nv-compare-empty">
            No semantic differences detected from current metadata.
          </p>
        )}
        {uniqueByReference.map((ref) => {
          const hasContent =
            ref.uniqueConcepts?.length > 0 ||
            ref.uniqueRelationshipTypes?.length > 0 ||
            ref.uniqueConnectedReferences?.length > 0;
          if (!hasContent) return null;
          return (
            <article
              key={ref.referenceId}
              className="nv-compare-diff-card"
              aria-label={`Unique aspects for ${ref.title}`}
            >
              <h4>{ref.title}</h4>
              {ref.uniqueConcepts?.length > 0 && (
                <div className="nv-compare-diff-card__block">
                  <span className="nv-compare-diff-card__label">
                    Unique concepts
                  </span>
                  <div className="nv-compare-chip-row">
                    {ref.uniqueConcepts.map((concept) => (
                      <NvChip key={concept} variant="neutral">
                        {concept}
                      </NvChip>
                    ))}
                  </div>
                </div>
              )}
              {ref.uniqueRelationshipTypes?.length > 0 && (
                <div className="nv-compare-diff-card__block">
                  <span className="nv-compare-diff-card__label">
                    Unique relationship types
                  </span>
                  <p className="nv-compare-muted">
                    {ref.uniqueRelationshipTypes.join(", ")}
                  </p>
                </div>
              )}
              {ref.uniqueConnectedReferences?.length > 0 && (
                <div className="nv-compare-diff-card__block">
                  <span className="nv-compare-diff-card__label">
                    Unique connections
                  </span>
                  <p className="nv-compare-muted">
                    {ref.uniqueConnectedReferences.join(", ")}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function NvCompareEvidenceOverlap({
  evidenceOverlap = {},
  callbacks = {},
}) {
  const { hasActiveEvidence = false, contributors = [] } = evidenceOverlap;

  return (
    <NvCompareSection
      title="Evidence Overlap"
      iconPath={ICONS.evidence}
      className="nv-compare-evidence-overlap"
    >
      {!hasActiveEvidence ? (
        <p className="nv-compare-empty">
          No active evidence compilation. Compile evidence to compare support context.
        </p>
      ) : contributors.length === 0 ? (
        <p className="nv-compare-empty">
          No evidence contributors in current compare set.
        </p>
      ) : (
        <div className="nv-compare-evidence-overlap__grid">
          {contributors.map((item) => (
            <article
              key={item.referenceId}
              className="nv-compare-evidence-overlap__card"
            >
              <h4>{item.title || item.referenceId}</h4>
              <NvContributionBar
                label={
                  item.contributionLabel ||
                  (item.usedInCurrentEvidence
                    ? "Contributes to current evidence"
                    : "Not used in current evidence")
                }
                level={
                  item.usedInCurrentEvidence
                    ? item.contributionLevel || 3
                    : 1
                }
                max={4}
              />
              {item.usedInCurrentEvidence && (
                <NvBadge variant="success">In active evidence</NvBadge>
              )}
            </article>
          ))}
        </div>
      )}
    </NvCompareSection>
  );
}

export function NvCompareGraphSyncStatus({
  graphSync = {},
  callbacks = {},
}) {
  const {
    activeCompareReferenceId = "",
    graphModeActive = false,
    visibleInGraphReferenceIds = [],
  } = graphSync;

  return (
    <NvCompareSection
      title="Graph Sync Status"
      iconPath={ICONS.graphSync}
      className="nv-compare-graph-sync"
    >
      {!graphModeActive ? (
        <div className="nv-compare-graph-sync__info">
          <p className="nv-compare-muted">
            Switch to Graph Mode to see these references in the knowledge graph.
          </p>
          {visibleInGraphReferenceIds.length > 0 && callbacks.onFocusInGraph && (
            <NvButton
              variant="secondary"
              onClick={() =>
                callbacks.onFocusInGraph?.(visibleInGraphReferenceIds[0])
              }
            >
              Open in Graph
            </NvButton>
          )}
        </div>
      ) : (
        <div className="nv-compare-graph-sync__info">
          <p className="nv-compare-muted">
            {visibleInGraphReferenceIds.length} reference
            {visibleInGraphReferenceIds.length === 1 ? " is" : "s are"} visible
            in the active graph.
          </p>
          {activeCompareReferenceId && (
            <NvBadge variant="success">Focused in graph</NvBadge>
          )}
          {visibleInGraphReferenceIds.slice(0, 3).map((id) => (
            <NvButton
              key={id}
              variant="ghost"
              onClick={() => callbacks.onFocusItem?.(id)}
            >
              Focus {id}
            </NvButton>
          ))}
        </div>
      )}
    </NvCompareSection>
  );
}

export function NvCompareSetManager({
  canSave = false,
  savedSets = [],
  callbacks = {},
}) {
  return null;
}

export function NvCompareSharedConcepts({ shared = {} }) {
  const concepts = shared.concepts || [];
  const types = shared.types || [];
  const relationships = shared.relationships || [];
  return (
    <NvCompareSection title="Shared Concepts" iconPath={ICONS.concepts}>
      {concepts.length === 0 ? (
        <p className="nv-compare-empty">
          No shared concepts detected from current metadata.
        </p>
      ) : (
        <div className="nv-compare-chip-row">
          {concepts.map((item) => (
            <NvChip key={item} variant="accent">
              {item}
            </NvChip>
          ))}
        </div>
      )}
      {types.length > 0 && (
        <p className="nv-compare-muted">
          Shared types: {types.join(", ")}
        </p>
      )}
      {relationships.length > 0 && (
        <p className="nv-compare-muted">
          Shared relationship patterns: {relationships.join(", ")}
        </p>
      )}
    </NvCompareSection>
  );
}

export function NvCompareUniqueRelationships({ differences = [] }) {
  return (
    <NvCompareSection title="Unique Relationships" iconPath={ICONS.graph}>
      <div className="nv-compare-difference-grid">
        {differences.map((diff) => (
          <article
            key={diff.referenceId}
            className="nv-compare-difference-card"
          >
            <h4>{diff.title || diff.referenceId}</h4>
            {diff.uniqueConcepts?.length > 0 && (
              <p>
                <strong>Unique concepts:</strong>{" "}
                {diff.uniqueConcepts.join(", ")}
              </p>
            )}
            {diff.uniqueRelationships?.length > 0 ? (
              <ul>
                {diff.uniqueRelationships.map((rel) => (
                  <li key={rel}>{rel}</li>
                ))}
              </ul>
            ) : (
              <p className="nv-compare-empty">
                No unique direct relationships in selected set.
              </p>
            )}
          </article>
        ))}
      </div>
    </NvCompareSection>
  );
}

export function NvCompareEvidenceContribution({ evidenceContext = [] }) {
  return (
    <NvCompareSection title="Evidence Contribution" iconPath={ICONS.evidence}>
      {evidenceContext.length === 0 ? (
        <p className="nv-compare-empty">No active evidence compilation.</p>
      ) : (
        <div className="nv-compare-evidence-grid">
          {evidenceContext.map((item) => (
            <article
              key={item.referenceId}
              className="nv-compare-evidence-card"
            >
              <h4>{item.title || item.referenceId}</h4>
              <NvContributionBar
                label={
                  item.contributionLabel ||
                  (item.usedInCurrentEvidence
                    ? "Contributes to current evidence"
                    : "Not used in current evidence")
                }
                level={
                  item.usedInCurrentEvidence
                    ? item.contributionLevel || 3
                    : 1
                }
                max={4}
              />
            </article>
          ))}
        </div>
      )}
    </NvCompareSection>
  );
}

export function NvCompareGraphPosition({ graphContext = [] }) {
  return (
    <NvCompareSection title="Graph Position" iconPath={ICONS.graph}>
      <div className="nv-compare-graph-grid">
        {graphContext.map((item) => (
          <article key={item.referenceId} className="nv-compare-graph-card">
            <h4>{item.title || item.referenceId}</h4>
            <NvCompareMetricRow
              label="Relationships"
              value={`${item.relationshipCount} direct`}
            />
            <NvCompareMetricRow
              label="Connectivity"
              value={item.connectivityLabel}
            />
            <NvCompareMetricRow label="Cluster" value={item.clusterLabel} />
            {item.microvisualizationHtml && (
              <NvMicroViz
                html={item.microvisualizationHtml}
                ariaLabel={`Local graph position for ${item.title || item.referenceId}`}
              />
            )}
          </article>
        ))}
      </div>
    </NvCompareSection>
  );
}

export function NvCompareSynthesisSummary({ summary = {} }) {
  if (!summary.title) return null;
  return (
    <div className="nv-synthesis-summary">
      <h3>{summary.title}</h3>
      <p>{summary.text}</p>
      {summary.basis && (
        <span className="nv-synthesis-summary__basis">
          Based on: {summary.basis.replace(/-/g, " ")}
        </span>
      )}
    </div>
  );
}

export function NvSharedSupportReferences({ sharedSupport = [], callbacks = {} }) {
  if (sharedSupport.length === 0) return null;
  return (
    <NvCompareSection title="Shared Support" iconPath={ICONS.evidence}>
      <div className="nv-synthesis-shared-grid">
        {sharedSupport.map((item) => (
          <article key={item.referenceId} className="nv-synthesis-shared-card">
            <div className="nv-synthesis-shared-card__header">
              <h4>{item.title}</h4>
              <NvBadge variant="info">{item.type || "reference"}</NvBadge>
            </div>
            {item.sharedConcepts?.length > 0 && (
              <div className="nv-compare-chip-row">
                {item.sharedConcepts.map((concept) => (
                  <NvChip key={concept} variant="accent">{concept}</NvChip>
                ))}
              </div>
            )}
            {item.relationshipTypes?.length > 0 && (
              <p className="nv-compare-muted">
                Overlapping: {item.relationshipTypes.join(", ")}
              </p>
            )}
            <NvContributionBar
              label={item.contributionLabel || "Context"}
              level={
                item.contributionLabel === "Primary" ? 4
                  : item.contributionLabel === "Supporting" ? 3
                  : item.contributionLabel === "Minor" ? 2
                  : 1
              }
              max={4}
            />
            <div className="nv-compare-column__actions">
              <NvButton variant="primary" onClick={() => callbacks.onOpenReference?.(item.referenceId)}>
                Open Reference
              </NvButton>
              <NvButton variant="secondary" onClick={() => callbacks.onTogglePin?.(item.referenceId)}>
                {item.isPinned ? "Unpin" : "Pin"}
              </NvButton>
            </div>
          </article>
        ))}
      </div>
    </NvCompareSection>
  );
}

export function NvDivergentEvidenceNotes({ divergentNotes = [] }) {
  if (divergentNotes.length === 0) return null;
  return (
    <NvCompareSection title="Divergent Evidence Notes" iconPath={ICONS.diff}>
      <div className="nv-synthesis-divergent-grid">
        {divergentNotes.map((item) => (
          <article key={item.referenceId} className="nv-synthesis-divergent-card">
            <h4>{item.title}</h4>
            {item.uniqueConcepts?.length > 0 && (
              <div className="nv-compare-chip-row">
                {item.uniqueConcepts.map((concept) => (
                  <NvChip key={concept} variant="neutral">{concept}</NvChip>
                ))}
              </div>
            )}
            {item.uniqueRelationships?.length > 0 && (
              <ul className="nv-synthesis-divergent-rels">
                {item.uniqueRelationships.map((rel) => (
                  <li key={rel}>{rel}</li>
                ))}
              </ul>
            )}
            <p className="nv-compare-muted">{item.note}</p>
          </article>
        ))}
      </div>
    </NvCompareSection>
  );
}

export function NvSourceContributionMap({ contributionMap = [] }) {
  if (contributionMap.length === 0) return null;
  return (
    <NvCompareSection title="Source Contribution Map" iconPath={ICONS.graph}>
      <div className="nv-synthesis-contribution-grid">
        {contributionMap.map((item) => (
          <article key={item.referenceId} className="nv-synthesis-contribution-row">
            <div className="nv-synthesis-contribution-row__label">
              <strong>{item.title}</strong>
            </div>
            <NvContributionBar
              label={item.contributionLabel}
              level={item.contributionLevel || 1}
              max={4}
            />
            <span className="nv-compare-muted">{item.basis}</span>
          </article>
        ))}
      </div>
    </NvCompareSection>
  );
}

export function NvSynthesisConfidenceSummary({ confidence = {} }) {
  if (!confidence.label) return null;
  return (
    <NvCompareSection title="Synthesis Confidence" iconPath={ICONS.evidence}>
      <div className="nv-synthesis-confidence">
        <NvBadge
          variant={
            confidence.label === "High Support" ? "success"
              : confidence.label === "Moderate Support" ? "warning"
              : "error"
          }
        >
          {confidence.label}
        </NvBadge>
        <p className="nv-compare-muted">{confidence.rationale}</p>
      </div>
    </NvCompareSection>
  );
}

export function NvExportReadyEvidenceBlock({ synthesis = {}, callbacks = {} }) {
  if (!synthesis.id) return null;
  const block = synthesis.compareSet
    ? `Comparative Evidence Synthesis\n${synthesis.summary?.title || ""}\n${synthesis.summary?.text || ""}\n\nConfidence: ${synthesis.confidence?.label || "Limited Support"}\n\nCompared References: ${synthesis.compareSet.map(r => r.title).join("; ")}\n\nGenerated: ${synthesis.createdAt || ""}`
    : "";

  return (
    <NvCompareSection title="Export-Ready Evidence Block" iconPath={ICONS.evidence}>
      <pre className="nv-synthesis-export-block">{block}</pre>
      <div className="nv-synthesis-export-actions">
        <NvButton variant="secondary" onClick={() => callbacks.onCopySynthesisBlock?.()}>
          Copy Block
        </NvButton>
        <NvButton variant="ghost" disabled={true} ariaLabel="Export Snapshot — Future">
          Export Snapshot
        </NvButton>
      </div>
    </NvCompareSection>
  );
}

export function NvCompareSynthesisActions({ synthesis = {}, callbacks = {} }) {
  const hasSynthesis = Boolean(synthesis?.id);
  return (
    <div className="nv-synthesis-actions" aria-label="Synthesis actions">
      {!hasSynthesis && (
        <NvButton variant="primary" onClick={() => callbacks.onCompileSynthesis?.()}>
          Compile Evidence from Compare Set
        </NvButton>
      )}
      {hasSynthesis && (
        <div className="nv-compare-actions-inline">
          <NvButton variant="primary" onClick={() => callbacks.onCompileSynthesis?.()}>
            Recompile Synthesis
          </NvButton>
          <NvButton variant="ghost" onClick={() => callbacks.onClearSynthesis?.()}>
            Clear Synthesis
          </NvButton>
        </div>
      )}
      <NvButton variant="ghost" onClick={() => callbacks.onOpenCompare?.()}>
        Return to Compare
      </NvButton>
    </div>
  );
}

export function NvCompareSynthesisPanel({ data = {}, callbacks = {} }) {
  const { compareSynthesis } = data;
  if (!compareSynthesis?.id) {
    return (
      <section className="nv-compare-synthesis-panel" aria-label="Evidence synthesis">
        <NvCompareSynthesisActions synthesis={null} callbacks={callbacks} />
        <NvCompareEmptyState
          title="No comparative synthesis compiled"
          message="Add 2-4 references to the compare set and compile evidence from the set to generate a comparative synthesis."
          iconPath={ICONS.evidence}
        />
      </section>
    );
  }

  const {
    summary = {},
    sharedSupport = [],
    divergentNotes = [],
    contributionMap = [],
    confidence = {},
    provenance = {},
    actions = {},
  } = compareSynthesis;

  return (
    <section className="nv-compare-synthesis-panel" aria-labelledby="nv-synthesis-panel-title">
      <header className="nv-compare-synthesis-panel__header">
        <div className="nv-compare-synthesis-panel__heading">
          <NvScientificIcon iconPath={ICONS.evidence} size="md" />
          <h2 id="nv-synthesis-panel-title">Evidence Synthesis</h2>
        </div>
        <div className="nv-compare-synthesis-panel__badges">
          {provenance.comparedReferences > 0 && (
            <NvBadge variant="info">{provenance.comparedReferences} references</NvBadge>
          )}
          {provenance.sharedConceptCount > 0 && (
            <NvBadge variant="info">{provenance.sharedConceptCount} shared concepts</NvBadge>
          )}
        </div>
      </header>

      <NvCompareSynthesisActions synthesis={compareSynthesis} callbacks={callbacks} />
      <NvCompareSynthesisSummary summary={summary} />

      <div className="nv-compare-analysis-grid">
        <NvSharedSupportReferences sharedSupport={sharedSupport} callbacks={callbacks} />
        <NvDivergentEvidenceNotes divergentNotes={divergentNotes} />
        <NvSourceContributionMap contributionMap={contributionMap} />
        <NvSynthesisConfidenceSummary confidence={confidence} />
      </div>

      <NvExportReadyEvidenceBlock synthesis={compareSynthesis} callbacks={callbacks} />
    </section>
  );
}

export function NvCompareWorkspace({ data = {}, callbacks = {} }) {
  const {
    items = [],
    shared = {},
    differences = [],
    graphContext = [],
    evidenceContext = [],
    convergence = {},
    semanticDiff = {},
    evidenceOverlap = {},
    graphSync = {},
    feedback = "",
    limit = 4,
    actions = {},
    compareSynthesis = null,
  } = data;

  const hasItems = items.length >= 2;
  const hasSingleItem = items.length === 1;

  return (
    <NvSlideReveal
      as="section"
      className="nv-compare-workspace"
      aria-labelledby="nv-compare-workspace-title"
    >
      <header className="nv-compare-workspace__header">
        <div className="nv-compare-workspace__heading">
          <NvScientificIcon iconPath={ICONS.compare} size="md" />
          <div>
            <p className="nv-compare-eyebrow">Comparative Research Mode</p>
            <h2 id="nv-compare-workspace-title">Reference Comparison</h2>
          </div>
        </div>
        <div className="nv-compare-workspace__toolbar">
          {actions.canCompileFromSet && items.length > 0 && (
            <NvButton
              variant="secondary"
              disabled={!callbacks.onCompileFromQuery}
              onClick={() => callbacks.onCompileFromQuery?.()}
              ariaLabel="Compile evidence from current compare set"
            >
              Compile from Set
            </NvButton>
          )}
          {actions.canSaveCompareSet && <NvCompareSetManager canSave />}
          <NvButton
            variant="ghost"
            disabled={items.length === 0}
            onClick={() => callbacks.onClear?.()}
          >
            Clear Compare
          </NvButton>
        </div>
      </header>

      <NvCompareTray
        items={items}
        limit={limit}
        feedback={feedback}
        callbacks={callbacks}
      />

      {hasItems && (
        <NvCompareConvergenceLine
          convergence={convergence}
          callbacks={callbacks}
        />
      )}

      {hasItems && (
        <NvCompareSynthesisPanel data={{ compareSynthesis }} callbacks={callbacks} />
      )}

      <NvCompareMatrix items={items} callbacks={callbacks} />

      {hasItems && (
        <div className="nv-compare-analysis-grid">
          <NvCompareSharedConcepts shared={shared} />
          <NvCompareUniqueRelationships differences={differences} />
          <NvCompareEvidenceContribution evidenceContext={evidenceContext} />
          <NvCompareGraphPosition graphContext={graphContext} />
          <NvCompareEvidenceOverlap
            evidenceOverlap={evidenceOverlap}
            callbacks={callbacks}
          />
          <NvCompareSemanticDiff
            semanticDiff={semanticDiff}
            callbacks={callbacks}
          />
          <NvCompareGraphSyncStatus
            graphSync={graphSync}
            callbacks={callbacks}
          />
        </div>
      )}

      {hasSingleItem && (
        <p className="nv-compare-empty">
          Add one more reference to see convergence analysis, semantic differences, and graph sync.
        </p>
      )}
    </NvSlideReveal>
  );
}
