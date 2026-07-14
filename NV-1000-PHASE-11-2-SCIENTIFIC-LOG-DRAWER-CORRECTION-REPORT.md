# NV-1000 Phase 11.2 Scientific Log Drawer Correction

## Root Cause

The log reused `.nv-lab-ws-collapsible` and its body shared historical Phase 5-10 rules with other disclosure surfaces. Competing `overflow`, `max-height`, border, grid, and old log positioning declarations caused the body to remain visually associated with unrelated drawer content.

## Corrected Ownership

`[data-lab-log]` is now an isolated `.nv-lab-drawer--log` section. Its only children are the log header and `[data-lab-log-body]`; log entries live exclusively inside `[data-lab-log-entries]`. The rendered log is moved into the drawer layer after Inspector details and before research/continuations.

## State and Entries

- Collapsed state uses `display: none` for the log body, removing it from visual, layout, and keyboard flow.
- Expanded state has a bounded `280px` vertical entry surface without horizontal scroll.
- Entries use Timestamp, Event Type, Message markup and safe escaped values.
- Count remains an event counter. Change-detector events can legitimately make it greater than rendered step rows.

## Validation

| Check | Result |
| --- | --- |
| Syntax checks | Pass |
| Laboratory validator | Pass, 300 checks |
| Phase 11.2 + relevant contracts | Pass, 61 tests |
| Screenshot inspection | Desktop and mobile final screenshots inspected |
| Full Laboratory audit | Pass, 351 tests |

## Screenshots

Final screenshots are stored in `test-results/nv-1000-phase-11-2/final/`:

- `log-desktop-collapsed.png`
- `log-desktop-expanded.png`
- `log-desktop-with-parameters-open.png`
- `log-tablet-expanded.png`
- `log-mobile-390-expanded.png`
- `log-mobile-360-expanded.png`

## Remaining Risk

Historical log selectors remain in the stylesheet for legacy routes. The new log DOM does not use their generic collapsible classes; a deletion-only stylesheet consolidation remains advisable.

## Final Verdict

The Scientific Log is structurally isolated, has explicit collapsed and expanded states, remains in workspace flow, and passes focused DOM, geometry, interaction, responsive, and accessibility coverage.
