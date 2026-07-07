import assert from "node:assert";
import { describe, test } from "node:test";
import { GraphSource } from "../graph-foundation/index.ts";
import { createAtlasPageController } from "./atlas-page-controller.ts";
import type { AtlasCanvasEventTarget, AtlasCanvasHost, AtlasCanvasMount, AtlasViewportPersistenceState } from "./types.ts";
import type { CanvasRenderingContext2DLike } from "../visualization-foundation/index.ts";

describe("NV-700 Phase 6 Atlas application integration", () => {
  test("runs the canonical application pipeline through renderer and interaction lifecycle", () => {
    const host = createRecordingHost();
    const controller = createAtlasPageController({ host });
    const snapshot = controller.start();

    assert.strictEqual(snapshot.status, "ready");
    assert.strictEqual(snapshot.projection, "topology");
    assert.ok(snapshot.nodeCount > 0);
    assert.ok(snapshot.edgeCount > 0);
    assert.ok(snapshot.payloadId);
    assert.ok(snapshot.render?.metrics.drawCalls);
    assert.strictEqual(snapshot.interaction?.selection.selected, null);
    assert.deepStrictEqual(host.states, ["clear", "loading:Preparing Atlas topology", "mount"]);

    controller.destroy();
    assert.strictEqual(controller.snapshot().status, "destroyed");
    assert.strictEqual(host.activeListenerCount(), 0);
  });

  test("persists only projection and viewport coordinates after viewport interaction", async () => {
    const storage = createMemoryStorage({
      projection: "dependency",
      zoom: 1.4,
      pan: { x: 12, y: 24 },
    });
    const host = createRecordingHost();
    const controller = createAtlasPageController({ host, storage });
    const initial = controller.start();

    assert.strictEqual(initial.status, "ready");
    assert.strictEqual(initial.projection, "dependency");
    assert.strictEqual(initial.interaction?.viewport.center.x, 12);
    assert.strictEqual(initial.interaction?.viewport.zoom, 1.4);

    host.eventTarget.dispatch("wheel", { offsetX: 120, offsetY: 90, deltaY: -120, preventDefault() {} });
    await waitForDeferredRender();

    const saved = storage.load();
    assert.strictEqual(saved?.projection, "dependency");
    assert.strictEqual(typeof saved?.zoom, "number");
    assert.deepStrictEqual(Object.keys(saved ?? {}).sort(), ["pan", "projection", "zoom"]);
    assert.deepStrictEqual(Object.keys(saved?.pan ?? {}).sort(), ["x", "y"]);
  });

  test("renders an Atlas-specific empty state before projection when graph has zero nodes", () => {
    const host = createRecordingHost();
    const controller = createAtlasPageController({
      host,
      graphSourceFactory: () => new GraphSource("empty-atlas", "1.0.0"),
    });
    const snapshot = controller.start();

    assert.strictEqual(snapshot.status, "empty");
    assert.strictEqual(snapshot.nodeCount, 0);
    assert.deepStrictEqual(host.states, ["clear", "loading:Preparing Atlas topology", "empty:Atlas has no knowledge entities to render."]);
  });

  test("renders canonical error state with retry and diagnostics identifier", () => {
    let attempts = 0;
    const host = createRecordingHost();
    const controller = createAtlasPageController({
      host,
      diagnostics: { createId: () => "atlas-test-001" },
      graphSourceFactory: () => {
        attempts += 1;
        if (attempts === 1) throw new Error("snapshot unavailable");
        return new GraphSource("empty-atlas", "1.0.0");
      },
    });
    const error = controller.start();

    assert.strictEqual(error.status, "error");
    assert.strictEqual(error.diagnosticsId, "atlas-test-001");
    assert.ok(host.retry);

    host.retry?.();
    assert.strictEqual(controller.snapshot().status, "empty");
  });

  test("attaches and detaches interaction listeners without leaking handlers", () => {
    const host = createRecordingHost();
    const controller = createAtlasPageController({ host });
    controller.start();

    assert.strictEqual(host.activeListenerCount(), 7);
    host.eventTarget.dispatch("click", { offsetX: 1, offsetY: 1, buttons: 0 });
    controller.destroy();

    assert.strictEqual(host.activeListenerCount(), 0);
  });
});

function createRecordingHost(): AtlasCanvasHost & {
  readonly states: string[];
  readonly eventTarget: RecordingEventTarget;
  retry: (() => void) | null;
  activeListenerCount(): number;
} {
  const states: string[] = [];
  const eventTarget = new RecordingEventTarget();
  const canvas = { width: 0, height: 0 };
  const context = createRecordingContext();
  return {
    states,
    eventTarget,
    retry: null,
    showLoading(message) {
      states.push(`loading:${message}`);
    },
    showError(state) {
      states.push(`error:${state.message}:${state.diagnosticsId}`);
      this.retry = state.retry;
    },
    showEmpty(state) {
      states.push(`empty:${state.message}`);
    },
    mountCanvas(): AtlasCanvasMount {
      states.push("mount");
      return { canvas, context, width: 1024, height: 768, devicePixelRatio: 1, eventTarget };
    },
    clear() {
      states.push("clear");
    },
    activeListenerCount() {
      return eventTarget.activeListenerCount();
    },
  };
}

class RecordingEventTarget implements AtlasCanvasEventTarget {
  private readonly listeners = new Map<string, Set<EventListener>>();

  addEventListener(type: string, listener: EventListener): void {
    this.listeners.set(type, new Set([...(this.listeners.get(type) ?? []), listener]));
  }

  removeEventListener(type: string, listener: EventListener): void {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type: string, event: Record<string, unknown>): void {
    for (const listener of this.listeners.get(type) ?? []) {
      listener({ type, ...event } as Event);
    }
  }

  activeListenerCount(): number {
    return [...this.listeners.values()].reduce((sum, group) => sum + group.size, 0);
  }
}

function createMemoryStorage(initial: AtlasViewportPersistenceState | null = null) {
  let state = initial;
  return {
    load() {
      return state;
    },
    save(next: AtlasViewportPersistenceState) {
      state = next;
    },
  };
}

function waitForDeferredRender(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 5));
}

function createRecordingContext(): CanvasRenderingContext2DLike {
  return {
    fillStyle: "#000000",
    strokeStyle: "#000000",
    globalAlpha: 1,
    lineWidth: 1,
    font: "12px sans-serif",
    letterSpacing: "normal",
    textAlign: "left",
    textBaseline: "top",
    save() {},
    restore() {},
    clearRect() {},
    beginPath() {},
    closePath() {},
    rect() {},
    arc() {},
    arcTo() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    fill() {},
    stroke() {},
    fillText() {},
    measureText: (text: string) => ({ width: Math.min(160, text.length * 7) }),
    setLineDash() {},
    translate() {},
    rotate() {},
  };
}
