import type { InteractionStateName } from "./types.ts";

const allowed: Record<InteractionStateName, readonly InteractionStateName[]> = {
  Idle: ["Hover", "Selected", "Focused", "Dragging Viewport", "Zooming"],
  Hover: ["Idle", "Selected", "Focused", "Dragging Viewport", "Zooming"],
  Selected: ["Idle", "Hover", "Focused", "Dragging Viewport", "Zooming"],
  Focused: ["Idle", "Hover", "Selected", "Dragging Viewport", "Zooming"],
  "Dragging Viewport": ["Idle", "Hover", "Selected", "Focused"],
  Zooming: ["Idle", "Hover", "Selected", "Focused"],
};

export class AtlasInteractionStateMachine {
  private current: InteractionStateName = "Idle";

  get state(): InteractionStateName {
    return this.current;
  }

  transition(next: InteractionStateName): InteractionStateName {
    if (next === this.current) return this.current;
    if (!allowed[this.current].includes(next)) throw new Error(`Forbidden Atlas interaction state transition: ${this.current} -> ${next}`);
    this.current = next;
    return this.current;
  }
}

