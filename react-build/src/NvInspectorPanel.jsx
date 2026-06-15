/**
 * NvInspectorPanel Island
 * =======================
 * React presentation for the Retrieval Workspace Inspector Space.
 *
 * Modes: "reference" | "evidence" | "relationship" | "empty"
 *
 * JS owns: selected reference, selected relationship, current evidence,
 *          action execution, pin/unpin, compile evidence, open reference,
 *          follow source/target, state persistence, relationship lookup.
 *
 * React owns: section layout, headers, metrics, visual hierarchy,
 *             buttons, badges, contribution bars, empty states.
 *
 * Data contract: all data is plain-serialisable. No DOM refs, no class
 * instances, no functions in data.
 */

import React from 'react'
import {
  NvBadge,
  NvButton,
  NvActionGroup,
  NvInspectorSection,
  NvContributionBar,
  NvEmptyState,
  NvStatusPill,
  NvScientificIcon,
} from './components.jsx'

// ---------------------------------------------------------------------------
// NvInspectorHeader
// Maps to the reference title + meta row at the top of each inspector mode
// ---------------------------------------------------------------------------
export function NvInspectorHeader({ title, badgeText, badgeVariant = 'info', meta = [], className = '' }) {
  return (
    <header className={`nv-inspector-header ${className}`.trim()}>
      {title && <h4 className="nv-inspector-header__title">{title}</h4>}
      <div className="nv-inspector-header__meta">
        {badgeText && <NvBadge variant={badgeVariant}>{badgeText}</NvBadge>}
        {meta.map((item, index) => (
          <span key={index} className="nv-inspector-header__meta-item">{item}</span>
        ))}
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// NvInspectorMetricRow
// A row of pre-rendered microvisualization HTML (from JS layer)
// ---------------------------------------------------------------------------
export function NvInspectorMetricRow({ items = [], ariaLabel = 'Reference microvisualizations', className = '' }) {
  if (!items.length) return null
  return (
    <div
      className={`nv-microvisualization-row ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {items.map((html, index) => (
        html
          ? <span key={index} dangerouslySetInnerHTML={{ __html: html }} />
          : null
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// NvInspectorActionBar
// Token-mapped action row inside inspector panels
// ---------------------------------------------------------------------------
export function NvInspectorActionBar({ actions = [], className = '' }) {
  if (!actions.length) return null
  return (
    <NvActionGroup className={`nv-inspector-action-bar ${className}`.trim()}>
      {actions.map((action, index) => (
        <NvButton
          key={action.id || index}
          variant={action.variant || 'secondary'}
          disabled={action.disabled || false}
          onClick={action.onClick}
          ariaLabel={action.ariaLabel}
        >
          {action.label}
        </NvButton>
      ))}
    </NvActionGroup>
  )
}

// ---------------------------------------------------------------------------
// NvReferenceInspectorPanel
// ---------------------------------------------------------------------------
function NvReferenceInspectorPanel({ reference = {}, metrics = [], keywords = [], connections = [], callbacks = {} }) {
  const {
    title = 'Untitled Reference',
    type = 'reference',
    relationshipCount = 0,
    source = '',
    sourceLabel = '',
    summary = '',
    isPinned = false,
  } = reference

  const {
    onOpenReference,
    onPinReference,
    onUnpinReference,
    onCompileEvidence,
    onOpenContextMenu,
    onFollowRelationship,
    onOpenNeighbor,
  } = callbacks

  return (
    <div className="nv-stack nv-stack--gap-sm">
      {/* Title + meta */}
      <NvInspectorSection className="nv-inspector-section--reference-header">
        <NvInspectorHeader
          title={title}
          badgeText={type}
          badgeVariant="info"
          meta={[
            `${relationshipCount} connection${relationshipCount === 1 ? '' : 's'}`,
            sourceLabel
              ? <a
                  key="source"
                  href={source}
                  target="_blank"
                  rel="noreferrer"
                  className="nv-inspector-source-link"
                >
                  {sourceLabel}
                </a>
              : null,
          ].filter(Boolean)}
        />
        {summary && (
          <p className="inspector-summary">{summary}</p>
        )}
      </NvInspectorSection>

      {/* Microvisualizations row */}
      {metrics.length > 0 && (
        <NvInspectorMetricRow items={metrics} ariaLabel="Reference microvisualizations" />
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <details>
          <summary className="nv-inspector-details-summary">Keywords</summary>
          <div className="nv-cluster nv-cluster--gap-xs" style={{ flexWrap: 'wrap', paddingTop: '4px' }}>
            {keywords.map((kw, i) => (
              <NvBadge key={i} variant="neutral" className="nv-inspector-keyword-badge">{kw}</NvBadge>
            ))}
          </div>
        </details>
      )}

      {/* Connections */}
      {connections.length > 0 && (
        <details>
          <summary className="nv-inspector-details-summary">Connections</summary>
          <div className="compact-list" style={{ maxHeight: '150px', overflowY: 'auto', paddingTop: '6px' }}>
            {connections.map((conn) => (
              <button
                key={conn.relId}
                className="nv-card compact-action-card"
                style={{ padding: '6px', fontSize: '0.65rem' }}
                data-rel-id={conn.relId}
                type="button"
                aria-label={`Inspect relationship: ${conn.label}`}
                onClick={() => typeof onFollowRelationship === 'function' && onFollowRelationship(conn.relId)}
              >
                <strong>{conn.type}</strong> {conn.direction} {conn.targetTitle}
              </button>
            ))}
          </div>
        </details>
      )}

      {/* Minimap slot — JS passes pre-rendered HTML for the constellation minimap */}
      {reference.minimapHtml && (
        <div
          className="local-constellation-minimap"
          dangerouslySetInnerHTML={{ __html: reference.minimapHtml }}
          aria-label="Local constellation minimap"
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// NvEvidenceInspectorPanel
// ---------------------------------------------------------------------------
function NvEvidenceInspectorPanel({ evidence = {}, callbacks = {} }) {
  const {
    mode = 'query',
    confidence = 'low',
    confidenceLabel = 'Limited Support',
    confidenceExplanation = '',
    confidenceVariant = 'error',
    summary = '',
    supportingRefs = [],
    confidenceGaugeHtml = '',
    coverageStripHtml = '',
  } = evidence

  const { onOpenReference, onCompileQuery, onCompileReference, onExploreNeighborhood, onReturnToSearch } = callbacks

  return (
    <div className="evidence-report nv-stack nv-stack--gap-sm" role="region" aria-label="Evidence compilation details">
      {/* Confidence card */}
      <div className="evidence-confidence-card nv-stack nv-stack--gap-xs" data-confidence={confidenceVariant}>
        <div className="nv-cluster nv-cluster--gap-xs" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--sys-color-text-secondary)' }}>
            {mode === 'query' ? 'Query evidence' : 'Reference evidence'}
          </span>
          <NvBadge variant={confidenceVariant} className="nv-inspector-confidence-badge">
            {confidenceLabel}
          </NvBadge>
        </div>
        {(confidenceGaugeHtml || coverageStripHtml) && (
          <div className="nv-microvisualization-row">
            {confidenceGaugeHtml && <span dangerouslySetInnerHTML={{ __html: confidenceGaugeHtml }} />}
            {coverageStripHtml && <span dangerouslySetInnerHTML={{ __html: coverageStripHtml }} />}
          </div>
        )}
        {confidenceExplanation && (
          <p className="nv-muted" style={{ fontSize: 'var(--sys-font-caption-size)', margin: 0, lineHeight: 1.3 }}>
            {confidenceExplanation}
          </p>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="evidence-section nv-stack nv-stack--gap-xs">
          <h5>Summary</h5>
          <p className="evidence-summary">{summary}</p>
        </div>
      )}

      <div className="nv-divider evidence-divider" aria-hidden="true" />

      {/* Supporting References */}
      <div className="evidence-section nv-stack nv-stack--gap-xs nv-provenance-summary">
        <h5>Supporting References</h5>
        <div className="nv-stack nv-stack--gap-xs">
          {supportingRefs.length === 0 ? (
            <p className="nv-muted" style={{ fontSize: 'var(--sys-font-caption-size)', margin: 0 }}>
              No contributing references found.
            </p>
          ) : (
            supportingRefs.map((item) => (
              <NvSupportingRefRow key={item.ref.id} item={item} onOpenReference={onOpenReference} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// NvSupportingRefRow — individual supporting reference row with contribution bar
// ---------------------------------------------------------------------------
function NvSupportingRefRow({ item, onOpenReference }) {
  const { ref, role, contributionLevel = 0, contributionLabel = '', reasonLabel = '', relevanceLabel = '', connectionCount = 0 } = item
  const isPrimary = role === 'Primary Match'

  return (
    <div className="nv-supporting-ref-row nv-stack nv-stack--gap-xs">
      <div className="nv-cluster nv-cluster--gap-xs" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="nv-stack nv-stack--gap-xs" style={{ minWidth: 0 }}>
          <div className="nv-cluster nv-cluster--gap-xs" style={{ alignItems: 'center' }}>
            <NvBadge variant="info">{ref.type}</NvBadge>
            <span className="nv-muted" style={{ fontSize: 'var(--sys-font-caption-size)' }}>
              {reasonLabel}
            </span>
          </div>
          <span
            className="nv-supporting-ref-title"
            style={{ fontSize: 'var(--sys-font-caption-size)', color: 'var(--sys-color-text-primary)', fontWeight: 'var(--ref-font-weight-medium)' }}
          >
            {ref.title}
          </span>
        </div>
        {typeof onOpenReference === 'function' && (
          <NvButton
            variant={isPrimary ? 'primary' : 'secondary'}
            ariaLabel={`Open reference: ${ref.title}`}
            onClick={() => onOpenReference(ref.id)}
          >
            Open
          </NvButton>
        )}
      </div>
      {/* NvContributionBar — React-rendered visual contribution segment */}
      {contributionLabel && (
        <NvContributionBar
          label={contributionLabel}
          level={contributionLevel}
          max={4}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// NvRelationshipInspectorPanel
// ---------------------------------------------------------------------------
function NvRelationshipInspectorPanel({ relationship = {}, callbacks = {} }) {
  const {
    id = '',
    type = '',
    strength = 0,
    sourceReferenceId = '',
    targetReferenceId = '',
    context = '',
  } = relationship

  const { onFollowSource, onFollowTarget, onOpenContextMenu } = callbacks
  const strengthVariant = strength >= 0.9 ? 'success' : 'neutral'

  return (
    <div className="nv-card nv-card--selected" style={{ margin: 0, border: 'none', backgroundColor: 'var(--sys-color-surface-container-low)', cursor: 'default' }}>
      <h4 style={{ margin: 0, fontSize: 'var(--sys-font-body-size)', color: 'var(--sys-color-text-primary)', fontWeight: 'var(--ref-font-weight-semibold)' }}>
        {id}
      </h4>
      <div className="nv-divider" aria-hidden="true" style={{ marginBlock: 'var(--sys-space-stack-xs)', opacity: 0.4 }} />

      <p className="nv-muted" style={{ fontSize: 'var(--sys-font-caption-size)', lineHeight: 1.6, margin: 0 }}>
        <strong>Type:</strong> <NvBadge variant="info">{type}</NvBadge><br />
        <strong>Strength:</strong> <NvBadge variant={strengthVariant}>{strength}</NvBadge><br />
        <strong>Source Node:</strong>{' '}
        <span style={{ fontFamily: 'var(--sys-font-code-family)' }}>{sourceReferenceId}</span><br />
        <strong>Target Node:</strong>{' '}
        <span style={{ fontFamily: 'var(--sys-font-code-family)' }}>{targetReferenceId}</span>
      </p>

      <div className="nv-divider" aria-hidden="true" style={{ marginBlock: 'var(--sys-space-stack-xs)', opacity: 0.4 }} />

      <p className="nv-muted" style={{ fontSize: 'var(--sys-font-body-size)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
        "{context || 'No citation context details available.'}"
      </p>

      <div className="nv-divider" aria-hidden="true" style={{ marginBlock: 'var(--sys-space-stack-xs)', opacity: 0.4 }} />

      <div className="nv-cluster nv-cluster--gap-sm" style={{ marginTop: '8px' }}>
        <NvButton
          variant="secondary"
          ariaLabel={`Follow source: ${sourceReferenceId}`}
          onClick={() => typeof onFollowSource === 'function' && onFollowSource(sourceReferenceId)}
          className="nv-inspector-rel-btn"
        >
          Follow Source
        </NvButton>
        <NvButton
          variant="primary"
          ariaLabel={`Follow target: ${targetReferenceId}`}
          onClick={() => typeof onFollowTarget === 'function' && onFollowTarget(targetReferenceId)}
          className="nv-inspector-rel-btn"
        >
          Follow Target
        </NvButton>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// NvInspectorPanel — top-level island, dispatches to sub-panels by mode
// ---------------------------------------------------------------------------
export function NvInspectorPanel({ data = {}, callbacks = {} }) {
  const {
    mode = 'empty',
    reference,
    evidence,
    relationship,
    emptyConfig = {},
  } = data

  if (mode === 'reference' && reference) {
    return (
      <NvReferenceInspectorPanel
        reference={reference}
        metrics={reference.metrics || []}
        keywords={reference.keywords || []}
        connections={reference.connections || []}
        callbacks={callbacks}
      />
    )
  }

  if (mode === 'evidence' && evidence) {
    return (
      <NvEvidenceInspectorPanel
        evidence={evidence}
        callbacks={callbacks}
      />
    )
  }

  if (mode === 'relationship' && relationship) {
    return (
      <NvRelationshipInspectorPanel
        relationship={relationship}
        callbacks={callbacks}
      />
    )
  }

  // Empty state — mode === 'empty' or missing data
  return (
    <NvEmptyState
      icon={emptyConfig.icon || '🔍'}
      title={emptyConfig.title || 'Nothing selected'}
      subtitle={emptyConfig.subtitle || 'Select an item to inspect its details.'}
    />
  )
}
