/**
 * NvResearchPresentation Island
 * =============================
 * Research Presentation Mode — transforms investigation state into
 * a structured, readable narrative.
 *
 * JS owns: research state, timeline, compare, synthesis, evidence, callbacks.
 * React owns: layout, sections, presentation, buttons.
 */

import React from 'react'
import {
  NvBadge,
  NvButton,
  NvChip,
  NvContributionBar,
  NvInspectorSection,
  NvScientificIcon,
  NvEmptyState,
} from './components.jsx'

const ICONS = {
  presentation: 'assets/icons/scientific/inspector/reference-details.svg',
  evidence: 'assets/icons/scientific/evidence/evidence-convergence.svg',
  graph: 'assets/icons/scientific/knowledge-graph/active-neighborhood.svg',
  compare: 'assets/icons/scientific/knowledge-graph/semantic-path.svg',
  synthesis: 'assets/icons/scientific/evidence/synthesis-core.svg',
  session: 'assets/icons/scientific/memory-session/session-timeline.svg',
}

const ROLE_VARIANTS = { Primary: 'success', Supporting: 'info', Compared: 'warning', Pinned: 'neutral', Context: 'neutral' }

function NvPresentationSection({ title, iconPath, children }) {
  return (
    <NvInspectorSection title={title} className="nv-presentation-section">
      {children}
    </NvInspectorSection>
  )
}

export function NvPresentationExecutiveSummary({ executiveSummary = {}, investigation = {} }) {
  return (
    <NvPresentationSection title="Executive Summary" iconPath={ICONS.presentation}>
      <h2>{executiveSummary.title || "Research Investigation"}</h2>
      <p className="nv-presentation-summary-text">{executiveSummary.text}</p>
      {executiveSummary.confidenceLabel && (
        <NvBadge variant="success">{executiveSummary.confidenceLabel}</NvBadge>
      )}
      <div className="nv-presentation-metrics">
        <span className="nv-presentation-metric">
          <strong>{investigation.evidenceCount || 0}</strong> evidence
        </span>
        <span className="nv-presentation-metric">
          <strong>{investigation.comparedReferenceCount || 0}</strong> compared
        </span>
        <span className="nv-presentation-metric">
          <strong>{investigation.pinnedCount || 0}</strong> pinned
        </span>
        <span className="nv-presentation-metric">
          <strong>{investigation.trailEventCount || 0}</strong> events
        </span>
      </div>
    </NvPresentationSection>
  )
}

export function NvPresentationNarrative({ narrative = [] }) {
  if (narrative.length === 0) {
    return (
      <NvPresentationSection title="Research Narrative" iconPath={ICONS.session}>
        <p className="nv-compare-empty">Begin a search to start the research narrative.</p>
      </NvPresentationSection>
    )
  }

  return (
    <NvPresentationSection title="Research Narrative" iconPath={ICONS.session}>
      <div className="nv-presentation-narrative">
        {narrative.map((item, i) => (
          <article key={item.id} className="nv-presentation-narrative-step">
            <span className="nv-presentation-narrative-step__index">{i + 1}</span>
            <div className="nv-presentation-narrative-step__body">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              {item.timestamp && <time className="nv-compare-muted">{item.timestamp}</time>}
            </div>
          </article>
        ))}
      </div>
    </NvPresentationSection>
  )
}

export function NvPresentationTimeline({ narrative = [] }) {
  if (narrative.length === 0) return null;

  return (
    <NvPresentationSection title="Presentation Timeline" iconPath={ICONS.session}>
      <ol className="nv-presentation-timeline">
        {narrative.slice(0, 6).map((item) => (
          <li key={item.id} className="nv-presentation-timeline-event">
            <span className="nv-presentation-timeline-event__marker" />
            <div className="nv-presentation-timeline-event__body">
              <strong>{item.title}</strong>
              {item.timestamp && <time className="nv-compare-muted">{item.timestamp}</time>}
            </div>
          </li>
        ))}
      </ol>
    </NvPresentationSection>
  )
}

export function NvPresentationEvidenceGallery({ evidence = [], callbacks = {} }) {
  if (evidence.length === 0) {
    return (
      <NvPresentationSection title="Evidence Gallery" iconPath={ICONS.evidence}>
        <p className="nv-compare-empty">No evidence compilation available. Compile evidence to include it in the gallery.</p>
      </NvPresentationSection>
    )
  }

  return (
    <NvPresentationSection title="Evidence Gallery" iconPath={ICONS.evidence}>
      <div className="nv-presentation-evidence-grid">
        {evidence.map((item) => (
          <article key={item.id} className="nv-presentation-evidence-card">
            <h4>{item.title}</h4>
            <p className="nv-compare-muted">{item.summary}</p>
            <div className="nv-presentation-evidence-card__meta">
              <NvBadge variant="success">{item.confidenceLabel || "Limited Support"}</NvBadge>
              <span className="nv-compare-muted">{item.supportingReferenceIds.length} supporting references</span>
            </div>
          </article>
        ))}
      </div>
    </NvPresentationSection>
  )
}

