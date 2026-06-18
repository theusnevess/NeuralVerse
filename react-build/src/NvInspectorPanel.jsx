/**
 * NvInspectorPanel Island
 * =======================
 * React presentation for the Retrieval Workspace Inspector Space.
 *
 * JS owns: selected reference, selected relationship, current evidence,
 *          action execution, pin/unpin, compile evidence, open reference,
 *          follow source/target, state persistence, relationship lookup.
 *
 * React owns: section layout, headers, metrics, visual hierarchy,
 *             buttons, badges, contribution bars, empty states.
 */

import React from 'react'
import {
  NvBadge,
  NvButton,
  NvActionGroup,
  NvInspectorSection,
  NvContributionBar,
  NvEmptyState,
  NvScientificIcon,
} from './components.jsx'
import { NvSlideReveal } from './motion/NvMotion.jsx'

const ICONS = {
  reference: 'assets/icons/scientific/inspector/reference-details.svg',
  evidence: 'assets/icons/scientific/evidence/evidence-convergence.svg',
  relationship: 'assets/icons/scientific/knowledge-graph/citation-bridge.svg',
  metadata: 'assets/icons/scientific/inspector/metadata-panel.svg',
}

function normalizeList(items) {
  return Array.isArray(items) ? items.filter(Boolean) : []
}

function formatStrength(strength) {
  if (strength === null || strength === undefined || strength === '') return 'Not specified'
  const numeric = Number(strength)
  return Number.isFinite(numeric) ? numeric.toFixed(2).replace(/0$/, '').replace(/\.0$/, '') : String(strength)
}

