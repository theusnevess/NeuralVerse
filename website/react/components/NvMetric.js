/**
 * NvMetric
 * ========
 * Renders a single inline metric chip (e.g. "14 relationships", "High relevance").
 * Maps to the `.nv-hover-preview__metrics span` token pattern already in CSS.
 *
 * Props
 * -----
 *   label     {string}  Display text
 *   className {string}
 */

import React from "../../vendor/react.esm.js";

export function NvMetric({ label, className = "" }) {
  if (!label) return null;
  return React.createElement(
    "span",
    { className: `nv-metric ${className}`.trim() },
    label
  );
}
