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
  NvMemoryCard,
  NvMicroViz,
  NvScientificIcon,
} from './components.jsx'

// ---------------------------------------------------------------------------
// NvMemoryColumn — single column wrapper
// ---------------------------------------------------------------------------
export function NvMemoryColumn({ title, trailing, children, className = '' }) {
  return (
    <section className={`memory-column nv-memory-dashboard__section ${className}`.trim()} aria-labelledby={title ? `memory-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined}>
      {title && (
        <div className="nv-memory-section-header">
          <div className="nv-memory-section-heading">
            <span className="nv-memory-section-label">Memory</span>
            <h4 id={`memory-${title.toLowerCase().replace(/\s+/g, '-')}`}>{title}</h4>
          </div>
          {trailing}
        </div>
      )}
      {children}
    </section>
  )
}

function relationshipDensityLabel(count = 0) {
  if (count >= 3) return 'Dense Cluster'
  if (count > 0) return 'Linked Reference'
  return 'Quiet Node'
}

function relationshipDensityLevel(count = 0) {
  if (count >= 4) return 4
  if (count >= 2) return 3
  if (count >= 1) return 2
  return 1
}

function compactTrailLabel(label = '') {
  return String(label)
    .replace(/^Searched for /i, 'Search ')
    .replace(/^Opened /i, 'Opened ')
    .replace(/^Pinned /i, 'Pinned ')
    .replace(/^Unpinned /i, 'Unpinned ')
    .replace(/^Compiled evidence from /i, 'Compiled ')
}

function MemoryStatusChip({ icon, label, value }) {
  return (
    <span className="nv-memory-status-chip" aria-label={`${label}: ${value}`}>
      <span aria-hidden="true">{icon}</span>
      <strong>{value}</strong>
    </span>
  )
}

const TRAIL_ICON_PATH = {
  search: 'assets/icons/scientific/search-discovery/query-signal.svg',
  rerun_query: 'assets/icons/scientific/search-discovery/research-lens.svg',
  pin: 'assets/icons/scientific/collections/pinned-references.svg',
  unpin: 'assets/icons/scientific/collections/pinned-references.svg',
  compile_query: 'assets/icons/scientific/evidence/synthesis-core.svg',
  compile_ref: 'assets/icons/scientific/evidence/evidence-convergence.svg',
  open: 'assets/icons/scientific/inspector/reference-details.svg',
  select_node: 'assets/icons/scientific/knowledge-graph/active-neighborhood.svg',
}

// ---------------------------------------------------------------------------
// NvPinnedReferenceItem
// ---------------------------------------------------------------------------
export function NvPinnedReferenceItem({ item, onOpen, onUnpin }) {
  if (!item) return null
  const { id, title, type, relationshipCount = 0 } = item

  return (
    <li className="memory-panel-item">
      <NvMemoryCard
        title={title}
        subtitle={relationshipDensityLabel(relationshipCount)}
        meta={[<NvBadge key="type" variant="info">{type || 'reference'}</NvBadge>, `${relationshipCount} link${relationshipCount === 1 ? '' : 's'}`]}
        iconPath="assets/icons/scientific/collections/pinned-references.svg"
        className="nv-memory-pinned-card nv-memory-card--compact"
        ariaLabel={`Pinned reference: ${title}`}
        actions={(
          <>
            <NvButton variant="ghost" className="nv-memory-action" ariaLabel={`Open pinned reference: ${title}`} onClick={() => typeof onOpen === 'function' && onOpen(id)}>Open</NvButton>
            <NvButton variant="ghost" className="nv-memory-action" ariaLabel={`Unpin reference: ${title}`} onClick={() => typeof onUnpin === 'function' && onUnpin(id)}>Unpin</NvButton>
          </>
        )}
      />
    </li>
  )
}

// ---------------------------------------------------------------------------
// NvRecentReferenceItem
// ---------------------------------------------------------------------------
export function NvRecentReferenceItem({ item, onOpen, onPin }) {
  if (!item) return null
  const { id, title, type, relationshipCount = 0 } = item
  const densityLabel = relationshipDensityLabel(relationshipCount)

  return (
    <li className="memory-panel-item">
      <NvMemoryCard
        title={title}
        subtitle="Viewed recently"
        meta={[<NvBadge key="type" variant="info">{type || 'reference'}</NvBadge>, densityLabel]}
        iconPath="assets/icons/scientific/memory-session/recent-activity.svg"
        className="nv-memory-recent-card nv-memory-card--compact"
        ariaLabel={`Recently viewed reference: ${title}`}
        actions={(
          <>
            <NvContributionBar label={`${densityLabel}: ${relationshipCount} link${relationshipCount === 1 ? '' : 's'}`} level={relationshipDensityLevel(relationshipCount)} max={4} className="nv-memory-density" />
            <NvButton variant="ghost" className="nv-memory-action" ariaLabel={`Open recently viewed: ${title}`} onClick={() => typeof onOpen === 'function' && onOpen(id)}>Open</NvButton>
            <NvButton variant="ghost" className="nv-memory-action" ariaLabel={`Pin reference: ${title}`} onClick={() => typeof onPin === 'function' && onPin(id)}>Pin</NvButton>
          </>
        )}
      />
    </li>
  )
}

// ---------------------------------------------------------------------------
// NvSavedQueryItem
// ---------------------------------------------------------------------------
export function NvSavedQueryItem({ item, query: legacyQuery, onRerun, onDelete }) {
  const normalized = typeof item === 'string' ? { query: item } : (item || { query: legacyQuery })
  const { query, matchCount } = normalized
  if (!query) return null

  const matchLabel = Number.isFinite(matchCount)
    ? `${matchCount} current match${matchCount === 1 ? '' : 'es'}`
    : 'Ready to rerun'

  return (
    <li className="memory-panel-item">
      <NvMemoryCard
        title={query}
        subtitle="Saved investigation"
        meta={[matchLabel, 'Registry query']}
        iconPath="assets/icons/scientific/collections/saved-queries.svg"
        className="nv-memory-query-card nv-memory-card--compact"
        ariaLabel={`Saved query: ${query}`}
        actions={(
          <>
            <NvButton variant="ghost" className="nv-memory-action" ariaLabel={`Rerun saved query: ${query}`} onClick={() => typeof onRerun === 'function' && onRerun(query)}>Rerun</NvButton>
            <NvButton variant="ghost" className="nv-memory-action" ariaLabel={`Delete saved query: ${query}`} onClick={() => typeof onDelete === 'function' && onDelete(query)}>Delete</NvButton>
          </>
        )}
      />
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
  const iconPath = TRAIL_ICON_PATH[type] || 'assets/icons/scientific/memory-session/knowledge-trail.svg'

  return (
    <li
      className="trail-event nv-memory-trail-event"
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
      <span className="nv-memory-trail-event__marker" aria-hidden="true">
        <NvScientificIcon iconPath={iconPath} size="sm" />
      </span>
      <div className="nv-memory-trail-event__body">
        <div className="trail-meta nv-memory-trail-event__meta">
          <NvBadge variant={badgeVariant}>{type}</NvBadge>
          <span>{timestamp}</span>
        </div>
        <div className="nv-memory-trail-event__label">{compactTrailLabel(label)}</div>
      </div>
    </li>
  )
}

function NvMemoryEmptyState({ iconPath, title, subtitle, actionLabel, onAction }) {
  return (
    <NvEmptyState
      icon={<NvScientificIcon iconPath={iconPath} size="lg" />}
      title={title}
      subtitle={subtitle}
      className="nv-empty-state--compact nv-memory-empty-state"
      actions={actionLabel && typeof onAction === 'function' ? <NvButton variant="ghost" className="nv-memory-action" onClick={onAction}>{actionLabel}</NvButton> : null}
    />
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
    onToggleCollapse,
    onRunSearchFocus,
  } = callbacks

  return (
    <div className="nv-memory-dashboard">
      <header className="nv-memory-dashboard__header">
        <div className="nv-memory-dashboard__title-group">
          <p className="nv-memory-dashboard__eyebrow">Research Memory</p>
          <h3>Continue your investigation.</h3>
        </div>
        <div className="nv-memory-dashboard__summary" aria-label="Research memory summary">
          <MemoryStatusChip icon="⌖" label="Pinned" value={pinned.length} />
          <MemoryStatusChip icon="◷" label="Recent" value={recent.length} />
          <MemoryStatusChip icon="▱" label="Saved queries" value={savedQueries.length} />
          <MemoryStatusChip icon="◇" label="Knowledge trail" value={trail.length} />
        </div>
        <div className="nv-memory-dashboard__toolbar">
          {typeof onToggleCollapse === 'function' && <NvButton variant="ghost" className="nv-memory-action" ariaLabel="Collapse research memory" onClick={onToggleCollapse}>Collapse</NvButton>}
          {typeof onClearTrail === 'function' && <NvButton variant="ghost" className="nv-memory-action" ariaLabel="Clear knowledge trail logs" onClick={onClearTrail}>Clear</NvButton>}
        </div>
      </header>

      {/* Column 1: Pinned References */}
      <div className="nv-memory-dashboard__row nv-memory-dashboard__row--primary">
      <NvMemoryColumn title="Pinned References" className="nv-memory-section--pinned">
        <ul className="memory-list" aria-label="Pinned references">
          {pinned.length === 0 ? (
            <li>
              <NvMemoryEmptyState
                iconPath="assets/icons/scientific/memory-session/research-archive.svg"
                title="No pinned references"
                subtitle="Pin important references to preserve your research anchors."
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
      <NvMemoryColumn title="Recent Activity" className="nv-memory-section--recent">
        <ul className="memory-list" aria-label="Recently viewed references">
          {recent.length === 0 ? (
            <li>
              <NvMemoryEmptyState
                iconPath="assets/icons/scientific/memory-session/recent-activity.svg"
                title="No recent references"
                subtitle="Opened references will appear here for short-term recall."
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
      </div>

      {/* Column 3: Saved Queries */}
      <div className="nv-memory-dashboard__row nv-memory-dashboard__row--secondary">
      <NvMemoryColumn title="Saved Queries" className="nv-memory-section--queries">
        <ul className="memory-list" aria-label="Saved queries">
          {savedQueries.length === 0 ? (
            <li>
              <NvMemoryEmptyState
                iconPath="assets/icons/scientific/collections/saved-queries.svg"
                title="No saved queries"
                subtitle="Save recurring investigations to resume them later."
                actionLabel="Run Search"
                onAction={onRunSearchFocus}
              />
            </li>
          ) : (
            savedQueries.map((item) => (
              <NvSavedQueryItem
                key={typeof item === 'string' ? item : item.query}
                item={item}
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
        className="nv-memory-section--trail"
        trailing={
          trailSummaryHtml ? <NvMicroViz html={trailSummaryHtml} className="nv-memory-trail-summary" ariaLabel="Session progress and trail sparkline" /> : null
        }
      >
        <ul
          className="memory-list nv-memory-timeline"
          aria-label="Knowledge trail activity log"
        >
          {trail.length === 0 ? (
            <li>
              <NvMemoryEmptyState
                iconPath="assets/icons/scientific/memory-session/knowledge-trail.svg"
                title="No research trail yet"
                subtitle="Your exploration path will appear here as you search, inspect, and compile evidence."
              />
            </li>
          ) : (
            <>
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

    </div>
  )
}
