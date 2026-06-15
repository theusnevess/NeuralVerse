/**
 * NvMemoryLayer Island
 * ====================
 * React presentation for the Research Memory Layer footer.
 *
 * Renders: Pinned | Recently Viewed | Saved Queries | Knowledge Trail
 *
 * JS owns: memory arrays, trail events, saved queries, pin state,
 *          query execution, restore behavior, localStorage persistence.
 *
 * React owns: columns, cards, labels, icons, microvisualizations,
 *             buttons, empty states.
 *
 * Data contract: all data is plain-serialisable. Callbacks out.
 */

import React from 'react'
import {
  NvBadge,
  NvButton,
  NvEmptyState,
  NvContributionBar,
} from './components.jsx'

// ---------------------------------------------------------------------------
// NvMemoryColumn — single column wrapper
// ---------------------------------------------------------------------------
export function NvMemoryColumn({ title, trailing, children, className = '' }) {
  return (
    <div className={`memory-column ${className}`.trim()}>
      {title && (
        <div className="nv-cluster nv-cluster--gap-xs" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sys-space-stack-xs)' }}>
          <h4 style={{ margin: 0 }}>{title}</h4>
          {trailing}
        </div>
      )}
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// NvPinnedReferenceItem
// ---------------------------------------------------------------------------
export function NvPinnedReferenceItem({ item, onOpen, onUnpin }) {
  if (!item) return null
  const { id, title, type, relationshipCount = 0, isPinned = true } = item

  return (
    <li className="memory-panel-item">
      <div
        className="nv-card nv-memory-pinned-card"
        role="article"
        aria-label={`Pinned: ${title}`}
      >
        <div className="nv-stack nv-stack--gap-xs">
          <div className="nv-cluster nv-cluster--gap-xs" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="nv-stack nv-stack--gap-xs" style={{ minWidth: 0 }}>
              <div className="nv-cluster nv-cluster--gap-xs">
                <NvBadge variant="info">{type || 'reference'}</NvBadge>
                <span className="nv-muted" style={{ fontSize: '0.6rem' }}>
                  {relationshipCount} link{relationshipCount === 1 ? '' : 's'}
                </span>
              </div>
              <span
                className="nv-memory-item-title"
                style={{ fontSize: 'var(--sys-font-caption-size)', color: 'var(--sys-color-text-primary)', fontWeight: 'var(--ref-font-weight-medium)', lineHeight: 1.3 }}
              >
                {title}
              </span>
            </div>
            <div className="nv-cluster nv-cluster--gap-xs" style={{ flexShrink: 0 }}>
              <NvButton
                variant="primary"
                ariaLabel={`Open pinned reference: ${title}`}
                onClick={() => typeof onOpen === 'function' && onOpen(id)}
              >
                Open
              </NvButton>
              <NvButton
                variant="secondary"
                ariaLabel={`Unpin reference: ${title}`}
                onClick={() => typeof onUnpin === 'function' && onUnpin(id)}
              >
                Unpin
              </NvButton>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// NvRecentReferenceItem
// ---------------------------------------------------------------------------
export function NvRecentReferenceItem({ item, onOpen, onPin }) {
  if (!item) return null
  const { id, title, type, relationshipCount = 0 } = item

  return (
    <li className="memory-panel-item">
      <div
        className="nv-card nv-memory-recent-card"
        role="article"
        aria-label={`Recent: ${title}`}
      >
        <div className="nv-cluster nv-cluster--gap-xs" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="nv-stack nv-stack--gap-xs" style={{ minWidth: 0 }}>
            <div className="nv-cluster nv-cluster--gap-xs">
              <NvBadge variant="info">{type || 'reference'}</NvBadge>
            </div>
            <span
              className="nv-memory-item-title"
              style={{ fontSize: 'var(--sys-font-caption-size)', color: 'var(--sys-color-text-primary)', fontWeight: 'var(--ref-font-weight-medium)', lineHeight: 1.3 }}
            >
              {title}
            </span>
          </div>
          <div className="nv-cluster nv-cluster--gap-xs" style={{ flexShrink: 0 }}>
            <NvButton
              variant="primary"
              ariaLabel={`Open recently viewed: ${title}`}
              onClick={() => typeof onOpen === 'function' && onOpen(id)}
            >
              Open
            </NvButton>
            <NvButton
              variant="secondary"
              ariaLabel={`Pin reference: ${title}`}
              onClick={() => typeof onPin === 'function' && onPin(id)}
            >
              Pin
            </NvButton>
          </div>
        </div>
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// NvSavedQueryItem
// ---------------------------------------------------------------------------
export function NvSavedQueryItem({ query, onRerun, onDelete }) {
  if (!query) return null

  return (
    <li className="memory-panel-item">
      <div
        className="nv-card nv-memory-query-card"
        role="article"
        aria-label={`Saved query: ${query}`}
      >
        <div className="nv-cluster nv-cluster--gap-xs" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            className="nv-memory-query-text"
            style={{ fontSize: 'var(--sys-font-caption-size)', color: 'var(--sys-color-text-primary)', fontWeight: 'var(--ref-font-weight-medium)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={query}
          >
            {query}
          </span>
          <div className="nv-cluster nv-cluster--gap-xs" style={{ flexShrink: 0 }}>
            <NvButton
              variant="primary"
              ariaLabel={`Rerun saved query: ${query}`}
              onClick={() => typeof onRerun === 'function' && onRerun(query)}
            >
              Rerun
            </NvButton>
            <NvButton
              variant="secondary"
              ariaLabel={`Delete saved query: ${query}`}
              onClick={() => typeof onDelete === 'function' && onDelete(query)}
            >
              ×
            </NvButton>
          </div>
        </div>
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// NvKnowledgeTrailItem
// ---------------------------------------------------------------------------

const TRAIL_BADGE_VARIANT = {
  search: 'info',
  rerun_query: 'info',
  pin: 'success',
  unpin: 'warning',
  compile_query: 'neutral',
  compile_ref: 'neutral',
  open: 'neutral',
  select_node: 'neutral',
}

export function NvKnowledgeTrailItem({ event, onRestore }) {
  if (!event) return null
  const { id, type = 'open', label = '', timestamp = '' } = event
  const badgeVariant = TRAIL_BADGE_VARIANT[type] || 'neutral'

  return (
    <li
      className="trail-event"
      tabIndex={0}
      role="button"
      aria-label={`Trail event: ${label} at ${timestamp}. Press Enter to restore.`}
      onClick={() => typeof onRestore === 'function' && onRestore(event)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (typeof onRestore === 'function') onRestore(event)
        }
      }}
    >
      <div className="trail-meta">
        <NvBadge variant={badgeVariant} style={{ fontSize: '0.5rem', padding: '1px 4px', textTransform: 'uppercase' }}>
          {type}
        </NvBadge>
        <span>{timestamp}</span>
      </div>
      <div style={{ marginTop: '2px', lineHeight: 1.3 }}>{label}</div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// NvMemoryLayer — top-level island, renders all four memory columns
// ---------------------------------------------------------------------------
export function NvMemoryLayer({ data = {}, callbacks = {} }) {
  const {
    pinned = [],
    recent = [],
    savedQueries = [],
    trail = [],
    trailSummaryHtml = '',
  } = data

  const {
    onOpenReference,
    onPinReference,
    onUnpinReference,
    onRerunQuery,
    onDeleteQuery,
    onRestoreTrail,
    onClearTrail,
  } = callbacks

  return (
    <div className="memory-grid" id="memory-layer-grid">

      {/* Column 1: Pinned References */}
      <NvMemoryColumn title="Pinned References">
        <ul className="memory-list" aria-label="Pinned references">
          {pinned.length === 0 ? (
            <li>
              <NvEmptyState
                icon={null}
                title="No pinned references"
                subtitle="Pin important references to preserve your research anchors."
                className="nv-empty-state--compact"
              />
            </li>
          ) : (
            pinned.map((item) => (
              <NvPinnedReferenceItem
                key={item.id}
                item={item}
                onOpen={onOpenReference}
                onUnpin={onUnpinReference}
              />
            ))
          )}
        </ul>
      </NvMemoryColumn>

      {/* Column 2: Recently Viewed */}
      <NvMemoryColumn title="Recently Viewed">
        <ul className="memory-list" aria-label="Recently viewed references">
          {recent.length === 0 ? (
            <li>
              <NvEmptyState
                icon={null}
                title="No recent references"
                subtitle="Opened references will appear here for short-term recall."
                className="nv-empty-state--compact"
              />
            </li>
          ) : (
            recent.map((item) => (
              <NvRecentReferenceItem
                key={item.id}
                item={item}
                onOpen={onOpenReference}
                onPin={onPinReference}
              />
            ))
          )}
        </ul>
      </NvMemoryColumn>

      {/* Column 3: Saved Queries */}
      <NvMemoryColumn title="Saved Queries">
        <ul className="memory-list" aria-label="Saved queries">
          {savedQueries.length === 0 ? (
            <li>
              <NvEmptyState
                icon={null}
                title="No saved queries"
                subtitle="Save useful searches to resume recurring investigations."
                className="nv-empty-state--compact"
              />
            </li>
          ) : (
            savedQueries.map((query) => (
              <NvSavedQueryItem
                key={query}
                query={query}
                onRerun={onRerunQuery}
                onDelete={onDeleteQuery}
              />
            ))
          )}
        </ul>
      </NvMemoryColumn>

      {/* Column 4: Knowledge Trail */}
      <NvMemoryColumn
        title="Knowledge Trail"
        trailing={
          typeof onClearTrail === 'function'
            ? (
              <NvButton
                variant="secondary"
                ariaLabel="Clear knowledge trail logs"
                onClick={onClearTrail}
              >
                Clear
              </NvButton>
            )
            : null
        }
      >
        <ul
          className="memory-list"
          style={{ maxHeight: '180px', overflowY: 'auto' }}
          aria-label="Knowledge trail activity log"
        >
          {trail.length === 0 ? (
            <li>
              <NvEmptyState
                icon={null}
                title="No research trail yet"
                subtitle="Your exploration path will appear here as you search, inspect, and compile evidence."
                className="nv-empty-state--compact"
              />
            </li>
          ) : (
            <>
              {trailSummaryHtml && (
                <li
                  className="memory-microvisualization-summary"
                  dangerouslySetInnerHTML={{ __html: trailSummaryHtml }}
                  aria-hidden="true"
                />
              )}
              {trail.map((event) => (
                <NvKnowledgeTrailItem
                  key={event.id}
                  event={event}
                  onRestore={onRestoreTrail}
                />
              ))}
            </>
          )}
        </ul>
      </NvMemoryColumn>

    </div>
  )
}