// ---------------------------------------------------------------------------
// NvInspectorHeader
// ---------------------------------------------------------------------------
export function NvInspectorHeader({
  title,
  badgeText,
  badgeVariant = 'info',
  meta = [],
  iconPath,
  eyebrow,
  className = '',
}) {
  const cleanMeta = normalizeList(meta)
  return (
    <header className={`nv-inspector-header ${className}`.trim()}>
      <div className="nv-inspector-header__main">
        {iconPath && (
          <span className="nv-inspector-header__icon" aria-hidden="true">
            <NvScientificIcon iconPath={iconPath} size="md" />
          </span>
        )}
        <div className="nv-inspector-header__copy">
          {eyebrow && <span className="nv-inspector-header__eyebrow">{eyebrow}</span>}
          {title && <h4 className="nv-inspector-header__title">{title}</h4>}
        </div>
      </div>
      <div className="nv-inspector-header__meta">
        {badgeText && <NvBadge variant={badgeVariant}>{badgeText}</NvBadge>}
        {cleanMeta.map((item, index) => (
          <span key={index} className="nv-inspector-header__meta-item">{item}</span>
        ))}
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// NvInspectorBadgeRow
// ---------------------------------------------------------------------------
export function NvInspectorBadgeRow({ items = [], className = '' }) {
  const cleanItems = normalizeList(items)
  if (!cleanItems.length) return null
  return (
    <div className={`nv-inspector-badge-row ${className}`.trim()}>
      {cleanItems.map((item, index) => (
        <NvBadge key={`${item.label || item}-${index}`} variant={item.variant || 'neutral'}>
          {item.label || item}
        </NvBadge>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// NvInspectorMetricRow
// A row of pre-rendered microvisualization HTML from the JS layer.
// ---------------------------------------------------------------------------
export function NvInspectorMetricRow({ items = [], ariaLabel = 'Inspector microvisualizations', className = '' }) {
  const cleanItems = normalizeList(items)
  if (!cleanItems.length) return null
  return (
    <div
      className={`nv-microvisualization-row nv-inspector-microviz-row ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {cleanItems.map((html, index) => (
        <span key={index} dangerouslySetInnerHTML={{ __html: html }} />
      ))}
    </div>
  )
}

export function NvMetricRow({ rows = [], className = '' }) {
  const cleanRows = normalizeList(rows)
  if (!cleanRows.length) return null
  return (
    <dl className={`nv-inspector-metric-list ${className}`.trim()}>
      {cleanRows.map((row, index) => (
        <div key={`${row.label}-${index}`} className="nv-inspector-metric-list__row">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

// ---------------------------------------------------------------------------
// NvInspectorActionBar
// ---------------------------------------------------------------------------
export function NvInspectorActionBar({ actions = [], className = '' }) {
  const cleanActions = normalizeList(actions)
  if (!cleanActions.length) return null
  return (
    <NvActionGroup className={`nv-inspector-action-bar ${className}`.trim()}>
      {cleanActions.map((action, index) => (
        <NvButton
          key={action.id || index}
          variant={action.variant || 'secondary'}
          disabled={action.disabled || false}
          onClick={action.onClick}
          ariaLabel={action.ariaLabel}
          className="nv-inspector-action"
        >
          {action.label}
        </NvButton>
      ))}
    </NvActionGroup>
  )
}

export function NvInspectorDivider({ className = '' }) {
  return <div className={`nv-inspector-divider ${className}`.trim()} aria-hidden="true" />
}

export function NvInspectorEmptyState({ title, subtitle, icon = 'search', actions }) {
  return (
    <NvEmptyState
      icon={icon}
      title={title || 'Nothing selected'}
      subtitle={subtitle || 'Select an item to inspect its details.'}
      actions={actions}
      className="nv-inspector-empty-state"
    />
  )
}

// ---------------------------------------------------------------------------
// NvReferenceInspectorPanel
// ---------------------------------------------------------------------------
export function NvReferenceInspectorPanel({ reference = {}, metrics = [], keywords = [], connections = [], callbacks = {} }) {
  const {
    id = '',
    title = 'Untitled Reference',
    type = 'reference',
    relationshipCount = 0,
    source = '',
    sourceLabel = '',
    summary = '',
    isPinned = false,
    minimapHtml = '',
  } = reference

  const {
    onPinReference,
    onUnpinReference,
    onCompileEvidence,
    onFollowRelationship,
  } = callbacks

  const actions = [
    {
      id: 'pin',
      label: isPinned ? 'Unpin' : 'Pin',
      variant: 'secondary',
      ariaLabel: `${isPinned ? 'Unpin' : 'Pin'} reference ${title}`,
      onClick: () => {
        if (isPinned && typeof onUnpinReference === 'function') onUnpinReference(id)
        if (!isPinned && typeof onPinReference === 'function') onPinReference(id)
      },
    },
    {
      id: 'compile',
      label: 'Compile Evidence',
      variant: 'primary',
      ariaLabel: `Compile evidence from ${title}`,
      onClick: () => typeof onCompileEvidence === 'function' && onCompileEvidence(id),
    },
  ]

  return (
    <NvSlideReveal className="nv-inspector-panel nv-inspector-panel--reference">
      <NvInspectorSection className="nv-inspector-section--hero">
        <NvInspectorHeader
          title={title}
          eyebrow="Reference Inspector"
          badgeText={type}
          badgeVariant="info"
          iconPath={ICONS.reference}
          meta={[
            `${relationshipCount} relationship${relationshipCount === 1 ? '' : 's'}`,
            sourceLabel && source
              ? <a key="source" href={source} target="_blank" rel="noreferrer" className="nv-inspector-source-link">{sourceLabel}</a>
              : sourceLabel,
          ]}
        />
        {summary && <p className="inspector-summary nv-inspector-summary">{summary}</p>}
        <NvInspectorActionBar actions={actions} />
      </NvInspectorSection>

      <NvInspectorSection title="Analytical Signals" subtitle="Connectivity and neighborhood context">
        <NvInspectorMetricRow items={metrics} ariaLabel="Reference analytical signals" />
      </NvInspectorSection>

      {minimapHtml && (
        <NvInspectorSection title="Local Neighborhood" subtitle="Current graph context">
          <div
            className="local-constellation-minimap nv-inspector-minimap"
            dangerouslySetInnerHTML={{ __html: minimapHtml }}
            aria-label="Local constellation minimap"
          />
        </NvInspectorSection>
      )}

      {keywords.length > 0 && (
        <NvInspectorSection title="Concepts" subtitle="Registry keywords">
          <NvInspectorBadgeRow items={keywords.map((kw) => ({ label: kw, variant: 'neutral' }))} />
        </NvInspectorSection>
      )}

      <NvInspectorSection title="Relationships" subtitle="Direct graph links">
        {connections.length === 0 ? (
          <p className="nv-inspector-muted">No direct graph connections.</p>
        ) : (
          <div className="nv-inspector-link-list" role="list">
            {connections.map((conn) => (
              <button
                key={conn.relId}
                className="nv-inspector-link-row"
                data-rel-id={conn.relId}
                type="button"
                aria-label={`Inspect ${conn.type} relationship ${conn.direction} ${conn.targetTitle}`}
                onClick={() => typeof onFollowRelationship === 'function' && onFollowRelationship(conn.relId)}
              >
                <span className="nv-inspector-link-row__type">{conn.type}</span>
                <span className="nv-inspector-link-row__title">{conn.direction} {conn.targetTitle}</span>
              </button>
            ))}
          </div>
        )}
      </NvInspectorSection>
    </NvSlideReveal>
  )
}

// ---------------------------------------------------------------------------
// NvEvidenceInspectorPanel
// ---------------------------------------------------------------------------
export function NvEvidenceInspectorPanel({ evidence = {}, callbacks = {} }) {
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
    lineage = [],
    relatedRelationships = [],
    metadata = [],
    primaryReferenceId = '',
  } = evidence

  const { onOpenReference, onOpenRelationship, onExploreNeighborhood, onReturnToSearch } = callbacks

  return (
    <NvSlideReveal className="nv-inspector-panel nv-inspector-panel--evidence" role="region" aria-label="Evidence compilation details">
      <NvInspectorSection className="nv-inspector-section--hero">
        <NvInspectorHeader
          title="Evidence Synthesis"
          eyebrow={mode === 'query' ? 'Query evidence' : 'Reference evidence'}
          badgeText={confidenceLabel}
          badgeVariant={confidenceVariant}
          iconPath={ICONS.evidence}
          meta={[confidenceExplanation]}
        />
        {(confidenceGaugeHtml || coverageStripHtml) && (
          <NvInspectorMetricRow
            items={[confidenceGaugeHtml, coverageStripHtml]}
            ariaLabel="Evidence support and coverage"
          />
        )}
      </NvInspectorSection>

      {summary && (
        <NvInspectorSection title="Summary" subtitle="Compiled evidence">
          <p className="evidence-summary nv-inspector-evidence-summary">{summary}</p>
        </NvInspectorSection>
      )}

      <NvInspectorSection title="Supporting References" subtitle={`${supportingRefs.length} evidence input${supportingRefs.length === 1 ? '' : 's'}`}>
        {supportingRefs.length === 0 ? (
          <p className="nv-inspector-muted">No contributing references found.</p>
        ) : (
          <div className="nv-inspector-support-list">
            {supportingRefs.map((item) => (
              <NvSupportingRefRow key={item.ref.id} item={item} onOpenReference={onOpenReference} />
            ))}
          </div>
        )}
      </NvInspectorSection>

      <NvInspectorSection title="Lineage" subtitle="Traceability">
        {lineage.length === 0 ? (
          <p className="nv-inspector-muted">No lineage entries available.</p>
        ) : (
          <div className="nv-inspector-lineage-list" role="list">
            {lineage.map((item) => (
              <button
                key={`${item.role}-${item.id}`}
                type="button"
                className="nv-inspector-lineage-row"
                onClick={() => typeof onOpenReference === 'function' && onOpenReference(item.id)}
                aria-label={`${item.role} evidence ${item.title}`}
              >
                <span className="nv-inspector-lineage-row__role">{item.role}</span>
                <span className="nv-inspector-lineage-row__title">{item.title}</span>
              </button>
            ))}
          </div>
        )}
      </NvInspectorSection>

      <NvInspectorSection title="Provenance" subtitle="Compilation metadata">
        <NvMetricRow rows={metadata} />
      </NvInspectorSection>

      {relatedRelationships.length > 0 && (
        <NvInspectorSection title="Relationship Context" subtitle={`${relatedRelationships.length} relationship${relatedRelationships.length === 1 ? '' : 's'}`}>
          <div className="nv-inspector-link-list nv-inspector-link-list--compact" role="list">
            {relatedRelationships.map((rel) => (
              <button
                key={rel.id}
                type="button"
                className="nv-inspector-link-row"
                onClick={() => typeof onOpenRelationship === 'function' && onOpenRelationship(rel.id)}
                aria-label={`Inspect relationship ${rel.sourceReferenceId} to ${rel.targetReferenceId}`}
              >
                <span className="nv-inspector-link-row__type">{rel.type}</span>
                <span className="nv-inspector-link-row__title">{rel.sourceReferenceId} {'->'} {rel.targetReferenceId}</span>
              </button>
            ))}
          </div>
        </NvInspectorSection>
      )}

      <NvInspectorSection title="Next" subtitle="Continue the investigation">
        <NvInspectorActionBar
          actions={[
            primaryReferenceId && {
              id: 'explore',
              label: 'Explore Graph',
              variant: 'secondary',
              onClick: () => typeof onExploreNeighborhood === 'function' && onExploreNeighborhood(primaryReferenceId),
            },
            {
              id: 'search',
              label: 'Continue Search',
              variant: 'ghost',
              onClick: () => typeof onReturnToSearch === 'function' && onReturnToSearch(),
            },
          ]}
        />
      </NvInspectorSection>
    </NvSlideReveal>
  )
}

function NvSupportingRefRow({ item, onOpenReference }) {
  const {
    ref,
    role,
    contributionLevel = 0,
    contributionLabel = '',
    reasonLabel = '',
    relevanceLabel = '',
    connectionCount = 0,
  } = item
  const isPrimary = role === 'Primary Match'

  return (
    <article className="nv-supporting-ref-row">
      <div className="nv-supporting-ref-row__main">
        <div className="nv-supporting-ref-row__meta">
          <NvBadge variant="info">{ref.type}</NvBadge>
          <span>{reasonLabel}</span>
        </div>
        <h5 className="nv-supporting-ref-title">{ref.title}</h5>
        <div className="nv-supporting-ref-row__signals">
          {relevanceLabel && <span>{relevanceLabel}</span>}
          <span>{connectionCount} relationship{connectionCount === 1 ? '' : 's'}</span>
        </div>
      </div>
      <div className="nv-supporting-ref-row__side">
        {contributionLabel && (
          <NvContributionBar label={contributionLabel} level={contributionLevel} max={4} />
        )}
        {typeof onOpenReference === 'function' && (
          <NvButton
            variant={isPrimary ? 'primary' : 'secondary'}
            ariaLabel={`Open reference: ${ref.title}`}
            onClick={() => onOpenReference(ref.id)}
            className="nv-inspector-action"
          >
            Open
          </NvButton>
        )}
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// NvRelationshipInspectorPanel
// ---------------------------------------------------------------------------
export function NvRelationshipInspectorPanel({ relationship = {}, callbacks = {} }) {
  const {
    id = '',
    type = '',
    strength = 0,
    sourceReferenceId = '',
    sourceTitle = '',
    targetReferenceId = '',
    targetTitle = '',
    context = '',
  } = relationship

  const { onFollowSource, onFollowTarget } = callbacks
  const strengthVariant = Number(strength) >= 0.9 ? 'success' : 'neutral'

  return (
    <NvSlideReveal className="nv-inspector-panel nv-inspector-panel--relationship">
      <NvInspectorSection className="nv-inspector-section--hero">
        <NvInspectorHeader
          title={id}
          eyebrow="Relationship Inspector"
          badgeText={type || 'relationship'}
          badgeVariant="info"
          iconPath={ICONS.relationship}
          meta={[`Strength ${formatStrength(strength)}`]}
        />
        <NvInspectorMetricRow
          items={[`<span class="nv-badge" data-variant="${strengthVariant}">Strength ${formatStrength(strength)}</span>`]}
          ariaLabel="Relationship strength"
        />
      </NvInspectorSection>

      <NvInspectorSection title="Connection" subtitle="Source and target references">
        <div className="nv-inspector-relationship-path" aria-label="Relationship path">
          <div className="nv-inspector-relationship-node">
            <span className="nv-inspector-relationship-node__label">Source</span>
            <strong>{sourceTitle || sourceReferenceId}</strong>
            <code>{sourceReferenceId}</code>
          </div>
          <span className="nv-inspector-relationship-arrow" aria-hidden="true">{'->'}</span>
          <div className="nv-inspector-relationship-node">
            <span className="nv-inspector-relationship-node__label">Target</span>
            <strong>{targetTitle || targetReferenceId}</strong>
            <code>{targetReferenceId}</code>
          </div>
        </div>
      </NvInspectorSection>

      <NvInspectorSection title="Context" subtitle="Relationship rationale">
        <p className="nv-inspector-relationship-context">
          {context || 'No citation context details available.'}
        </p>
      </NvInspectorSection>

      <NvInspectorSection title="Actions" subtitle="Follow the connection">
        <NvInspectorActionBar
          actions={[
            {
              id: 'source',
              label: 'Follow Source',
              variant: 'secondary',
              ariaLabel: `Follow source: ${sourceReferenceId}`,
              onClick: () => typeof onFollowSource === 'function' && onFollowSource(sourceReferenceId),
            },
            {
              id: 'target',
              label: 'Follow Target',
              variant: 'primary',
              ariaLabel: `Follow target: ${targetReferenceId}`,
              onClick: () => typeof onFollowTarget === 'function' && onFollowTarget(targetReferenceId),
            },
          ]}
        />
      </NvInspectorSection>
    </NvSlideReveal>
  )
}

// ---------------------------------------------------------------------------
// NvInspectorPanel
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
    return <NvEvidenceInspectorPanel evidence={evidence} callbacks={callbacks} />
  }

  if (mode === 'relationship' && relationship) {
    return <NvRelationshipInspectorPanel relationship={relationship} callbacks={callbacks} />
  }

  return (
    <NvInspectorEmptyState
      icon={emptyConfig.icon || 'search'}
      title={emptyConfig.title || 'Nothing selected'}
      subtitle={emptyConfig.subtitle || 'Select an item to inspect its details.'}
    />
  )
}
