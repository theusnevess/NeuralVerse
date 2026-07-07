import type { VisualizationPayload } from "../visualization-foundation/index.ts";
import { freezeInteraction } from "./immutability.ts";
import type { InteractionViewport } from "./types.ts";

export interface ViewportSynchronizationSnapshot {
  readonly payloadId: string;
  readonly rendererIndependent: true;
  readonly viewport: InteractionViewport;
}

export function synchronizeViewport(payload: VisualizationPayload, viewport: InteractionViewport): ViewportSynchronizationSnapshot {
  return freezeInteraction({
    payloadId: payload.metadata.payloadId,
    rendererIndependent: true,
    viewport,
  }) as ViewportSynchronizationSnapshot;
}

