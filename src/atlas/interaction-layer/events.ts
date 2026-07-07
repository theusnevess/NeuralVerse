import { freezeInteraction } from "./immutability.ts";
import type { HitTarget, InteractionEvent, InteractionStateName, InteractionViewport } from "./types.ts";

export function nodeSelectedEvent(timestamp: number, state: InteractionStateName, target: HitTarget): InteractionEvent {
  return freezeInteraction({ type: "NodeSelected", timestamp, state, target }) as InteractionEvent;
}

export function selectionClearedEvent(timestamp: number, state: InteractionStateName, previous: HitTarget | null): InteractionEvent {
  return freezeInteraction({ type: "SelectionCleared", timestamp, state, previous }) as InteractionEvent;
}

export function hoverChangedEvent(timestamp: number, state: InteractionStateName, previous: HitTarget | null, current: HitTarget | null): InteractionEvent {
  return freezeInteraction({ type: "HoverChanged", timestamp, state, previous, current }) as InteractionEvent;
}

export function focusChangedEvent(timestamp: number, state: InteractionStateName, previous: HitTarget | null, current: HitTarget | null): InteractionEvent {
  return freezeInteraction({ type: "FocusChanged", timestamp, state, previous, current }) as InteractionEvent;
}

export function viewportMovedEvent(timestamp: number, state: InteractionStateName, viewport: InteractionViewport): InteractionEvent {
  return freezeInteraction({ type: "ViewportMoved", timestamp, state, viewport }) as InteractionEvent;
}

export function viewportZoomedEvent(timestamp: number, state: InteractionStateName, viewport: InteractionViewport): InteractionEvent {
  return freezeInteraction({ type: "ViewportZoomed", timestamp, state, viewport }) as InteractionEvent;
}

