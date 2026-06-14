/**
 * NvHoverPreview Island
 * =====================
 * First production React island.  Renders the Rich Hover Preview overlay.
 *
 * Island Ownership Split
 * ----------------------
 *   This island OWNS:
 *     Layout, structure, icon, badge, microvisualisation wrapper,
 *     action buttons, ARIA semantics, Escape-key focus-restore.
 *
 *   The EXISTING JS LAYER owns:
 *     Activation timing, position calculation, payload construction,
 *     open/pin/close business logic, persistence, selection, retrieval.
 *
 * Props (IslandProps contract)
 * ----------------------------
 *   data: {
 *     type        {string}   "reference" | "relationship" | "query" | "trail"
 *     eyebrow     {string}   Small label above the title
 *     title       {string}
 *     description {string}
 *     iconPath    {string}   Relative asset path
 *     metrics     {string[]} Array of metric label strings
 *     microvisualizations  {string}  Pre-built HTML from JS layer
 *     actions     {Array<{action,label,id,variant}>}
 *   }
 *   callbacks: {
 *     onAction    {(action, id) => void}  Dispatched when a button is clicked
 *   }
 */

import React, { useEffect, useRef } from "../../vendor/react.esm.js";
import { NvScientificIcon } from "../../components/NvScientificIcon.js";
import { NvBadge } from "../../components/NvBadge.js";
import { NvMicroViz } from "../../components/NvMicroViz.js";
import { NvButton } from "../../components/NvButton.js";

const DEFAULT_ICON = "assets/icons/scientific/inspector/reference-details.svg";

export function NvHoverPreview({ data = {}, callbacks = {} }) {
  const sectionRef = useRef(null);

  const {
    type = "reference",
    eyebrow = "Preview",
    title = "Untitled reference",
    description = "",
    iconPath = DEFAULT_ICON,
    metrics = [],
    microvisualizations = "",
    actions = [],
  } = data;

  const { onAction } = callbacks;

  // Respect prefers-reduced-motion by reading the media query
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Apply entry animation class once mounted
  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = sectionRef.current;
    if (el) {
      // The existing .nv-hover-preview CSS handles the opacity/scale transition
      // via the parent .nv-hover-preview-layer.is-visible rule.
      // No additional JS animation is required here.
    }
  }, []);

  const handleAction = (action, id) => {
    if (typeof onAction === "function") {
      onAction(action, id);
    }
  };

  return React.createElement(
    "section",
    {
      ref: sectionRef,
      className: `nv-hover-preview nv-hover-preview--${type}`,
      role: "region",
      "aria-label": title,
    },

    // Header: icon + eyebrow
    React.createElement(
      "div",
      { className: "nv-hover-preview__header" },
      React.createElement(
        "span",
        { className: "nv-hover-preview__icon" },
        React.createElement(NvScientificIcon, {
          iconPath,
          size: "md",
        })
      ),
      React.createElement(
        "span",
        { className: "nv-hover-preview__eyebrow" },
        eyebrow
      )
    ),

    // Title
    React.createElement(
      "h3",
      { className: "nv-hover-preview__title" },
      title
    ),

    // Description
    description &&
      React.createElement(
        "p",
        { className: "nv-hover-preview__description" },
        description
      ),

    // Microvisualizations (pre-rendered HTML from JS layer)
    microvisualizations &&
      React.createElement(NvMicroViz, {
        html: microvisualizations,
        ariaLabel: "Reference microvisualizations",
      }),

    // Metrics
    metrics.length > 0 &&
      React.createElement(
        "div",
        { className: "nv-hover-preview__metrics" },
        ...metrics.map((metric, i) =>
          React.createElement("span", { key: i }, metric)
        )
      ),

    // Action buttons
    actions.length > 0 &&
      React.createElement(
        "div",
        { className: "nv-hover-preview__actions" },
        ...actions.map((item, i) =>
          React.createElement(
            NvButton,
            {
              key: i,
              variant: item.variant || "secondary",
              className: "nv-hover-preview__action",
              onClick: () => handleAction(item.action, item.id),
              // data attributes forwarded for any legacy CSS selectors
            },
            item.label
          )
        )
      )
  );
}
