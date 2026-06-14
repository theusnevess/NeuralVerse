/**
 * NvScientificIcon
 * ================
 * Renders a NeuralVerse scientific icon using the existing CSS mask system.
 * Consumes the `--nv-scientific-icon-url` custom property strategy already
 * established in scientific-icons.css.
 *
 * Props
 * -----
 *   iconPath  {string}  Path to the SVG icon asset, e.g.
 *                       "assets/icons/scientific/inspector/reference-details.svg"
 *   className {string}  Additional CSS classes
 *   label     {string}  aria-label for the icon span (default: hidden)
 *   size      {"sm"|"md"|"lg"}  Predefined size token (default: "md")
 */

import React from "../../vendor/react.esm.js";

const SIZE_MAP = {
  sm: "1rem",
  md: "1.1rem",
  lg: "1.35rem",
};

export function NvScientificIcon({ iconPath, className = "", label, size = "md" }) {
  const resolvedPath = String(iconPath || "").startsWith("/")
    ? iconPath
    : `/${iconPath}`;

  const dimensionStyle = SIZE_MAP[size] ?? SIZE_MAP.md;

  return React.createElement("span", {
    className: `nv-scientific-icon nv-discovery-panel__icon-glyph ${className}`.trim(),
    style: {
      "--nv-scientific-icon-url": `url('${resolvedPath}')`,
      display: "inline-block",
      width: dimensionStyle,
      height: dimensionStyle,
    },
    "aria-hidden": label ? undefined : "true",
    "aria-label": label ?? undefined,
    role: label ? "img" : undefined,
  });
}
