/**
 * NvEmptyState
 * ============
 * Stateless empty-state block.  Maps to `.nv-empty-state` token pattern.
 *
 * Props
 * -----
 *   icon      {string}  Emoji or unicode glyph
 *   title     {string}
 *   subtitle  {string}
 *   actions   {ReactNode}  Optional CTA slot
 *   className {string}
 */

import React from "../../vendor/react.esm.js";

export function NvEmptyState({ icon, title, subtitle, actions, className = "" }) {
  return React.createElement(
    "div",
    { className: `nv-empty-state ${className}`.trim() },
    icon &&
      React.createElement(
        "div",
        { className: "nv-empty-state-icon", "aria-hidden": "true" },
        icon
      ),
    title &&
      React.createElement(
        "p",
        {
          className: "nv-muted",
          style: {
            fontSize: "var(--sys-font-body-size)",
            fontWeight: "var(--ref-font-weight-medium)",
            color: "var(--sys-color-text-primary)",
            marginBottom: "var(--sys-space-stack-xs)",
          },
        },
        title
      ),
    subtitle &&
      React.createElement(
        "p",
        {
          className: "nv-muted",
          style: { fontSize: "var(--sys-font-caption-size)", margin: 0 },
        },
        subtitle
      ),
    actions &&
      React.createElement(
        "div",
        { className: "graph-empty-actions", style: { marginTop: "var(--sys-space-stack-sm)" } },
        actions
      )
  );
}
