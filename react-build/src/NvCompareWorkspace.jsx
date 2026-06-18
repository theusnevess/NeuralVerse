/**
 * NvCompareWorkspace Island
 * =========================
 * Semantic compare presentation for Retrieval Workspace references.
 * JS owns selection, retrieval data, evidence context, graph context, and actions.
 */

import React from 'react'
import {
  NvBadge,
  NvButton,
  NvChip,
  NvContributionBar,
  NvInspectorSection,
  NvMetric,
  NvMicroViz,
  NvScientificIcon,
} from './components.jsx'

const ICONS = {
  compare: 'assets/icons/scientific/knowledge-graph/semantic-path.svg',
  graph: 'assets/icons/scientific/knowledge-graph/active-neighborhood.svg',
  evidence: 'assets/icons/scientific/evidence/evidence-convergence.svg',
  concepts: 'assets/icons/scientific/knowledge-graph/knowledge-cluster.svg',
}

function shortSource(source = '') {
  if (!source) return 'No source'
  return source.replace(/^https?:\/\//, '').replace(/^local:\/\//, '').slice(0, 42)
}

export function NvCompareMetricRow({ label, value }) {
  return (
    <div className="nv-compare-metric-row">
      <span>{label}</span>
      <strong>{value || 'Not available'}</strong>
    </div>
  )
}

export function NvCompareTray({ items = [], limit = 4, feedback = '', callbacks = {} }) {
  return (
    <section className="nv-compare-tray" aria-labelledby="nv-compare-tray-title">
      <div className="nv-compare-section-heading">
        <NvScientificIcon iconPath={ICONS.compare} size="sm" />
        <h3 id="nv-compare-tray-title">Compare Tray</h3>
        <NvBadge variant={items.length >= 2 ? 'success' : 'neutral'}>{items.length}/{limit}</NvBadge>
      </div>
      {feedback && <p className="nv-compare-feedback" role="status" aria-live="polite">{feedback}</p>}
      {items.length === 0 ? (
        <p className="nv-compare-empty">Add 2-4 references from discovery cards, memory, inspector links, hover previews, or graph context menus.</p>
      ) : (
        <div className="nv-compare-tray__items" aria-label="Selected compare references">
          {items.map((item, index) => (
            <article key={item.id} className="nv-compare-tray-card" aria-label={`Comparison item ${index + 1}: ${item.title}`}>
              <span className="nv-compare-tray-card__index">{index + 1}</span>
              <div>
                <strong>{item.title}</strong>
                <span>{item.type || 'reference'} · {item.relationshipCount} link{item.relationshipCount === 1 ? '' : 's'}</span>
              </div>
              <NvButton variant="ghost" className="nv-compare-mini-action" ariaLabel={`Remove ${item.title} from compare`} onClick={() => callbacks.onRemove?.(item.id)}>Remove</NvButton>
            </article>
          ))}
        </div>
      )}
      <div className="nv-compare-actions-inline">
        {items.length >= 2 && <NvButton variant="primary" onClick={() => callbacks.onOpenCompare?.()}>Open Compare Workspace</NvButton>}
        {items.length > 0 && <NvButton variant="ghost" onClick={() => callbacks.onClear?.()}>Clear Compare</NvButton>}
      </div>
    </section>
  )
}

export function NvCompareActions({ item, callbacks = {} }) {
  if (!item) return null
  const compileDisabled = !item.canCompile
  return (
    <div className="nv-compare-column__actions">
      <NvButton variant="primary" onClick={() => callbacks.onOpenReference?.(item.id)}>Open Reference</NvButton>
      <NvButton variant="secondary" onClick={() => callbacks.onTogglePin?.(item.id)}>{item.isPinned ? 'Unpin' : 'Pin'}</NvButton>
      <NvButton
        variant="secondary"
        disabled={compileDisabled}
        ariaLabel={compileDisabled ? 'Compile uses the primary compared reference when available' : `Compile evidence from ${item.title}`}
        onClick={() => callbacks.onCompile?.(item.id)}
      >
        Compile Evidence
      </NvButton>
      <NvButton variant="ghost" onClick={() => callbacks.onRemove?.(item.id)}>Remove</NvButton>
    </div>
  )
}

export function NvCompareColumn({ item, index = 0, callbacks = {} }) {
  if (!item) return null
  return (
    <article className="nv-compare-column" aria-label={`Comparison item ${index + 1}: ${item.title}`}>
      <header className="nv-compare-column__header">
        <span className="nv-compare-column__index">{index + 1}</span>
        <div>
          <h3>{item.title}</h3>
          <div className="nv-compare-column__meta">
            <NvBadge variant="info">{item.type || 'reference'}</NvBadge>
            <NvMetric label={item.status || 'active'} />
          </div>
        </div>
      </header>
      <div className="nv-compare-column__body">
        <NvCompareMetricRow label="Source" value={shortSource(item.source)} />
        <NvCompareMetricRow label="Cluster" value={item.clusterLabel} />
        <NvCompareMetricRow label="Relationships" value={`${item.relationshipCount} direct`} />
        <NvCompareMetricRow label="Connectivity" value={item.connectivityLabel} />
        {item.keywords?.length > 0 && (
          <div className="nv-compare-keywords" aria-label={`Concepts for ${item.title}`}>
            {item.keywords.slice(0, 6).map(keyword => <NvChip key={keyword}>{keyword}</NvChip>)}
          </div>
        )}
      </div>
      <NvCompareActions item={item} callbacks={callbacks} />
    </article>
  )
}

export function NvCompareMatrix({ items = [], callbacks = {} }) {
  if (items.length < 2) {
    return <p className="nv-compare-empty">Select at least two references to compare metadata side by side.</p>
  }
  return (
    <section className="nv-compare-matrix" aria-label="Metadata comparison columns">
      {items.map((item, index) => <NvCompareColumn key={item.id} item={item} index={index} callbacks={callbacks} />)}
    </section>
  )
}

export function NvCompareSection({ title, iconPath, children }) {
  return (
    <NvInspectorSection title={title} className="nv-compare-section">
      <div className="nv-compare-section__title" aria-hidden="true">
        <NvScientificIcon iconPath={iconPath} size="sm" />
      </div>
      {children}
    </NvInspectorSection>
  )
}

export function NvCompareSharedConcepts({ shared = {} }) {
  const concepts = shared.concepts || []
  const types = shared.types || []
  const relationships = shared.relationships || []
  return (
    <NvCompareSection title="Shared Concepts" iconPath={ICONS.concepts}>
      {concepts.length === 0 ? <p className="nv-compare-empty">No shared concepts detected from current metadata.</p> : (
        <div className="nv-compare-chip-row">{concepts.map(item => <NvChip key={item} variant="accent">{item}</NvChip>)}</div>
      )}
      {types.length > 0 && <p className="nv-compare-muted">Shared types: {types.join(', ')}</p>}
      {relationships.length > 0 && <p className="nv-compare-muted">Shared relationship patterns: {relationships.join(', ')}</p>}
    </NvCompareSection>
  )
}

export function NvCompareUniqueRelationships({ differences = [] }) {
  return (
    <NvCompareSection title="Unique Relationships" iconPath={ICONS.graph}>
      <div className="nv-compare-difference-grid">
        {differences.map(diff => (
          <article key={diff.referenceId} className="nv-compare-difference-card">
            <h4>{diff.title || diff.referenceId}</h4>
            {diff.uniqueConcepts?.length > 0 && <p><strong>Unique concepts:</strong> {diff.uniqueConcepts.join(', ')}</p>}
            {diff.uniqueRelationships?.length > 0 ? (
              <ul>{diff.uniqueRelationships.map(rel => <li key={rel}>{rel}</li>)}</ul>
            ) : <p className="nv-compare-empty">No unique direct relationships in selected set.</p>}
          </article>
        ))}
      </div>
    </NvCompareSection>
  )
}

export function NvCompareEvidenceContribution({ evidenceContext = [] }) {
  return (
    <NvCompareSection title="Evidence Contribution" iconPath={ICONS.evidence}>
      {evidenceContext.length === 0 ? <p className="nv-compare-empty">No active evidence compilation.</p> : (
        <div className="nv-compare-evidence-grid">
          {evidenceContext.map(item => (
            <article key={item.referenceId} className="nv-compare-evidence-card">
              <h4>{item.title || item.referenceId}</h4>
              <NvContributionBar label={item.contributionLabel || (item.usedInCurrentEvidence ? 'Contributes to current evidence' : 'Not used in current evidence')} level={item.usedInCurrentEvidence ? item.contributionLevel || 3 : 1} max={4} />
            </article>
          ))}
        </div>
      )}
    </NvCompareSection>
  )
}

export function NvCompareGraphPosition({ graphContext = [] }) {
  return (
    <NvCompareSection title="Graph Position" iconPath={ICONS.graph}>
      <div className="nv-compare-graph-grid">
        {graphContext.map(item => (
          <article key={item.referenceId} className="nv-compare-graph-card">
            <h4>{item.title || item.referenceId}</h4>
            <NvCompareMetricRow label="Relationships" value={`${item.relationshipCount} direct`} />
            <NvCompareMetricRow label="Connectivity" value={item.connectivityLabel} />
            <NvCompareMetricRow label="Cluster" value={item.clusterLabel} />
            {item.microvisualizationHtml && <NvMicroViz html={item.microvisualizationHtml} ariaLabel={`Local graph position for ${item.title || item.referenceId}`} />}
          </article>
        ))}
      </div>
    </NvCompareSection>
  )
}

export function NvCompareWorkspace({ data = {}, callbacks = {} }) {
  const {
    items = [],
    shared = {},
    differences = [],
    graphContext = [],
    evidenceContext = [],
    feedback = '',
    limit = 4,
  } = data

  return (
    <section className="nv-compare-workspace" aria-labelledby="nv-compare-workspace-title">
      <header className="nv-compare-workspace__header">
        <div className="nv-compare-workspace__heading">
          <NvScientificIcon iconPath={ICONS.compare} size="md" />
          <div>
            <p className="nv-compare-eyebrow">Semantic Compare Workspace</p>
            <h2 id="nv-compare-workspace-title">Reference Comparison</h2>
          </div>
        </div>
        <NvButton variant="ghost" disabled={items.length === 0} onClick={() => callbacks.onClear?.()}>Clear Compare</NvButton>
      </header>
      <NvCompareTray items={items} limit={limit} feedback={feedback} callbacks={callbacks} />
      <NvCompareMatrix items={items} callbacks={callbacks} />
      {items.length >= 2 && (
        <div className="nv-compare-analysis-grid">
          <NvCompareSharedConcepts shared={shared} />
          <NvCompareUniqueRelationships differences={differences} />
          <NvCompareEvidenceContribution evidenceContext={evidenceContext} />
          <NvCompareGraphPosition graphContext={graphContext} />
        </div>
      )}
    </section>
  )
}
