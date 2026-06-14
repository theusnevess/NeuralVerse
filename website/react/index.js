/**
 * NeuralVerse React Layer — Public API
 * =====================================
 * This is the single entry point that the existing JS application and
 * `index.html` script tag loads.  It exposes the bridge and the islands
 * catalogue via `window.NeuralVerse.react`.
 *
 * Usage from vanilla JS
 * ---------------------
 *   // After the script tag loads:
 *   const { mount, update, unmount } = window.NeuralVerse.react.bridge;
 *   const { NvHoverPreview } = window.NeuralVerse.react.islands;
 *
 *   mount(container, NvHoverPreview, { data, callbacks });
 *   update(container, NvHoverPreview, { data: newData, callbacks });
 *   unmount(container);
 */

import { mount, update, unmount } from "./utils/bridge.js";
import { NvHoverPreview } from "./islands/NvHoverPreview.js";

// Shared component exports (for future host-page usage)
export { NvButton }   from "./components/NvButton.js";
export { NvBadge }    from "./components/NvBadge.js";
export { NvChip }     from "./components/NvChip.js";
export { NvMetric }   from "./components/NvMetric.js";
export { NvMicroViz } from "./components/NvMicroViz.js";
export { NvCardShell } from "./components/NvCardShell.js";
export { NvEmptyState } from "./components/NvEmptyState.js";
export { NvSectionHeader } from "./components/NvSectionHeader.js";
export { NvScientificIcon } from "./components/NvScientificIcon.js";

// Island exports
export { NvHoverPreview };

// Bridge exports
export { mount, update, unmount };

// Publish to global namespace so non-module scripts can access
window.NeuralVerse = window.NeuralVerse || {};
window.NeuralVerse.react = {
  bridge: { mount, update, unmount },
  islands: { NvHoverPreview },
};

if (window.NV_DEBUG) {
  console.log("[NeuralVerse React] Island layer initialized.", {
    islands: Object.keys(window.NeuralVerse.react.islands),
  });
}
