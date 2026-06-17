/**
 * NvWorkspaceSnapshot Island
 * ==========================
 * Compact research dashboard for Retrieval Workspace orientation.
 *
 * JS owns: workspace state, persistence, retrieval, graph, evidence.
 * React owns: presentation, hierarchy, accessible buttons.
 */

import React from 'react'
import {
  NvBadge,
  NvButton,
  NvMicroViz,
  NvScientificIcon,
} from './components.jsx'

const ICONS = {
  snapshot: 'assets/icons/scientific/memory-session/workspace-snapshot.svg',
  session: 'assets/icons/scientific/memory-session/session-timeline.svg',
  pulse: 'assets/icons/scientific/knowledge-graph/active-neighborhood.svg',
  timeline: 'assets/icons/scientific/memory-session/knowledge-trail.svg',
  health: 'assets/icons/scientific/evidence/verified-evidence.svg',
}

function cleanValue(value) {
  if (value === undefined || value === null || value === '') return ''
  return String(value)
}

function CompactField({ label, value }) {
  const displayValue = cleanValue(value)
  if (!displayValue) return null
  return (
    <div className="nv-workspace-snapshot__field">
      <span>{label}</span>
      <strong>{displayValue}</strong>
    </div>
  )
}

function getHealthLabel(health = {}) {
  const total = Number(health.evidenceCount || 0)
    + Number(health.uniqueVisitedCount || 0)
    + Number(health.pinnedCount || 0)
    + Number(health.savedQueryCount || 0)
    + Number(health.trailEventCount || 0)
  if (total >= 24 || health.subgraphDensityLabel === 'Dense') return 'Dense'
  if (total >= 12) return 'Active'
  if (total >= 4) return 'Building'
  return 'Starting'
}