export function NvPresentationReferenceList({ references = [], callbacks = {} }) {
  if (references.length === 0) {
    return (
      <NvPresentationSection title="Reference List" iconPath={ICONS.graph}>
        <p className="nv-compare-empty">No references in current investigation.</p>
      </NvPresentationSection>
    )
  }

  const grouped = {}
  references.forEach(ref => {
    const role = ref.role || "Context"
    if (!grouped[role]) grouped[role] = []
    grouped[role].push(ref)
  })
  const roleOrder = ["Primary", "Supporting", "Compared", "Pinned", "Context"]

  return (
    <NvPresentationSection title="Reference List" iconPath={ICONS.graph}>
      <div className="nv-presentation-reference-list">
        {roleOrder.map(role => {
          const items = grouped[role]
          if (!items || items.length === 0) return null
          return (
            <div key={role} className="nv-presentation-reference-group">
              <div className="nv-presentation-reference-group__header">
                <NvBadge variant={ROLE_VARIANTS[role] || "neutral"}>{role}</NvBadge>
                <span className="nv-compare-muted">{items.length} reference{items.length === 1 ? "" : "s"}</span>
              </div>
              <ul className="nv-presentation-reference-items">
                {items.map(ref => (
                  <li key={ref.id} className="nv-presentation-reference-item">
                    <strong>{ref.title}</strong>
                    <span className="nv-compare-muted">{ref.type || "reference"} · {ref.relationshipCount || 0} links</span>
                    {ref.clusterLabel && <NvChip>{ref.clusterLabel}</NvChip>}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </NvPresentationSection>
  )
}

export function NvPresentationComparisonSummary({ comparisons = {} }) {
  if (!comparisons?.comparedReferences?.length) {
    return (
      <NvPresentationSection title="Comparison Summary" iconPath={ICONS.compare}>
        <p className="nv-compare-empty">No comparison set is currently active.</p>
      </NvPresentationSection>
    )
  }

  return (
    <NvPresentationSection title="Comparison Summary" iconPath={ICONS.compare}>
      <p className="nv-compare-muted">
        {comparisons.comparedReferences.length} references compared.
        {comparisons.convergenceSummary && ` ${comparisons.convergenceSummary}`}
        {comparisons.divergenceSummary && ` ${comparisons.divergenceSummary}`}
      </p>
      {comparisons.uniqueConceptsByReference?.length > 0 && (
        <div className="nv-presentation-comparison-grid">
          {comparisons.uniqueConceptsByReference.map((item) => (
            <div key={item.referenceId} className="nv-presentation-comparison-ref">
              <strong>{item.referenceId}</strong>
              <div className="nv-compare-chip-row">
                {item.uniqueConcepts.map((concept) => (
                  <NvChip key={concept} variant="accent">{concept}</NvChip>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </NvPresentationSection>
  )
}

export function NvPresentationConvergenceMap({ synthesis = {} }) {
  if (!synthesis?.summary) return null
  return (
    <NvPresentationSection title="Convergence / Divergence" iconPath={ICONS.synthesis}>
      <p className="nv-compare-muted">{synthesis.summary}</p>
      <div className="nv-presentation-convergence-metrics">
        {synthesis.sharedSupportCount > 0 && (
          <NvBadge variant="info">{synthesis.sharedSupportCount} shared support</NvBadge>
        )}
        {synthesis.divergentNoteCount > 0 && (
          <NvBadge variant="warning">{synthesis.divergentNoteCount} divergent notes</NvBadge>
        )}
        {synthesis.confidenceLabel && (
          <NvBadge variant="success">{synthesis.confidenceLabel}</NvBadge>
        )}
      </div>
    </NvPresentationSection>
  )
}

export function NvPresentationSessionState({ investigation = {} }) {
  return (
    <NvPresentationSection title="Session State" iconPath={ICONS.session}>
      <div className="nv-presentation-session-grid">
        <div className="nv-presentation-session-metric">
          <strong>{investigation.activeQuery || "None"}</strong>
          <span className="nv-compare-muted">Active query</span>
        </div>
        <div className="nv-presentation-session-metric">
          <strong>{investigation.selectedReferenceTitle || "None"}</strong>
          <span className="nv-compare-muted">Selected reference</span>
        </div>
        <div className="nv-presentation-session-metric">
          <strong>{investigation.pinnedCount || 0}</strong>
          <span className="nv-compare-muted">Pinned</span>
        </div>
        <div className="nv-presentation-session-metric">
          <strong>{investigation.evidenceCount || 0}</strong>
          <span className="nv-compare-muted">Evidence</span>
        </div>
        <div className="nv-presentation-session-metric">
          <strong>{investigation.comparedReferenceCount || 0}</strong>
          <span className="nv-compare-muted">Compared</span>
        </div>
        <div className="nv-presentation-session-metric">
          <strong>{investigation.trailConceptCount || 0}</strong>
          <span className="nv-compare-muted">Concepts</span>
        </div>
      </div>
    </NvPresentationSection>
  )
}

export function NvPresentationSnapshotBlock({ data = {}, callbacks = {} }) {
  const { executiveSummary = {}, investigation = {}, references = [], evidence = [], comparisons, synthesis, createdAt } = data

  const lines = [
    `=== Research Presentation Snapshot ===`,
    executiveSummary.title || "Research Investigation",
    executiveSummary.text || "",
    ``,
    `Active query: ${investigation.activeQuery || "none"}`,
    `Selected reference: ${investigation.selectedReferenceTitle || "none"}`,
    `Evidence: ${investigation.evidenceCount || 0} | Compared: ${investigation.comparedReferenceCount || 0} | Pinned: ${investigation.pinnedCount || 0}`,
    ``,
    `=== References (${references.length}) ===`,
    ...references.map(r => `- [${r.role}] ${r.title} (${r.type || "reference"})`),
    ``,
    `=== Evidence ===`,
    ...evidence.map(e => `- ${e.title}: ${e.confidenceLabel || "Limited Support"}`),
    ``,
    comparisons ? `Comparison: ${comparisons.comparedReferences.length} references. ${comparisons.convergenceSummary || ""}` : ``,
    synthesis ? `Synthesis: ${synthesis.confidenceLabel || "Limited Support"} — ${synthesis.sharedSupportCount || 0} shared, ${synthesis.divergentNoteCount || 0} divergent.` : ``,
    ``,
    `Generated: ${createdAt || ""}`,
  ].filter(Boolean)

  const block = lines.join("\n")

  return (
    <NvPresentationSection title="Export-Ready Snapshot" iconPath={ICONS.presentation}>
      <pre className="nv-synthesis-export-block">{block}</pre>
      <div className="nv-synthesis-export-actions">
        <NvButton variant="secondary" onClick={() => {
          try { navigator.clipboard?.writeText?.(block) } catch (_) {}
        }}>Copy Snapshot</NvButton>
        <NvButton variant="ghost" disabled={true} ariaLabel="Export PDF — Future">Export PDF</NvButton>
        <NvButton variant="ghost" disabled={true} ariaLabel="Export Markdown — Future">Export Markdown</NvButton>
      </div>
    </NvPresentationSection>
  )
}

export function NvPresentationActions({ actions = {}, callbacks = {} }) {
  return (
    <div className="nv-presentation-actions" aria-label="Presentation actions">
      <NvButton variant="primary" onClick={() => callbacks.onCopySnapshot?.()}>
        Copy Snapshot
      </NvButton>
      <NvButton variant="ghost" onClick={() => window.switchExplorationMode?.("search")}>
        Return to Workspace
      </NvButton>
      {actions.canOpenCompare && (
        <NvButton variant="ghost" onClick={() => window.switchExplorationMode?.("compare")}>
          Return to Compare
        </NvButton>
      )}
    </div>
  )
}

export function NvResearchPresentation({ data = {}, callbacks = {} }) {
  const {
    id,
    createdAt,
    executiveSummary = {},
    investigation = {},
    narrative = [],
    references = [],
    evidence = [],
    comparisons,
    synthesis,
    actions = {},
  } = data

  if (!id) {
    return (
      <section className="nv-research-presentation" aria-label="Research Presentation">
        <NvEmptyState
          title="No research session active"
          subtitle="Begin a search, compile evidence, and create comparisons to build a research presentation."
          icon={<NvScientificIcon iconPath={ICONS.presentation} size="lg" />}
        />
      </section>
    )
  }

  return (
    <section className="nv-research-presentation" aria-labelledby="nv-presentation-title">
      <header className="nv-research-presentation__header">
        <div className="nv-research-presentation__heading">
          <NvScientificIcon iconPath={ICONS.presentation} size="md" />
          <div>
            <p className="nv-compare-eyebrow">Research Presentation Mode</p>
            <h2 id="nv-presentation-title">Research Briefing</h2>
          </div>
        </div>
        <NvPresentationActions actions={actions} callbacks={callbacks} />
      </header>

      <div className="nv-research-presentation__body">
        <NvPresentationExecutiveSummary executiveSummary={executiveSummary} investigation={investigation} />
        <NvPresentationSessionState investigation={investigation} />
        <NvPresentationTimeline narrative={narrative} />
        <NvPresentationNarrative narrative={narrative} />
        <NvPresentationEvidenceGallery evidence={evidence} callbacks={callbacks} />
        <NvPresentationReferenceList references={references} callbacks={callbacks} />
        <NvPresentationComparisonSummary comparisons={comparisons} />
        <NvPresentationConvergenceMap synthesis={synthesis} />
        <NvPresentationSnapshotBlock data={data} callbacks={callbacks} />
      </div>
    </section>
  )
}
