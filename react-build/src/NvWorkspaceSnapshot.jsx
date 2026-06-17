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
}

function CompactField({ label, value, empty = 'Not set' }) {
  return (
    <div className="nv-workspace-snapshot__field">
      <span>{label}</span>
      <strong>{value || empty}</strong>
    </div>
  )
}

function StatChip({ label, value }) {
  return (
    <span className="nv-research-stat-chip" aria-label={`${label}: ${value}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </span>
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
        <StatChip key={stat.id || stat.label} label={stat.label} value={stat.value} />
      ))}
    </section>
  )
}

export function NvKnowledgePulse({ pulse = {} }) {
  const microvisuals = Array.isArray(pulse.microvisuals) ? pulse.microvisuals.filter(Boolean) : []
  return (
    <section className="nv-knowledge-pulse" aria-label="Knowledge pulse">
      <div className="nv-dashboard-section-title">
        <NvScientificIcon iconPath={ICONS.pulse} size="sm" />
        <span>Knowledge Pulse</span>
      </div>
      <p>{pulse.summary || 'No active research signals yet.'}</p>
      {microvisuals.length > 0 && (
        <div className="nv-knowledge-pulse__signals">
          {microvisuals.map((html, index) => (
            <NvMicroViz key={index} html={html} ariaLabel={`Knowledge pulse signal ${index + 1}`} />
          ))}
        </div>
      )}
    </section>
  )
}

export function NvActivityTimelineMini({ events = [] }) {
  const visibleEvents = events.slice(0, 4)
  return (
    <section className="nv-activity-timeline-mini" aria-label="Recent activity mini timeline">
      <div className="nv-dashboard-section-title">
        <NvScientificIcon iconPath={ICONS.timeline} size="sm" />
        <span>Recent Activity</span>
      </div>
      {visibleEvents.length === 0 ? (
        <p className="nv-activity-timeline-mini__empty">Start a search to begin the trail.</p>
      ) : (
        <ol>
          {visibleEvents.map((event) => (
            <li key={event.id || `${event.type}-${event.timestamp}`}>
              <span className="nv-activity-timeline-mini__type">{event.type}</span>
              <strong>{event.label}</strong>
              <time>{event.timestamp}</time>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export function NvWorkspaceSnapshot({ data = {}, callbacks = {} }) {
  const {
    snapshot = {},
    session = {},
    stats = [],
    pulse = {},
    timeline = [],
    isEmpty = false,
  } = data

  return (
    <section className="nv-workspace-dashboard" aria-labelledby="nv-workspace-dashboard-title">
      <div className="nv-workspace-dashboard__header">
        <div className="nv-workspace-dashboard__heading">
          <NvScientificIcon iconPath={ICONS.snapshot} size="md" />
          <div>
            <span className="nv-workspace-dashboard__eyebrow">Workspace Snapshot</span>
            <h2 id="nv-workspace-dashboard-title">Research Snapshot</h2>
          </div>
        </div>
        {isEmpty && typeof callbacks.onRunSearch === 'function' && (
          <NvButton
            variant="primary"
            className="nv-workspace-dashboard__cta"
            onClick={() => callbacks.onRunSearch()}
            ariaLabel="Focus search to begin the investigation"
          >
            Run Search
          </NvButton>
        )}
      </div>

      <div className="nv-workspace-dashboard__grid">
        <div className="nv-workspace-snapshot">
          <CompactField label="Current Query" value={snapshot.currentQuery} />
          <CompactField label="Selected Reference" value={snapshot.selectedReference} />
          <CompactField label="Focused Cluster" value={snapshot.focusedCluster} />
          <CompactField label="Last Activity" value={snapshot.lastActivity} />
          {snapshot.resumeContext && (
            <p className="nv-workspace-snapshot__resume">{snapshot.resumeContext}</p>
          )}
        </div>

        <NvSessionStatus session={session} />
        <NvResearchStats stats={stats} />
        <NvKnowledgePulse pulse={pulse} />
        <NvActivityTimelineMini events={timeline} />
      </div>
    </section>
  )
}