export function NvResearchHealthMetric({ label, value, ariaLabel }) {
  return (
    <span className="nv-research-stat-chip" aria-label={ariaLabel || `${label}: ${value}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </span>
  )
}

export function NvActiveInvestigation({ investigation = {}, isEmpty = false }) {
  const fields = [
    ['Current Query', investigation.currentQuery],
    ['Selected Reference', investigation.selectedReferenceTitle],
    ['Focused Cluster', investigation.focusedCluster],
    ['Exploration Depth', investigation.explorationDepth],
    ['Active Mode', investigation.activeMode],
    ['Last Event', investigation.lastEventLabel],
  ]
  const visibleFields = fields.filter(([, value]) => cleanValue(value))

  return (
    <section className="nv-active-investigation" aria-labelledby="nv-active-investigation-title">
      <div className="nv-dashboard-section-title">
        <NvScientificIcon iconPath={ICONS.snapshot} size="sm" />
        <h3 id="nv-active-investigation-title">Active Investigation</h3>
      </div>
      {isEmpty || visibleFields.length === 0 ? (
        <p className="nv-active-investigation__empty">
          No active investigation yet. Start with a search or open a pinned reference.
        </p>
      ) : (
        <div className="nv-workspace-snapshot">
          {visibleFields.map(([label, value]) => (
            <CompactField key={label} label={label} value={value} />
          ))}
        </div>
      )}
    </section>
  )
}

export function NvResearchHealth({ health = {} }) {
  const healthLabel = getHealthLabel(health)
  const metrics = [
    ['Evidence', health.evidenceCount || 0, 'Evidence compilations'],
    ['Visited', health.uniqueVisitedCount || 0, 'Unique references visited'],
    ['Pinned', health.pinnedCount || 0, 'Pinned references'],
    ['Saved', health.savedQueryCount || 0, 'Saved queries'],
    ['Trail', health.trailEventCount || 0, 'Knowledge trail events'],
  ]
  if (cleanValue(health.subgraphDensityLabel)) {
    metrics.push(['Density', health.subgraphDensityLabel, 'Current subgraph density'])
  }

  return (
    <section className="nv-research-health" aria-labelledby="nv-research-health-title">
      <div className="nv-dashboard-section-title">
        <NvScientificIcon iconPath={ICONS.health} size="sm" />
        <h3 id="nv-research-health-title">Research Health</h3>
        <NvBadge variant="info">{healthLabel}</NvBadge>
      </div>
      <div className="nv-research-stats">
        {metrics.map(([label, value, ariaLabel]) => (
          <NvResearchHealthMetric key={label} label={label} value={value} ariaLabel={`${ariaLabel}: ${value}`} />
        ))}
      </div>
    </section>
  )
}

export function NvSessionStatus({ session = {} }) {
  return (
    <section className="nv-session-status" aria-label="Session status">
      <div className="nv-dashboard-section-title">
        <NvScientificIcon iconPath={ICONS.session} size="sm" />
        <span>Session</span>
      </div>
      <div className="nv-session-status__body">
        <NvBadge variant={session.isActive ? 'success' : 'neutral'}>
          {session.isActive ? 'Active' : 'Ready'}
        </NvBadge>
        <span>{session.lastUpdate || 'No updates yet'}</span>
      </div>
      {session.progressHtml && (
        <NvMicroViz
          html={session.progressHtml}
          className="nv-session-status__progress"
          ariaLabel="Session progress"
        />
      )}
    </section>
  )
}

export function NvResearchStats({ stats = [] }) {
  if (!stats.length) return null
  return (
    <section className="nv-research-stats" aria-label="Research statistics">
      {stats.map((stat) => (
        <NvResearchHealthMetric key={stat.id || stat.label} label={stat.label} value={stat.value} />
      ))}
    </section>
  )
}

export function NvKnowledgePulse({ pulse = {} }) {
  const microvisuals = Array.isArray(pulse.microvisuals) ? pulse.microvisuals.filter(Boolean) : []
  return (
    <section className="nv-knowledge-pulse" aria-labelledby="nv-knowledge-pulse-title">
      <div className="nv-dashboard-section-title">
        <NvScientificIcon iconPath={ICONS.pulse} size="sm" />
        <h3 id="nv-knowledge-pulse-title">Knowledge Pulse</h3>
      </div>
      <p>{pulse.summary || 'No active research signals yet.'}</p>
      {microvisuals.length > 0 && (
        <div className="nv-knowledge-pulse__signals">
          {microvisuals.map((visual, index) => (
            <NvMicroViz
              key={visual.id || index}
              html={visual.html || visual}
              ariaLabel={visual.ariaLabel || `Knowledge pulse signal ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export function NvTimelineEventCompact({ event = {}, onOpen }) {
  const isClickable = typeof onOpen === 'function'
  const content = (
    <>
      <span className="nv-activity-timeline-mini__type">{event.type}</span>
      <strong>{event.label}</strong>
      {event.timestamp && <time>{event.timestamp}</time>}
    </>
  )

  if (isClickable) {
    return (
      <button type="button" className="nv-timeline-event-compact" onClick={() => onOpen(event)}>
        {content}
      </button>
    )
  }

  return <div className="nv-timeline-event-compact">{content}</div>
}

export function NvSessionTimeline({ events = [], onOpenTimelineEvent }) {
  const visibleEvents = events.slice(0, 5)
  return (
    <section className="nv-activity-timeline-mini" aria-labelledby="nv-session-timeline-title">
      <div className="nv-dashboard-section-title">
        <NvScientificIcon iconPath={ICONS.timeline} size="sm" />
        <h3 id="nv-session-timeline-title">Session Timeline</h3>
      </div>
      {visibleEvents.length === 0 ? (
        <p className="nv-activity-timeline-mini__empty">Start a search to begin the trail.</p>
      ) : (
        <ol>
          {visibleEvents.map((event) => (
            <li key={event.id || `${event.type}-${event.timestamp}`}>
              <NvTimelineEventCompact event={event} onOpen={onOpenTimelineEvent} />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export function NvActivityTimelineMini(props) {
  return <NvSessionTimeline {...props} />
}

export function NvSnapshotActions({ actions = {}, callbacks = {} }) {
  const actionItems = [
    ['canResume', 'Resume Investigation', callbacks.onResumeInvestigation, 'primary'],
    ['canCompileCurrentEvidence', 'Compile Current Evidence', callbacks.onCompileCurrentEvidence, 'secondary'],
    ['canSaveQuery', 'Save Query', callbacks.onSaveQuery, 'secondary'],
    ['canOpenPinned', 'Open Pinned Reference', callbacks.onOpenPinned, 'secondary'],
    ['canClearSession', 'Clear Session', callbacks.onClearSession, 'ghost'],
  ].filter(([flag, , callback]) => actions[flag] && typeof callback === 'function')

  if (!actionItems.length) return null
  return (
    <nav className="nv-snapshot-actions" aria-label="Workspace snapshot actions">
      {actionItems.map(([flag, label, callback, variant]) => (
        <NvButton key={flag} variant={variant} onClick={() => callback()}>{label}</NvButton>
      ))}
    </nav>
  )
}

export function NvWorkspaceSnapshot({ data = {}, callbacks = {} }) {
  const {
    activeInvestigation = data.snapshot || {},
    researchHealth = {},
    pulse = {},
    timeline = [],
    actions = {},
    isEmpty = false,
  } = data

  return (
    <section className="nv-workspace-dashboard" aria-labelledby="nv-workspace-dashboard-title">
      <div className="nv-workspace-dashboard__header">
        <div className="nv-workspace-dashboard__heading">
            <NvScientificIcon iconPath={ICONS.snapshot} size="md" />
            <div>
              <span className="nv-workspace-dashboard__eyebrow">Living Research Workspace</span>
              <h2 id="nv-workspace-dashboard-title">Research State</h2>
            </div>
          </div>
        <NvSnapshotActions actions={actions} callbacks={callbacks} />
      </div>

      <div className="nv-workspace-dashboard__grid">
        <NvActiveInvestigation investigation={activeInvestigation} isEmpty={isEmpty} />
        <NvResearchHealth health={researchHealth} />
        <NvKnowledgePulse pulse={pulse} />
        <NvSessionTimeline events={timeline} onOpenTimelineEvent={callbacks.onOpenTimelineEvent} />
      </div>
    </section>
  )
}
