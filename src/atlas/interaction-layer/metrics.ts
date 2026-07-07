import { freezeInteraction } from "./immutability.ts";
import type { InteractionMetrics } from "./types.ts";

export class AtlasInteractionMetrics {
  private selections = 0;
  private hoverEvents = 0;
  private viewportMoves = 0;
  private zoomCount = 0;
  private selectionStartedAt: number | null = null;
  private selectionDurationMs = 0;
  private interactionLatencyMs = 0;
  private hitTestLatencyMs = 0;
  private dragLatencyMs = 0;
  private wheelLatencyMs = 0;
  private selectionLatencyMs = 0;

  recordSelection(now: number): void {
    this.closeSelection(now);
    this.selections += 1;
    this.selectionStartedAt = now;
  }

  clearSelection(now: number): void {
    this.closeSelection(now);
    this.selectionStartedAt = null;
  }

  recordHover(): void {
    this.hoverEvents += 1;
  }

  recordViewportMove(): void {
    this.viewportMoves += 1;
  }

  recordZoom(): void {
    this.zoomCount += 1;
  }

  recordInteractionLatency(ms: number): void {
    this.interactionLatencyMs = rollingMax(this.interactionLatencyMs, ms);
  }

  recordHitTestLatency(ms: number): void {
    this.hitTestLatencyMs = rollingMax(this.hitTestLatencyMs, ms);
  }

  recordDragLatency(ms: number): void {
    this.dragLatencyMs = rollingMax(this.dragLatencyMs, ms);
  }

  recordWheelLatency(ms: number): void {
    this.wheelLatencyMs = rollingMax(this.wheelLatencyMs, ms);
  }

  recordSelectionLatency(ms: number): void {
    this.selectionLatencyMs = rollingMax(this.selectionLatencyMs, ms);
  }

  snapshot(now: number): InteractionMetrics {
    const activeSelection = this.selectionStartedAt === null ? 0 : Math.max(0, now - this.selectionStartedAt);
    return freezeInteraction({
      selections: this.selections,
      hoverEvents: this.hoverEvents,
      viewportMoves: this.viewportMoves,
      zoomCount: this.zoomCount,
      selectionDurationMs: this.selectionDurationMs + activeSelection,
      interactionLatencyMs: this.interactionLatencyMs,
      hitTestLatencyMs: this.hitTestLatencyMs,
      dragLatencyMs: this.dragLatencyMs,
      wheelLatencyMs: this.wheelLatencyMs,
      selectionLatencyMs: this.selectionLatencyMs,
    }) as InteractionMetrics;
  }

  private closeSelection(now: number): void {
    if (this.selectionStartedAt !== null) this.selectionDurationMs += Math.max(0, now - this.selectionStartedAt);
  }
}

function rollingMax(previous: number, next: number): number {
  return Math.max(previous, Math.max(0, next));
}
