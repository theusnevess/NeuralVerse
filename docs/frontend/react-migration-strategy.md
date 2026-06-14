# React Migration Strategy

## NV-500-UX-007E.2 — Incremental Migration Playbook

---

## Strategic Principles

1. **Never break the existing application.** Each migration slice must leave the vanilla-JS baseline fully functional.
2. **Islands first.** Migrate isolated overlay components before embedded content areas.
3. **Bridge is the seam.** All JS↔React communication goes through the bridge API.
4. **Token fidelity.** Every migrated component must consume the existing design token system.
5. **QA parity.** Each completed slice requires browser QA at 390px / 768px / 1024px / 1440px.

---

## Completed Slices

### ✅ Slice 1 — Minimal React Foundation

**Deliverables:**
- `react-build/` — Local Vite build package for React islands
- `react-build/src/index.jsx` — Public bundle entry + `window.NeuralVerse.react` registration
- `react-build/src/bridge.js` — Idempotent mount/update/unmount API
- `website/dist/react-islands.js` — Self-contained local runtime bundle
- `website/index.html` — Non-blocking deferred bundle load

**Approach:** Local bundle. No CDN runtime dependency.

---

### ✅ Slice 2 — Shared Component Foundation

**Deliverables:**

| Component | Maps to CSS | Notes |
|---|---|---|
| `NvScientificIcon` | `--nv-scientific-icon-url` mask | Size tokens: sm/md/lg |
| `NvButton` | `.nv-button[data-variant]` | Keyboard-accessible |
| `NvBadge` | `.nv-badge[data-variant]` | Stateless |
| `NvChip` | `.continuation-chip` / `.nv-chip` | Renders as button when interactive |
| `NvMetric` | `.nv-hover-preview__metrics span` | Nullable (returns null for empty label) |
| `NvMicroViz` | `.nv-hover-preview__microviz` | dangerouslySetInnerHTML guarded wrapper |
| `NvCardShell` | `.nv-card[.nv-card--selected]` | Keyboard activation included |
| `NvEmptyState` | `.nv-empty-state` | Slots for icon/title/subtitle/actions |
| `NvSectionHeader` | `.discovery-section-title` | Leverages CSS ::after decoration |

---

### ✅ Slice 3 — First Production Island: NvHoverPreview

**Island file:** `react-build/src/NvHoverPreview.jsx`

**Bridge integration:** `website/scripts/retrieval-playground.js`  
→ `createRichHoverPreviewController()` → `show()` function

**Ownership split:**

| React owns | JS layer owns |
|---|---|
| Layout, structure, ARIA | Payload construction |
| Icon, badge, button rendering | Hover timing (180ms delay) |
| NvMicroViz HTML wrapper | Position calculation |
| Action button click forwarding | selectReference(), pinReference() |
| Section semantics | saveWorkspaceState() |
| Escape / focus-restore | All retrieval operations |

**Fallback:** If `window.NeuralVerse.react` is `undefined` at call time, the show() function falls back to the original `layer.innerHTML = renderRichPreview(payload)` path. Behavior is functionally identical.

---

## Upcoming Slices

### 🔲 Slice 4 — NvDiscoveryCard Island

**Target:** `renderDiscoveryPanel()` in `retrieval-playground.js`  
**Risk:** Low — discovery panel is isolated, currently rendered via innerHTML into a stack  
**Pre-condition:** NvHoverPreview island passes QA at all breakpoints

---

### 🔲 Slice 5 — Inspector Presentation Blocks

**Target:** Reference inspector, Evidence inspector, Relationship inspector panels  
**Risk:** Medium — these panels have multiple render paths and animation  
**Pre-condition:** NvDiscoveryCard passes QA

---

### 🔲 Slice 6 — Memory Layer Cards

**Target:** Pinned references list, Recently Viewed list, Saved Queries list, Knowledge Trail  
**Risk:** Medium — must not touch persistence or trail append logic  
**Pre-condition:** Inspector panels pass QA

---

### 🔲 Slice 7 — Settings / Preferences UI

**Target:** Preferences panel, Quick Actions customizer  
**Risk:** Low — fully presentational  
**Pre-condition:** Can be done independently after Slice 4

---

## Migration Checklist Per Slice

```
[ ] Branch created
[ ] Island file created in react-build/src/
[ ] Props interface documented
[ ] Component uses only existing CSS classes
[ ] bridge.mount() call added to JS layer
[ ] Vanilla-JS fallback preserved
[ ] prefers-reduced-motion respected
[ ] Keyboard navigation tested
[ ] Screen reader semantics reviewed
[ ] Browser QA: 390px ✓ 768px ✓ 1024px ✓ 1440px ✓
[ ] No console.error at any viewport
[ ] No horizontal overflow
[ ] Existing interactions unchanged
[ ] git diff --check passes
[ ] Commit hash recorded
```

---

## Boundaries Never to Cross

```
❌ React Router
❌ Redux / Zustand / MobX / any global React store
❌ TailwindCSS / Material UI / Bootstrap
❌ Graph rendering (force-directed simulation)
❌ Retrieval Engine
❌ Evidence Compiler
❌ Reference Registry
❌ localStorage / sessionStorage ownership
❌ Router ownership
❌ fetch() inside islands
❌ Direct DOM mutations outside the island container
```

If any slice requires crossing these boundaries, **stop and report** before implementing.
