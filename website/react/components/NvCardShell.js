/**
 * NvCardShell
 * ===========
 * A generic card container that maps to `.nv-card` token patterns.
 * Handles hover, selection and focus styles through the existing CSS
 * contract — no hardcoded colors or spacing.
 *
 * Props
 * -----
 *   selected  {boolean}   applies .nv-card--selected
 *   onClick   {Function}
 *   className {string}
 *   children  {ReactNode}
 *   ariaLabel {string}
 *   role      {string}    default: "article"
 */

import React from "../../vendor/react.esm.js";

export function NvCardShell({
  selected = false,
  onClick,
  className = "",
  children,
  ariaLabel,
  role = "article",
}) {
  const selectedClass = selected ? "nv-card--selected" : "";
  const interactiveProps = onClick
    ? {
        onClick,
        tabIndex: 0,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(e);
          }
        },
      }
    : {};

  return React.createElement(
    "div",
    {
      className: `nv-card ${selectedClass} ${className}`.trim(),
      role,
      "aria-label": ariaLabel,
      "aria-selected": selected ? "true" : undefined,
      ...interactiveProps,
    },
    children
  );
}
